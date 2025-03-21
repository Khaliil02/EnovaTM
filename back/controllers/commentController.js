const { 
    getCommentsByTicketId, 
    createComment,
    deleteComment
} = require('../models/commentModel');

const getTicketComments = async (req, res) => {
    // Convert from camelCase parameter to a number (critical)
    const ticketId = parseInt(req.params.ticketId, 10);
    
    if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
    }
    
    try {
        const comments = await getCommentsByTicketId(ticketId);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addComment = async (req, res) => {
    // Convert from camelCase parameter to a number
    const ticketId = parseInt(req.params.ticketId, 10);
    const { content } = req.body;
    const userId = req.user.id;
    
    if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
    }
    
    // Validate input
    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Comment content cannot be empty' });
    }
    
    try {
        const newComment = await createComment(ticketId, userId, content);
        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const removeComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    
    try {
        const deletedComment = await deleteComment(commentId, userId);
        
        if (!deletedComment) {
            return res.status(404).json({ 
                error: 'Comment not found or you do not have permission to delete it' 
            });
        }
        
        res.json(deletedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getTicketComments,
    addComment,
    removeComment
};