import api from './api';

// Existing functions
const getAllTickets = async () => {
  const response = await api.get('/tickets');
  return response.data;
};

const getTicketById = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

const getTicketsByStatus = async (status) => {
  const response = await api.get(`/tickets/status/${status}`);
  return response.data;
};

const getTicketsByPriority = async (priority) => {
  const response = await api.get(`/tickets/priority/${priority}`);
  return response.data;
};

const createTicket = async (ticketData) => {
  const response = await api.post('/tickets', ticketData);
  return response;
};

const updateTicketStatus = async (id, status) => {
  const response = await api.put(`/tickets/${id}/status`, { status });
  return response.data;
};

const claimTicket = async (id) => {
  const response = await api.put(`/tickets/${id}/claim`);
  return response.data;
};

const escalateTicket = async (id) => {
  const response = await api.put(`/tickets/${id}/escalate`);
  return response.data;
};

const reassignTicket = async (id, userId) => {
  const response = await api.put(`/tickets/${id}/reassign`, { userId });
  return response.data;
};

// Add the delete ticket function
const deleteTicket = async (id) => {
  const response = await api.delete(`/tickets/${id}`);
  return response.data;
};

export {
  getAllTickets,
  getTicketById,
  getTicketsByStatus,
  getTicketsByPriority,
  createTicket,
  updateTicketStatus,
  claimTicket,
  escalateTicket,
  reassignTicket,
  deleteTicket
};