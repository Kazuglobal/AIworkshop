// Student work submission and feedback Edge Function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseClient } from '../_shared/supabase-client.ts';
import {
  corsHeaders,
  errorResponse,
  getAuthToken,
  handleOptions,
  parseJSON,
  successResponse,
  validateUserRole,
} from '../_shared/utils.ts';

// Handle all work-related routes
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // Extract URL path and parameters
    const url = new URL(req.url);
    const path = url.pathname.replace('/works', '');
    
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
      .select('role, id')
      .eq('id', userData.user.id)
      .single();
      
    if (roleError) {
      return errorResponse(500, 'Failed to get user role', roleError);
    }
    
    // List all works (filtered by various parameters)
    if (path === '' && req.method === 'GET') {
      // Get filter parameters
      const userId = url.searchParams.get('user_id');
      const groupId = url.searchParams.get('group_id');
      const type = url.searchParams.get('type');
      const status = url.searchParams.get('status');
      
      // Build query based on role
      let query = supabase.from('works').select('*, feedback(*)');
      
      // If admin, can see all works with optional filters
      if (userRole.role === 'admin') {
        if (userId) query = query.eq('user_id', userId);
        if (groupId) query = query.eq('group_id', groupId);
      }
      // If mentor, can see works from their assigned groups
      else if (userRole.role === 'mentor') {
        // Get group IDs where user is mentor
        const { data: groups, error: groupsError } = await supabase
          .from('groups')
          .select('id')
          .eq('mentor_id', userRole.id);
          
        if (groupsError) {
          return errorResponse(500, 'Failed to fetch mentor groups', groupsError);
        }
        
        const mentorGroupIds = groups.map(g => g.id);
        
        if (mentorGroupIds.length === 0) {
          return successResponse({ works: [] }); // No groups assigned
        }
        
        // Filter by group IDs where user is mentor
        query = query.in('group_id', mentorGroupIds);
        
        // Additional filters
        if (userId) query = query.eq('user_id', userId);
        if (groupId && mentorGroupIds.includes(groupId)) {
          query = query.eq('group_id', groupId);
        }
      }
      // If student, can only see their own works
      else {
        query = query.eq('user_id', userRole.id);
        
        // Students can still filter their own works
        if (groupId) query = query.eq('group_id', groupId);
      }
      
      // Apply common filters
      if (type) query = query.eq('type', type);
      if (status) query = query.eq('status', status);
      
      // Order by created_at desc (newest first)
      query = query.order('created_at', { ascending: false });
      
      // Execute query
      const { data: works, error: worksError } = await query;
      
      if (worksError) {
        return errorResponse(500, 'Failed to fetch works', worksError);
      }
      
      return successResponse({ works });
    }
    
    // Get a single work by ID
    if (path.match(/^\/[0-9a-f-]+$/) && req.method === 'GET') {
      const workId = path.replace('/', '');
      
      // Get the work with feedback
      const { data: work, error: workError } = await supabase
        .from('works')
        .select('*, feedback(*)')
        .eq('id', workId)
        .single();
        
      if (workError) {
        return errorResponse(404, 'Work not found', workError);
      }
      
      // Check if user has access to this work
      if (userRole.role === 'student' && work.user_id !== userRole.id) {
        return errorResponse(403, 'You do not have permission to view this work');
      }
      
      // If mentor, check if work belongs to a group they mentor
      if (userRole.role === 'mentor') {
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('mentor_id')
          .eq('id', work.group_id)
          .single();
          
        if (groupError || group.mentor_id !== userRole.id) {
          return errorResponse(403, 'You do not have permission to view this work');
        }
      }
      
      return successResponse({ work });
    }
    
    // Submit/create a new work (student only)
    if (path === '' && req.method === 'POST') {
      // Students can only submit their own works
      if (userRole.role !== 'student') {
        return errorResponse(403, 'Only students can submit works');
      }
      
      // Parse work data
      const workData = await parseJSON(req);
      
      // Validate required fields
      if (!workData.title || !workData.type) {
        return errorResponse(400, 'Title and type are required');
      }
      
      // If group_id is provided, verify that user is part of that group
      if (workData.group_id) {
        const { data: membership, error: membershipError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', workData.group_id)
          .eq('student_id', userRole.id)
          .single();
          
        if (membershipError) {
          return errorResponse(400, 'Invalid group ID or you are not a member of this group');
        }
      }
      
      // Add additional metadata
      const newWork = {
        ...workData,
        user_id: userRole.id,
        status: 'submitted', // default status for new submissions
      };
      
      // Insert work
      const { data: createdWork, error: createError } = await supabase
        .from('works')
        .insert(newWork)
        .select('*')
        .single();
        
      if (createError) {
        return errorResponse(500, 'Failed to create work submission', createError);
      }
      
      return successResponse({
        message: 'Work submitted successfully',
        work: createdWork
      }, 201);
    }
    
    // Update a work
    if (path.match(/^\/[0-9a-f-]+$/) && req.method === 'PUT') {
      const workId = path.replace('/', '');
      
      // Get the work to check ownership
      const { data: existingWork, error: workError } = await supabase
        .from('works')
        .select('user_id, status')
        .eq('id', workId)
        .single();
        
      if (workError) {
        return errorResponse(404, 'Work not found', workError);
      }
      
      // Check permissions
      if (userRole.role === 'student') {
        // Students can only update their own works that are not yet reviewed
        if (existingWork.user_id !== userRole.id) {
          return errorResponse(403, 'You can only update your own works');
        }
        
        if (existingWork.status === 'reviewed') {
          return errorResponse(403, 'Cannot update work that has been reviewed');
        }
      }
      // Admins can update any work
      // Mentors will be checked later
      
      // Parse work data
      const workData = await parseJSON(req);
      
      // If mentor, only allow updating status
      if (userRole.role === 'mentor') {
        // Check if the work belongs to a group they mentor
        const { data: work, error: workGroupError } = await supabase
          .from('works')
          .select('group_id')
          .eq('id', workId)
          .single();
          
        if (workGroupError) {
          return errorResponse(500, 'Failed to get work information', workGroupError);
        }
        
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('mentor_id')
          .eq('id', work.group_id)
          .single();
          
        if (groupError || group.mentor_id !== userRole.id) {
          return errorResponse(403, 'You do not have permission to update this work');
        }
        
        // Mentors can only update the status field
        if (Object.keys(workData).filter(key => key !== 'status').length > 0) {
          return errorResponse(400, 'Mentors can only update the status field');
        }
      }
      
      // Update the work
      const { data: updatedWork, error: updateError } = await supabase
        .from('works')
        .update({
          ...workData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workId)
        .select('*')
        .single();
        
      if (updateError) {
        return errorResponse(500, 'Failed to update work', updateError);
      }
      
      return successResponse({
        message: 'Work updated successfully',
        work: updatedWork
      });
    }
    
    // Add feedback to a work (mentor, admin only)
    if (path.match(/^\/[0-9a-f-]+\/feedback$/) && req.method === 'POST') {
      const workId = path.replace('/feedback', '').replace('/', '');
      
      // Only mentors and admins can provide feedback
      if (userRole.role === 'student') {
        return errorResponse(403, 'Students cannot provide feedback');
      }
      
      // Get the work to check if it exists and get group info
      const { data: work, error: workError } = await supabase
        .from('works')
        .select('group_id, user_id')
        .eq('id', workId)
        .single();
        
      if (workError) {
        return errorResponse(404, 'Work not found', workError);
      }
      
      // If mentor, check if work belongs to a group they mentor
      if (userRole.role === 'mentor') {
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('mentor_id')
          .eq('id', work.group_id)
          .single();
          
        if (groupError || group.mentor_id !== userRole.id) {
          return errorResponse(403, 'You do not have permission to provide feedback on this work');
        }
      }
      
      // Parse feedback data
      const feedbackData = await parseJSON(req);
      
      // Validate required fields
      if (!feedbackData.comment) {
        return errorResponse(400, 'Comment is required for feedback');
      }
      
      // Add additional metadata
      const newFeedback = {
        ...feedbackData,
        work_id: workId,
        reviewer_id: userRole.id,
      };
      
      // Insert feedback
      const { data: createdFeedback, error: createError } = await supabase
        .from('feedback')
        .insert(newFeedback)
        .select('*')
        .single();
        
      if (createError) {
        return errorResponse(500, 'Failed to create feedback', createError);
      }
      
      // Update the work status to 'reviewed'
      await supabase
        .from('works')
        .update({ status: 'reviewed' })
        .eq('id', workId);
      
      return successResponse({
        message: 'Feedback added successfully',
        feedback: createdFeedback
      }, 201);
    }
    
    // Delete a work (owner or admin only)
    if (path.match(/^\/[0-9a-f-]+$/) && req.method === 'DELETE') {
      const workId = path.replace('/', '');
      
      // Get the work to check ownership
      const { data: existingWork, error: workError } = await supabase
        .from('works')
        .select('user_id')
        .eq('id', workId)
        .single();
        
      if (workError) {
        return errorResponse(404, 'Work not found', workError);
      }
      
      // Check if user is owner or admin
      const isOwner = existingWork.user_id === userRole.id;
      const isAdmin = userRole.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return errorResponse(403, 'Unauthorized: Only work owner or admin can delete');
      }
      
      // Delete the work
      const { error: deleteError } = await supabase
        .from('works')
        .delete()
        .eq('id', workId);
        
      if (deleteError) {
        return errorResponse(500, 'Failed to delete work', deleteError);
      }
      
      return successResponse({
        message: 'Work deleted successfully'
      });
    }
    
    // If no route matches
    return errorResponse(404, 'Route not found');
  } catch (error) {
    console.error('Error in works function:', error);
    return errorResponse(500, 'Internal server error', error);
  }
}); 