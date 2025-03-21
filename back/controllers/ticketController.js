const {
    getTickets,
    getTicketById,
    getTicketByStatus,
    getTicketByPriority,
    createTicket,
    updateTicketStatus,
    deleteTicket,
    assignTicket,
    closeTicket,
    escalateTicket,         // Add this
    reassignEscalatedTicket // Add this
} = require('../models/ticketModel');

const { getUserDepartment } = require('../models/userModel');

const getAllTickets = async (req, res) => {
  try {
    const tickets = await getTickets();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
  const { title, description, priority, user_id, destination_department_id } = req.body;
  
  // Basic validation
  if (!title || !description || !priority || !user_id || !destination_department_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    // Auto-determine the source department from user's department
    const source_department_id = await getUserDepartment(user_id);
    
    const newTicket = await createTicket(
      title, 
      description, 
      priority,
      user_id, 
      source_department_id,
      destination_department_id
    );
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Simplified modifyTicketStatus function
const modifyTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const updatedTicket = await updateTicketStatus(id, status);
    
    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(updatedTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTicket = await deleteTicket(id);
    if (!deletedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(deletedTicket);
  } catch (err) {
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

module.exports = {
  getAllTickets,
  getTicket,
  getTicketsByStatus,
  getTicketsByPriority,
  addTicket,
  modifyTicketStatus,
  removeTicket,
  assignTicketToUser,
  escalateTicketToAdmin,  // Add this
  adminReassignTicket     // Add this
};