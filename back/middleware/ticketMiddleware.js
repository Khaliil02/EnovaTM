const { getTicketById } = require('../models/ticketModel');
const { getUserById } = require('../models/userModel');

// Middleware to check if user belongs to the destination department of a ticket
const requireDestinationDepartment = async (req, res, next) => {
  try {
    // Get ticket ID from request params
    const ticketId = req.params.id;
    
    // Get user ID from JWT token (set by authenticateUser middleware)
    const userId = req.user.id;
    
    // Get ticket details
    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Get user details
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user is part of the destination department
    if (user.department_id !== ticket.destination_department_id) {
      return res.status(403).json({ 
        error: 'Access denied. Only users from the destination department can perform this action.'
      });
    }
    
    // If user belongs to the destination department, proceed
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const requireDestinationDepartmentAdmin = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;
    
    // Get ticket and user details
    const ticket = await getTicketById(ticketId);
    const user = await getUserById(userId);
    
    if (!ticket || !user) {
      return res.status(404).json({ error: 'Ticket or user not found' });
    }
    
    // Check if user is admin AND belongs to destination department
    if (!user.is_admin || user.department_id !== ticket.destination_department_id) {
      return res.status(403).json({ 
        error: 'Access denied. Only administrators from the destination department can perform this action.' 
      });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  requireDestinationDepartment,
  requireDestinationDepartmentAdmin
};