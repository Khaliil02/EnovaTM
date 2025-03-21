const pool = require('../config/db');

const getTickets = async () => {
    const result = await pool.query('SELECT * FROM tickets');
    return result.rows;
}

const getTicketById = async (id) => {
    const query = 'SELECT * FROM tickets WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

const getTicketByStatus = async (status) => {
    const result = await pool.query('SELECT * FROM tickets WHERE status = $1', [status]);
    return result.rows;
}

const getTicketByPriority = async (priority) => {
    const result = await pool.query('SELECT * FROM tickets WHERE priority = $1', [priority]);
    return result.rows;
};

const createTicket = async (title, description, priority, user_id, source_department_id, destination_department_id) => {
    const result = await pool.query(
        'INSERT INTO tickets (title, description, priority, status, created_by, source_department_id, destination_department_id, creation_date, last_updated) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
        [title, description, priority, 'open', user_id, source_department_id, destination_department_id]
    );
    return result.rows[0];
};

const updateTicketStatus = async (id, status) => {
    const result = await pool.query(
        'UPDATE tickets SET status = $1, last_updated = NOW() WHERE id = $2 RETURNING *',
        [status, id]
    );
    
    return result.rows[0];
};

const deleteTicket = async (id) => {
    const result = await pool.query('DELETE FROM tickets WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};

const assignTicket = async (id, userId) => {
    const result = await pool.query(
        'UPDATE tickets SET assigned_to = $1, status = $2, last_updated = NOW() WHERE id = $3 RETURNING *',
        [userId, 'in_progress', id]
    );
    
    return result.rows[0];
};

const closeTicket = async (id, userId) => {
    const result = await pool.query(
        'UPDATE tickets SET status = $1, closed_by = $2, resolution_date = NOW(), last_updated = NOW() WHERE id = $3 RETURNING *',
        ['closed', userId, id]
    );
    
    return result.rows[0];
};

const searchTickets = async (searchTerm) => {
    const result = await pool.query(
        `SELECT * FROM tickets 
         WHERE title ILIKE $1 
         OR description ILIKE $1`,
        [`%${searchTerm}%`]
    );
    return result.rows;
};

const escalateTicket = async (id, userId, reason) => {
    const result = await pool.query(
        `UPDATE tickets 
         SET status = 'escalated', 
             last_updated = NOW(),
             escalation_reason = $1,
             escalated_by = $2
         WHERE id = $3 
         RETURNING *`,
        [reason, userId, id]
    );
    
    return result.rows[0];
};

const reassignEscalatedTicket = async (id, newAssigneeId, newDepartmentId, adminId) => {
    const result = await pool.query(
        `UPDATE tickets 
         SET assigned_to = $1, 
             destination_department_id = $2,
             status = 'in_progress',
             reassigned_by = $3,
             reassignment_date = NOW(),
             last_updated = NOW()
         WHERE id = $4 AND status = 'escalated'
         RETURNING *`,
        [newAssigneeId, newDepartmentId, adminId, id]
    );
    
    return result.rows[0];
};

module.exports = {
    getTickets,
    getTicketById,
    getTicketByStatus,
    getTicketByPriority,
    createTicket,
    updateTicketStatus,
    deleteTicket,
    assignTicket,
    closeTicket,
    searchTickets,
    escalateTicket,
    reassignEscalatedTicket
};