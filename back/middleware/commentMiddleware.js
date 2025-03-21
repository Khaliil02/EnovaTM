const { getTicketById } = require('../models/ticketModel');
const { getUserById } = require('../models/userModel');

const canAddComment = async (req, res, next) => {
    try {
        const { ticketId } = req.params;
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
        
        // Check if user is allowed to comment:
        // 1. Ticket creator
        // 2. Ticket assignee
        // 3. Admin from destination department
        const isCreator = ticket.created_by === userId;
        const isAssignee = ticket.assigned_to === userId;
        const isDestinationDeptAdmin = user.is_admin && user.department_id === ticket.destination_department_id;
        
        if (isCreator || isAssignee || isDestinationDeptAdmin) {
            next();
        } else {
            return res.status(403).json({ 
                error: 'Only the ticket creator, assignee, or destination department admin can add comments' 
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    canAddComment
};