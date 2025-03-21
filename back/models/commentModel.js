const pool = require('../config/db');

const getCommentsByTicketId = async (ticketId) => {
    const result = await pool.query(`
        SELECT c.*, u.name as user_name 
        FROM ticket_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.ticket_id = $1
        ORDER BY c.creation_date ASC
    `, [ticketId]);
    
    return result.rows;
};

const createComment = async (ticketId, userId, content) => {
    const result = await pool.query(`
        INSERT INTO ticket_comments 
        (ticket_id, user_id, content, creation_date) 
        VALUES ($1, $2, $3, NOW())
        RETURNING *
    `, [ticketId, userId, content]);
    
    return result.rows[0];
};

const deleteComment = async (commentId, userId) => {
    // Only allow deletion by the comment author
    const result = await pool.query(`
        DELETE FROM ticket_comments 
        WHERE id = $1 AND user_id = $2
        RETURNING *
    `, [commentId, userId]);
    
    return result.rows[0];
};

module.exports = {
    getCommentsByTicketId,
    createComment,
    deleteComment
};