// Chat messages Edge Function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface MessageRequest {
  content: string;
  group_id: string;
  message_type?: 'text' | 'image' | 'file';
  file_url?: string;
}

interface MessageResponse {
  id: string;
  content: string;
  group_id: string;
  sender_id: string;
  message_type: string;
  file_url?: string;
  created_at: string;
  sender: {
    id: string;
    name: string;
    avatar_url?: string;
    role: string;
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
      .select('id, name, avatar_url, role')
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
    const path = url.pathname.replace('/messages', '');

    // GET /messages?group_id=xxx - Get messages for a group
    if (req.method === 'GET' && path === '') {
      const groupId = url.searchParams.get('group_id');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      if (!groupId) {
        return new Response(
          JSON.stringify({ error: 'group_id parameter is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check if user has access to this group
      const hasAccess = await checkGroupAccess(supabase, userProfile.id, userProfile.role, groupId);
      if (!hasAccess) {
        return new Response(
          JSON.stringify({ error: 'Access denied to this group' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Get messages with sender information
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          group_id,
          sender_id,
          message_type,
          file_url,
          created_at,
          sender:sender_id(id, name, avatar_url, role)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (messagesError) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch messages', details: messagesError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          messages: messages || [],
          total: messages?.length || 0,
          group_id: groupId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // POST /messages - Send a new message
    if (req.method === 'POST' && path === '') {
      let messageData: MessageRequest;
      
      try {
        messageData = await req.json();
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in request body' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const { content, group_id, message_type = 'text', file_url } = messageData;

      // Validate required fields
      if (!content || !group_id) {
        return new Response(
          JSON.stringify({ error: 'content and group_id are required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check if user has access to this group
      const hasAccess = await checkGroupAccess(supabase, userProfile.id, userProfile.role, group_id);
      if (!hasAccess) {
        return new Response(
          JSON.stringify({ error: 'Access denied to this group' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Insert the message
      const { data: newMessage, error: insertError } = await supabase
        .from('messages')
        .insert({
          content,
          group_id,
          sender_id: userProfile.id,
          message_type,
          file_url
        })
        .select(`
          id,
          content,
          group_id,
          sender_id,
          message_type,
          file_url,
          created_at,
          sender:sender_id(id, name, avatar_url, role)
        `)
        .single();

      if (insertError) {
        return new Response(
          JSON.stringify({ error: 'Failed to send message', details: insertError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          message: 'Message sent successfully',
          data: newMessage
        }),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // DELETE /messages/:id - Delete a message (sender or admin only)
    if (req.method === 'DELETE' && path.match(/^\/[0-9a-f-]+$/)) {
      const messageId = path.replace('/', '');

      // Get the message to check ownership
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .select('sender_id, group_id')
        .eq('id', messageId)
        .single();

      if (messageError || !message) {
        return new Response(
          JSON.stringify({ error: 'Message not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check if user can delete this message (sender or admin)
      const canDelete = message.sender_id === userProfile.id || userProfile.role === 'admin';
      if (!canDelete) {
        return new Response(
          JSON.stringify({ error: 'Permission denied' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Delete the message
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: 'Failed to delete message', details: deleteError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ message: 'Message deleted successfully' }),
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
    console.error('Error in messages function:', error);
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

// Helper function to check if user has access to a group
async function checkGroupAccess(
  supabase: any, 
  userId: string, 
  userRole: string, 
  groupId: string
): Promise<boolean> {
  // Admins have access to all groups
  if (userRole === 'admin') {
    return true;
  }

  // Check if user is a member of the group (for students)
  if (userRole === 'student') {
    const { data: membership, error } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('student_id', userId)
      .single();

    return !error && membership;
  }

  // Check if user is the mentor of the group (for international students)
  if (userRole === 'international_student') {
    const { data: group, error } = await supabase
      .from('groups')
      .select('mentor_id')
      .eq('id', groupId)
      .single();

    return !error && group && group.mentor_id === userId;
  }

  // School role can access groups they are associated with
  if (userRole === 'school') {
    // For now, allow school users to access all groups
    // This can be refined based on specific requirements
    return true;
  }

  return false;
} 