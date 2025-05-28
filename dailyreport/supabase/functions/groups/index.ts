// Groups and chat messages Edge Function
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

// Handle all group-related routes
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // Extract URL path and parameters
    const url = new URL(req.url);
    const path = url.pathname.replace('/groups', '');
    
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
    
    // List groups
    if (path === '' && req.method === 'GET') {
      // By default, show groups relevant to the user
      let query = supabase.from('groups').select(`
        *,
        mentor:mentor_id(id, name, avatar),
        members:group_members(student_id(id, name, avatar))
      `);
      
      // If admin, can see all groups
      if (userRole.role === 'admin') {
        // No additional filters
      }
      // If mentor, show groups they are assigned to
      else if (userRole.role === 'mentor') {
        query = query.eq('mentor_id', userRole.id);
      }
      // If student, show groups they are a member of
      else {
        // Get group IDs where user is a member
        const { data: memberships, error: membershipError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('student_id', userRole.id);
          
        if (membershipError) {
          return errorResponse(500, 'Failed to fetch group memberships', membershipError);
        }
        
        const groupIds = memberships.map(m => m.group_id);
        
        if (groupIds.length === 0) {
          return successResponse({ groups: [] }); // Not a member of any group
        }
        
        query = query.in('id', groupIds);
      }
      
      // Execute query
      const { data: groups, error: groupsError } = await query;
      
      if (groupsError) {
        return errorResponse(500, 'Failed to fetch groups', groupsError);
      }
      
      return successResponse({ groups });
    }
    
    // Get a single group
    if (path.match(/^\/[0-9a-f-]+$/) && req.method === 'GET') {
      const groupId = path.replace('/', '');
      
      // Check if user has access to this group
      if (userRole.role === 'student') {
        const { data: membership, error: membershipError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', groupId)
          .eq('student_id', userRole.id)
          .single();
          
        if (membershipError) {
          return errorResponse(403, 'You are not a member of this group');
        }
      } else if (userRole.role === 'mentor') {
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('mentor_id')
          .eq('id', groupId)
          .single();
          
        if (groupError || group.mentor_id !== userRole.id) {
          return errorResponse(403, 'You are not assigned to this group');
        }
      }
      // Admins can access any group
      
      // Get the group with members and mentor
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select(`
          *,
          mentor:mentor_id(id, name, avatar, country, bio),
          members:group_members(student:student_id(id, name, avatar, country, school))
        `)
        .eq('id', groupId)
        .single();
        
      if (groupError) {
        return errorResponse(404, 'Group not found', groupError);
      }
      
      return successResponse({ group });
    }
    
    // Create a new group (admin only)
    if (path === '' && req.method === 'POST') {
      // Only admins can create groups
      if (userRole.role !== 'admin') {
        return errorResponse(403, 'Only admins can create groups');
      }
      
      // Parse group data
      const groupData = await parseJSON(req);
      
      // Validate required fields
      if (!groupData.name) {
        return errorResponse(400, 'Group name is required');
      }
      
      // Extract student IDs to add as members
      const studentIds = groupData.student_ids || [];
      delete groupData.student_ids;
      
      // Mentor validation
      if (groupData.mentor_id) {
        const { data: mentor, error: mentorError } = await supabase
          .from('users')
          .select('role')
          .eq('id', groupData.mentor_id)
          .eq('role', 'mentor')
          .single();
          
        if (mentorError) {
          return errorResponse(400, 'Invalid mentor ID or user is not a mentor');
        }
      }
      
      // Create the group
      const { data: createdGroup, error: createError } = await supabase
        .from('groups')
        .insert(groupData)
        .select('*')
        .single();
        
      if (createError) {
        return errorResponse(500, 'Failed to create group', createError);
      }
      
      // Add members if provided
      if (studentIds.length > 0) {
        // Validate that all student IDs are valid
        const { data: students, error: studentsError } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'student')
          .in('id', studentIds);
          
        if (studentsError) {
          return errorResponse(500, 'Failed to validate student IDs', studentsError);
        }
        
        const validStudentIds = students.map(s => s.id);
        
        // Create memberships for valid student IDs
        const memberships = validStudentIds.map(studentId => ({
          group_id: createdGroup.id,
          student_id: studentId,
        }));
        
        if (memberships.length > 0) {
          const { error: membershipError } = await supabase
            .from('group_members')
            .insert(memberships);
            
          if (membershipError) {
            return errorResponse(500, 'Group created but failed to add some members', membershipError);
          }
        }
      }
      
      return successResponse({
        message: 'Group created successfully',
        group: createdGroup
      }, 201);
    }
    
    // Update a group (admin only)
    if (path.match(/^\/[0-9a-f-]+$/) && req.method === 'PUT') {
      // Only admins can update groups
      if (userRole.role !== 'admin') {
        return errorResponse(403, 'Only admins can update groups');
      }
      
      const groupId = path.replace('/', '');
      
      // Parse group data
      const groupData = await parseJSON(req);
      
      // Mentor validation if changing mentor
      if (groupData.mentor_id) {
        const { data: mentor, error: mentorError } = await supabase
          .from('users')
          .select('role')
          .eq('id', groupData.mentor_id)
          .eq('role', 'mentor')
          .single();
          
        if (mentorError) {
          return errorResponse(400, 'Invalid mentor ID or user is not a mentor');
        }
      }
      
      // Update the group
      const { data: updatedGroup, error: updateError } = await supabase
        .from('groups')
        .update(groupData)
        .eq('id', groupId)
        .select('*')
        .single();
        
      if (updateError) {
        return errorResponse(500, 'Failed to update group', updateError);
      }
      
      return successResponse({
        message: 'Group updated successfully',
        group: updatedGroup
      });
    }
    
    // Add a member to a group (admin only)
    if (path.match(/^\/[0-9a-f-]+\/members$/) && req.method === 'POST') {
      // Only admins can add members
      if (userRole.role !== 'admin') {
        return errorResponse(403, 'Only admins can add members to groups');
      }
      
      const groupId = path.replace('/members', '').replace('/', '');
      
      // Parse member data
      const memberData = await parseJSON(req);
      
      // Validate student ID
      if (!memberData.student_id) {
        return errorResponse(400, 'Student ID is required');
      }
      
      // Verify student exists
      const { data: student, error: studentError } = await supabase
        .from('users')
        .select('id')
        .eq('id', memberData.student_id)
        .eq('role', 'student')
        .single();
        
      if (studentError) {
        return errorResponse(400, 'Invalid student ID or user is not a student');
      }
      
      // Add member
      const { data: membership, error: membershipError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          student_id: memberData.student_id,
        })
        .select('*')
        .single();
        
      if (membershipError) {
        return errorResponse(500, 'Failed to add member to group', membershipError);
      }
      
      return successResponse({
        message: 'Member added to group successfully',
        membership
      }, 201);
    }
    
    // Remove a member from a group (admin only)
    if (path.match(/^\/[0-9a-f-]+\/members\/[0-9a-f-]+$/) && req.method === 'DELETE') {
      // Only admins can remove members
      if (userRole.role !== 'admin') {
        return errorResponse(403, 'Only admins can remove members from groups');
      }
      
      const [groupId, studentId] = path.replace('/members/', '/').replace('/', '').split('/');
      
      // Remove member
      const { error: deleteError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('student_id', studentId);
        
      if (deleteError) {
        return errorResponse(500, 'Failed to remove member from group', deleteError);
      }
      
      return successResponse({
        message: 'Member removed from group successfully'
      });
    }
    
    // Delete a group (admin only)
    if (path.match(/^\/[0-9a-f-]+$/) && req.method === 'DELETE') {
      // Only admins can delete groups
      if (userRole.role !== 'admin') {
        return errorResponse(403, 'Only admins can delete groups');
      }
      
      const groupId = path.replace('/', '');
      
      // Delete the group
      const { error: deleteError } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);
        
      if (deleteError) {
        return errorResponse(500, 'Failed to delete group', deleteError);
      }
      
      return successResponse({
        message: 'Group deleted successfully'
      });
    }
    
    // Get messages for a group
    if (path.match(/^\/[0-9a-f-]+\/messages$/) && req.method === 'GET') {
      const groupId = path.replace('/messages', '').replace('/', '');
      
      // Check if user has access to this group
      let hasAccess = false;
      
      if (userRole.role === 'admin') {
        hasAccess = true;
      } else if (userRole.role === 'mentor') {
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('mentor_id')
          .eq('id', groupId)
          .single();
          
        hasAccess = !groupError && group.mentor_id === userRole.id;
      } else {
        const { data: membership, error: membershipError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', groupId)
          .eq('student_id', userRole.id)
          .single();
          
        hasAccess = !membershipError;
      }
      
      if (!hasAccess) {
        return errorResponse(403, 'You do not have access to this group');
      }
      
      // Get messages with sender info
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, name, avatar, role)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });
        
      if (messagesError) {
        return errorResponse(500, 'Failed to fetch messages', messagesError);
      }
      
      return successResponse({ messages });
    }
    
    // Send a message to a group
    if (path.match(/^\/[0-9a-f-]+\/messages$/) && req.method === 'POST') {
      const groupId = path.replace('/messages', '').replace('/', '');
      
      // Check if user has access to this group
      let hasAccess = false;
      
      if (userRole.role === 'admin') {
        hasAccess = true;
      } else if (userRole.role === 'mentor') {
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('mentor_id')
          .eq('id', groupId)
          .single();
          
        hasAccess = !groupError && group.mentor_id === userRole.id;
      } else {
        const { data: membership, error: membershipError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', groupId)
          .eq('student_id', userRole.id)
          .single();
          
        hasAccess = !membershipError;
      }
      
      if (!hasAccess) {
        return errorResponse(403, 'You do not have access to this group');
      }
      
      // Parse message data
      const messageData = await parseJSON(req);
      
      // Validate content
      if (!messageData.content && !messageData.file) {
        return errorResponse(400, 'Message must have either content or a file');
      }
      
      // Create message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          group_id: groupId,
          sender_id: userRole.id,
          content: messageData.content || '',
          file: messageData.file || null,
        })
        .select(`
          *,
          sender:sender_id(id, name, avatar, role)
        `)
        .single();
        
      if (messageError) {
        return errorResponse(500, 'Failed to send message', messageError);
      }
      
      return successResponse({
        message: 'Message sent successfully',
        data: message
      }, 201);
    }
    
    // If no route matches
    return errorResponse(404, 'Route not found');
  } catch (error) {
    console.error('Error in groups function:', error);
    return errorResponse(500, 'Internal server error', error);
  }
}); 