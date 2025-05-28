// Auth and user profile management Edge Function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseClient } from '../_shared/supabase-client.ts';
import {
  corsHeaders,
  errorResponse,
  getAuthToken,
  handleOptions,
  parseJSON,
  successResponse,
} from '../_shared/utils.ts';

// Handle all auth-related routes
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // Extract URL path and parameters
    const url = new URL(req.url);
    const path = url.pathname.replace('/auth', '');
    
    // Get auth token
    const authToken = getAuthToken(req);
    if (!authToken) {
      return errorResponse(401, 'Unauthorized: No valid auth token provided');
    }
    
    // Initialize Supabase client with auth header
    const supabase = createSupabaseClient(`Bearer ${authToken}`);
    
    // Get current user profile
    if (path === '/me' && req.method === 'GET') {
      const { data: user, error } = await supabase.auth.getUser(authToken);
      
      if (error) {
        return errorResponse(401, 'Failed to get user', error);
      }
      
      if (!user || !user.user) {
        return errorResponse(404, 'User not found');
      }
      
      // Get detailed user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.user.id)
        .single();
        
      if (profileError) {
        return errorResponse(500, 'Failed to get user profile', profileError);
      }
      
      return successResponse({ user: profile });
    }
    
    // Update user profile
    if (path === '/profile' && req.method === 'PUT') {
      const { data: user, error } = await supabase.auth.getUser(authToken);
      
      if (error) {
        return errorResponse(401, 'Failed to get user', error);
      }
      
      if (!user || !user.user) {
        return errorResponse(404, 'User not found');
      }
      
      // Parse profile data
      const profileData = await parseJSON(req);
      
      // Validate the profile data
      // Only allow updating specific fields
      const allowedFields = ['name', 'avatar', 'bio', 'country', 'school'];
      const sanitizedData = Object.keys(profileData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = profileData[key];
          return obj;
        }, {} as Record<string, any>);
      
      // Update the profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update(sanitizedData)
        .eq('id', user.user.id)
        .select('*')
        .single();
        
      if (updateError) {
        return errorResponse(500, 'Failed to update profile', updateError);
      }
      
      return successResponse({ 
        message: 'Profile updated successfully',
        user: updatedProfile 
      });
    }
    
    // List all users (admin only)
    if (path === '/users' && req.method === 'GET') {
      // Get current user info to check role
      const { data: user, error } = await supabase.auth.getUser(authToken);
      
      if (error) {
        return errorResponse(401, 'Failed to get user', error);
      }
      
      // Get current user's role
      const { data: currentUser, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.user?.id)
        .single();
        
      if (roleError || !currentUser) {
        return errorResponse(403, 'Unauthorized: User role not found');
      }
      
      // Check if user is admin
      if (currentUser.role !== 'admin') {
        return errorResponse(403, 'Unauthorized: Admin access required');
      }
      
      // Get role filter from query params
      const roleFilter = url.searchParams.get('role');
      
      // Build query
      let query = supabase.from('users').select('*');
      
      // Apply role filter if provided
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }
      
      // Execute query
      const { data: users, error: usersError } = await query;
      
      if (usersError) {
        return errorResponse(500, 'Failed to fetch users', usersError);
      }
      
      return successResponse({ users });
    }
    
    // If no route matches
    return errorResponse(404, 'Route not found');
  } catch (error) {
    console.error('Error in auth function:', error);
    return errorResponse(500, 'Internal server error', error);
  }
}); 