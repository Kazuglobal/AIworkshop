// Resources management Edge Function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseClient } from '../_shared/supabase-client.ts';
import { searchResources } from '../_shared/gemini-client.ts';
import {
  corsHeaders,
  errorResponse,
  getAuthToken,
  handleOptions,
  parseJSON,
  successResponse,
  validateUserRole,
} from '../_shared/utils.ts';

// Handle all resource-related routes
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // Extract URL path and parameters
    const url = new URL(req.url);
    const path = url.pathname.replace('/resources', '');
    
    // Get auth token
    const authToken = getAuthToken(req);
    if (!authToken) {
      return errorResponse(401, 'Unauthorized: No valid auth token provided');
    }
    
    // Initialize Supabase client with auth header
    const supabase = createSupabaseClient(`Bearer ${authToken}`);
    
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser(authToken);
    if (userError || !userData.user) {
      return errorResponse(401, 'Unauthorized: Invalid user');
    }
    
    // Get user role
    const { data: userRole, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userData.user.id)
      .single();
      
    if (roleError) {
      return errorResponse(500, 'Failed to get user role', roleError);
    }
    
    // Search resources with Gemini API
    if (path === '/search' && req.method === 'GET') {
      const query = url.searchParams.get('q');
      
      if (!query) {
        return errorResponse(400, 'Query parameter "q" is required');
      }
      
      // Search resources using Gemini
      const searchResults = await searchResources(query);
      
      return successResponse({ results: searchResults.resources || [] });
    }
    
    // List resources
    if (path === '' && req.method === 'GET') {
      // Get filter parameters
      const type = url.searchParams.get('type');
      const tag = url.searchParams.get('tag');
      const limit = url.searchParams.get('limit') || '20';
      
      // Build query
      let query = supabase.from('resources').select('*');
      
      // Apply filters
      if (type) {
        query = query.eq('type', type);
      }
      
      if (tag) {
        query = query.contains('tags', [tag]);
      }
      
      // Execute query with limit
      const { data: resources, error: resourcesError } = await query.limit(parseInt(limit));
      
      if (resourcesError) {
        return errorResponse(500, 'Failed to fetch resources', resourcesError);
      }
      
      return successResponse({ resources });
    }
    
    // Get a single resource
    if (path.match(/^\/[0-9a-f-]+$/) && req.method === 'GET') {
      const resourceId = path.replace('/', '');
      
      const { data: resource, error: resourceError } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .single();
        
      if (resourceError) {
        return errorResponse(404, 'Resource not found', resourceError);
      }
      
      return successResponse({ resource });
    }
    
    // Create a new resource (admin/mentor only)
    if (path === '' && req.method === 'POST') {
      // Check if user is admin or mentor
      if (!validateUserRole(userRole.role, ['admin', 'mentor'])) {
        return errorResponse(403, 'Unauthorized: Only admins and mentors can create resources');
      }
      
      // Parse resource data
      const resourceData = await parseJSON(req);
      
      // Validate required fields
      if (!resourceData.title) {
        return errorResponse(400, 'Title is required');
      }
      
      // Add additional metadata
      const newResource = {
        ...resourceData,
        uploaded_by: userData.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Insert resource
      const { data: createdResource, error: createError } = await supabase
        .from('resources')
        .insert(newResource)
        .select('*')
        .single();
        
      if (createError) {
        return errorResponse(500, 'Failed to create resource', createError);
      }
      
      return successResponse({ 
        message: 'Resource created successfully',
        resource: createdResource
      }, 201);
    }
    
    // Update a resource
    if (path.match(/^\/[0-9a-f-]+$/) && req.method === 'PUT') {
      const resourceId = path.replace('/', '');
      
      // Get the resource to check ownership
      const { data: existingResource, error: resourceError } = await supabase
        .from('resources')
        .select('uploaded_by')
        .eq('id', resourceId)
        .single();
        
      if (resourceError) {
        return errorResponse(404, 'Resource not found', resourceError);
      }
      
      // Check if user is owner or admin
      const isOwner = existingResource.uploaded_by === userData.user.id;
      const isAdmin = userRole.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return errorResponse(403, 'Unauthorized: Only resource owner or admin can update');
      }
      
      // Parse resource data
      const resourceData = await parseJSON(req);
      
      // Update the resource
      const { data: updatedResource, error: updateError } = await supabase
        .from('resources')
        .update({
          ...resourceData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resourceId)
        .select('*')
        .single();
        
      if (updateError) {
        return errorResponse(500, 'Failed to update resource', updateError);
      }
      
      return successResponse({ 
        message: 'Resource updated successfully',
        resource: updatedResource
      });
    }
    
    // Delete a resource
    if (path.match(/^\/[0-9a-f-]+$/) && req.method === 'DELETE') {
      const resourceId = path.replace('/', '');
      
      // Get the resource to check ownership
      const { data: existingResource, error: resourceError } = await supabase
        .from('resources')
        .select('uploaded_by')
        .eq('id', resourceId)
        .single();
        
      if (resourceError) {
        return errorResponse(404, 'Resource not found', resourceError);
      }
      
      // Check if user is owner or admin
      const isOwner = existingResource.uploaded_by === userData.user.id;
      const isAdmin = userRole.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return errorResponse(403, 'Unauthorized: Only resource owner or admin can delete');
      }
      
      // Delete the resource
      const { error: deleteError } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);
        
      if (deleteError) {
        return errorResponse(500, 'Failed to delete resource', deleteError);
      }
      
      return successResponse({ 
        message: 'Resource deleted successfully'
      });
    }
    
    // Add to favorites
    if (path.match(/^\/[0-9a-f-]+\/favorite$/) && req.method === 'POST') {
      const resourceId = path.replace('/favorite', '').replace('/', '');
      
      // Check if resource exists
      const { data: resource, error: resourceError } = await supabase
        .from('resources')
        .select('id')
        .eq('id', resourceId)
        .single();
        
      if (resourceError) {
        return errorResponse(404, 'Resource not found', resourceError);
      }
      
      // Add to favorites (upsert to handle duplicates)
      const { data: favorite, error: favoriteError } = await supabase
        .from('favorite_resources')
        .upsert({
          user_id: userData.user.id,
          resource_id: resourceId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
        
      if (favoriteError) {
        return errorResponse(500, 'Failed to add to favorites', favoriteError);
      }
      
      return successResponse({ 
        message: 'Added to favorites',
        favorite
      });
    }
    
    // Remove from favorites
    if (path.match(/^\/[0-9a-f-]+\/favorite$/) && req.method === 'DELETE') {
      const resourceId = path.replace('/favorite', '').replace('/', '');
      
      // Remove from favorites
      const { error: favoriteError } = await supabase
        .from('favorite_resources')
        .delete()
        .eq('user_id', userData.user.id)
        .eq('resource_id', resourceId);
        
      if (favoriteError) {
        return errorResponse(500, 'Failed to remove from favorites', favoriteError);
      }
      
      return successResponse({ 
        message: 'Removed from favorites'
      });
    }
    
    // Get user's favorite resources
    if (path === '/favorites' && req.method === 'GET') {
      const { data: favorites, error: favoritesError } = await supabase
        .from('favorite_resources')
        .select('resource_id')
        .eq('user_id', userData.user.id);
        
      if (favoritesError) {
        return errorResponse(500, 'Failed to fetch favorites', favoritesError);
      }
      
      // If no favorites, return empty array
      if (!favorites.length) {
        return successResponse({ resources: [] });
      }
      
      // Get resource details for favorites
      const resourceIds = favorites.map(fav => fav.resource_id);
      
      const { data: resources, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .in('id', resourceIds);
        
      if (resourcesError) {
        return errorResponse(500, 'Failed to fetch favorite resources', resourcesError);
      }
      
      return successResponse({ resources });
    }
    
    // If no route matches
    return errorResponse(404, 'Route not found');
  } catch (error) {
    console.error('Error in resources function:', error);
    return errorResponse(500, 'Internal server error', error);
  }
}); 