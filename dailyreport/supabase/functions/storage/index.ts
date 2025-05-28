// File storage management Edge Function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface UploadRequest {
  file_name: string;
  file_type: string;
  bucket: string;
  folder?: string;
  is_public?: boolean;
}

interface FileMetadata {
  id: string;
  name: string;
  bucket_id: string;
  owner: string;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify user
    const { data: userData, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user profile with role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !userProfile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/storage', '');

    // POST /storage/upload - Generate signed upload URL
    if (req.method === 'POST' && path === '/upload') {
      let uploadData: UploadRequest;
      
      try {
        uploadData = await req.json();
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in request body' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const { file_name, file_type, bucket, folder, is_public = false } = uploadData;

      // Validate required fields
      if (!file_name || !file_type || !bucket) {
        return new Response(
          JSON.stringify({ error: 'file_name, file_type, and bucket are required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check bucket access permissions
      const canUpload = await checkBucketUploadPermission(userProfile.role, bucket);
      if (!canUpload) {
        return new Response(
          JSON.stringify({ error: 'Permission denied for this bucket' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Generate unique file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileExtension = file_name.split('.').pop();
      const baseName = file_name.replace(`.${fileExtension}`, '');
      const uniqueFileName = `${baseName}_${timestamp}.${fileExtension}`;
      
      const filePath = folder 
        ? `${folder}/${userProfile.id}/${uniqueFileName}`
        : `${userProfile.id}/${uniqueFileName}`;

      // Generate signed upload URL
      const { data: signedUrl, error: urlError } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(filePath);

      if (urlError) {
        return new Response(
          JSON.stringify({ error: 'Failed to generate upload URL', details: urlError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          upload_url: signedUrl.signedUrl,
          file_path: filePath,
          token: signedUrl.token,
          expires_in: 3600 // 1 hour
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // GET /storage/download/:bucket/:path - Generate signed download URL
    if (req.method === 'GET' && path.startsWith('/download/')) {
      const pathParts = path.replace('/download/', '').split('/');
      if (pathParts.length < 2) {
        return new Response(
          JSON.stringify({ error: 'Invalid file path' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const bucket = pathParts[0];
      const filePath = pathParts.slice(1).join('/');

      // Check bucket access permissions
      const canDownload = await checkBucketDownloadPermission(userProfile.role, bucket, filePath, userProfile.id);
      if (!canDownload) {
        return new Response(
          JSON.stringify({ error: 'Permission denied for this file' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Generate signed download URL
      const { data: signedUrl, error: urlError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (urlError) {
        return new Response(
          JSON.stringify({ error: 'Failed to generate download URL', details: urlError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          download_url: signedUrl.signedUrl,
          expires_in: 3600
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // GET /storage/list/:bucket - List files in bucket
    if (req.method === 'GET' && path.startsWith('/list/')) {
      const bucket = path.replace('/list/', '');
      const folder = url.searchParams.get('folder') || '';
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      // Check bucket access permissions
      const canList = await checkBucketListPermission(userProfile.role, bucket);
      if (!canList) {
        return new Response(
          JSON.stringify({ error: 'Permission denied for this bucket' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // List files
      const { data: files, error: listError } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit,
          offset,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError) {
        return new Response(
          JSON.stringify({ error: 'Failed to list files', details: listError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          files: files || [],
          bucket,
          folder,
          total: files?.length || 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // DELETE /storage/:bucket/:path - Delete a file
    if (req.method === 'DELETE' && path.startsWith('/')) {
      const pathParts = path.substring(1).split('/');
      if (pathParts.length < 2) {
        return new Response(
          JSON.stringify({ error: 'Invalid file path' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const bucket = pathParts[0];
      const filePath = pathParts.slice(1).join('/');

      // Check if user can delete this file
      const canDelete = await checkBucketDeletePermission(userProfile.role, bucket, filePath, userProfile.id);
      if (!canDelete) {
        return new Response(
          JSON.stringify({ error: 'Permission denied to delete this file' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Delete the file
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: 'Failed to delete file', details: deleteError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ message: 'File deleted successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If no route matches
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in storage function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper functions for permission checking
async function checkBucketUploadPermission(userRole: string, bucket: string): Promise<boolean> {
  switch (bucket) {
    case 'resources':
      // Only admins and international students can upload resources
      return userRole === 'admin' || userRole === 'international_student';
    
    case 'works':
      // Students and international students can upload works
      return userRole === 'student' || userRole === 'international_student' || userRole === 'admin';
    
    case 'avatars':
      // All authenticated users can upload avatars
      return true;
    
    case 'materials':
      // Only admins can upload materials
      return userRole === 'admin';
    
    default:
      // Unknown bucket, deny by default
      return false;
  }
}

async function checkBucketDownloadPermission(
  userRole: string, 
  bucket: string, 
  filePath: string, 
  userId: string
): Promise<boolean> {
  switch (bucket) {
    case 'resources':
    case 'materials':
      // All authenticated users can download resources and materials
      return true;
    
    case 'works':
      // Users can download their own works, admins and international students can download all
      if (userRole === 'admin' || userRole === 'international_student') {
        return true;
      }
      // Check if the file belongs to the user
      return filePath.includes(userId);
    
    case 'avatars':
      // All authenticated users can download avatars
      return true;
    
    default:
      // Unknown bucket, deny by default
      return false;
  }
}

async function checkBucketListPermission(userRole: string, bucket: string): Promise<boolean> {
  switch (bucket) {
    case 'resources':
    case 'materials':
    case 'avatars':
      // All authenticated users can list these buckets
      return true;
    
    case 'works':
      // All authenticated users can list works (but download permissions are separate)
      return true;
    
    default:
      // Unknown bucket, deny by default
      return false;
  }
}

async function checkBucketDeletePermission(
  userRole: string, 
  bucket: string, 
  filePath: string, 
  userId: string
): Promise<boolean> {
  // Admins can delete anything
  if (userRole === 'admin') {
    return true;
  }

  switch (bucket) {
    case 'works':
    case 'avatars':
      // Users can delete their own files
      return filePath.includes(userId);
    
    case 'resources':
      // International students can delete resources they uploaded
      return userRole === 'international_student' && filePath.includes(userId);
    
    case 'materials':
      // Only admins can delete materials (handled above)
      return false;
    
    default:
      // Unknown bucket, deny by default
      return false;
  }
} 