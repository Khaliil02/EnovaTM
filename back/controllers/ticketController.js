const {
    getAllTickets, // Changed from getTickets to getAllTickets
    getTicketById,
    getTicketByStatus,
    getTicketByPriority,
    createTicket,
    updateTicketStatus,
    deleteTicket,
    assignTicket,
    closeTicket,
    escalateTicket,
    reassignEscalatedTicket
} = require('../models/ticketModel');

const { getUserDepartment } = require('../models/userModel');
const { createTicketStatusNotification, createNewTicketNotification } = require('./notificationController');
const db = require('../config/db');

const getAllTicketsHandler = async (req, res) => {
  try {
    const tickets = await getAllTickets(); // Changed from getTickets() to getAllTickets()
    res.json(tickets);
  } catch (err) {
    console.error("Error in getAllTickets:", err);
    res.status(500).json({ error: err.message || 'Failed to fetch tickets' });
  }
};

const getTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTicketsByStatus = async (req, res) => {
  const { status } = req.params;
  try {
    const tickets = await getTicketByStatus(status);
    if (tickets.length === 0) {
      return res.status(404).json({ error: 'No tickets found with the given status' });
    }
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTicketsByPriority = async (req, res) => {
  const { priority } = req.params;
  try {
    const tickets = await getTicketByPriority(priority);
    if (tickets.length === 0) {
      return res.status(404).json({ error: 'No tickets found with the given priority' });
    }
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addTicket = async (req, res) => {
  const { title, description, priority, destination_department_id } = req.body;
  
  try {
    // Get the user ID from the authenticated user
    const userId = req.user.id;
    
    // Auto-determine the source department from user's department
    const source_department_id = await getUserDepartment(userId);
    
    const newTicket = await createTicket(
      title, 
      description, 
      priority,
      userId, 
      source_department_id,
      destination_department_id
    );
    
    // Get the io instance
    const io = req.app.get('io');
    
    // Create notifications (without AI references)
    await createNewTicketNotification(newTicket.id, userId, io);
    
    res.status(201).json(newTicket);
  } catch (err) {
    console.error("Error creating ticket:", err);
    res.status(500).json({ error: err.message || 'Failed to create ticket' });
  }
};

// Simplified modifyTicketStatus function
const modifyTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Get current ticket to know the old status
    const ticket = await getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const oldStatus = ticket.status;
    // Get the user ID from the authenticated user
    const userId = req.user.id;
    
    // Update the ticket status
    let updatedTicket;
    if (status === 'closed') {
      // Fixed: Use req.user.id instead of userId
      updatedTicket = await closeTicket(id, req.user.id);
    } else {
      // For other status changes, use the generic updateTicketStatus
      updatedTicket = await updateTicketStatus(id, status);
    }
    
    // Get io instance
    const io = req.app.get('io');
    
    // Create notifications if status has changed
    if (oldStatus !== status) {
      await createTicketStatusNotification(
        id,
        oldStatus,
        status,
        req.user.id,
        io
      );
    }
    
    res.json(updatedTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeTicket = async (req, res) => {
  const { id } = req.params;
  try {
    // Use pool directly to ensure it works
    const pool = require('../config/db');
    const result = await pool.query('DELETE FROM tickets WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting ticket:', err);
    res.status(500).json({ error: err.message });
  }
};

// Simplified assignTicketToUser function
const assignTicketToUser = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    const ticket = await getTicketById(id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Check if ticket is already assigned
    if (ticket.assigned_to !== null) {
      return res.status(400).json({ error: 'Ticket is already assigned' });
    }
    
    const assignedTicket = await assignTicket(id, userId);
    res.json(assignedTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const escalateTicketToAdmin = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    
    // Validate
    if (!reason) {
        return res.status(400).json({ error: 'Escalation reason is required' });
    }
    
    try {
        const ticket = await getTicketById(id);
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        // Check if the user is the assignee
        if (ticket.assigned_to !== userId) {
            return res.status(403).json({ 
                error: 'Only the assigned user can escalate this ticket' 
            });
        }
        
        // Escalate the ticket
        const escalatedTicket = await escalateTicket(id, userId, reason);
        res.json(escalatedTicket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Modify the existing adminReassignTicket function
const adminReassignTicket = async (req, res) => {
    const { id } = req.params;
    const { new_assignee_id, new_department_id } = req.body;
    const adminId = req.user.id;
    
    // Validate
    if (!new_assignee_id || !new_department_id) {
        return res.status(400).json({ error: 'New assignee ID and department ID are required' });
    }
    
    try {
        const ticket = await getTicketById(id);
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        // Check if ticket is in escalated status
        if (ticket.status !== 'escalated') {
            return res.status(400).json({ 
                error: 'Only escalated tickets can be reassigned' 
            });
        }
        
        // Reassign the ticket
        const reassignedTicket = await reassignEscalatedTicket(
            id, 
            new_assignee_id, 
            new_department_id, 
            adminId
        );
        res.json(reassignedTicket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add this function inside your updateTicket function
const notifyUsersOfUpdate = async (req, ticket, oldTicket) => {
  try {
    // Notify assigned user if changed
    if (ticket.assigned_to && ticket.assigned_to !== oldTicket.assigned_to) {
      const notification = {
        user_id: ticket.assigned_to,
        message: `Ticket #${ticket.id} has been assigned to you`,
        ticket_id: ticket.id
      };
      
      await createNotificationAndEmit(req, notification);
    }
    
    // Notify if status changed
    if (ticket.status !== oldTicket.status) {
      const statusMessage = `Ticket #${ticket.id} status changed to ${formatStatus(ticket.status)}`;
      
      // Notify ticket creator
      if (ticket.created_by) {
        const notification = {
          user_id: ticket.created_by,
          message: statusMessage,
          ticket_id: ticket.id
        };
        
        await createNotificationAndEmit(req, notification);
      }
    }
    
    // Notify if escalated
    if (ticket.status === 'escalated' && oldTicket.status !== 'escalated') {
      // Find admins to notify
      const adminResult = await db.query(
        `SELECT id FROM users WHERE role = 'admin'`
      );
      
      const admins = adminResult.rows;
      const message = `Ticket #${ticket.id} has been escalated and requires attention`;
      
      // Notify all admins
      for (const admin of admins) {
        const notification = {
          user_id: admin.id,
          message,
          ticket_id: ticket.id
        };
        
        await createNotificationAndEmit(req, notification);
      }
    }
  } catch (error) {
    console.error('Error sending ticket update notifications:', error);
    // Don't throw - notifications are secondary to ticket updates
  }
};

// Helper function to create notification and emit via socket
const createNotificationAndEmit = async (req, notificationData) => {
  try {
    const result = await db.query(
      `INSERT INTO notifications (user_id, message, ticket_id, is_read, created_at)
       VALUES ($1, $2, $3, false, NOW())
       RETURNING *`,
      [notificationData.user_id, notificationData.message, notificationData.ticket_id]
    );
    
    const notification = result.rows[0];
    
    // Add ticket title for frontend display
    if (notificationData.ticket_id) {
      const ticketResult = await db.query(
        'SELECT title FROM tickets WHERE id = $1',
        [notificationData.ticket_id]
      );
      
      if (ticketResult.rows.length > 0) {
        notification.ticket_title = ticketResult.rows[0].title;
      }
    }
    
    // Emit via socket
    req.app.get('sendNotification')(notificationData.user_id, notification);
    
    // Send email notification
    try {
      const { getUserById } = require('../models/userModel');
      const { sendNotificationEmail } = require('../services/emailService');
      
      const user = await getUserById(notificationData.user_id);
      if (user && user.email) {
        const subject = notification.ticket_title ? 
          `Ticket Update: ${notification.ticket_title}` : 
          'EnovaTM Notification';
          
        await sendNotificationEmail(
          user.email,
          subject,
          notificationData.message,
          notificationData.ticket_id
        );
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Helper to format status for messages
const formatStatus = (status) => {
  switch (status) {
    case 'in_progress': return 'In Progress';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

module.exports = {
  getAllTickets: getAllTicketsHandler, // This maps the route handler to the correct name
  getTicket,
  getTicketsByStatus,
  getTicketsByPriority,
  addTicket,
  modifyTicketStatus,
  removeTicket,
  assignTicketToUser,
  escalateTicketToAdmin,
  adminReassignTicket
};