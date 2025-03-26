const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  getTicket,
  getTicketsByStatus,
  getTicketsByPriority,
  addTicket,
  modifyTicketStatus,
  removeTicket,  // Make sure this is imported
  assignTicketToUser,
  escalateTicketToAdmin,
  adminReassignTicket
} = require('../controllers/ticketController');
const { authenticateUser, authenticateAdmin } = require('../middleware/authMiddleware');
const { requireDestinationDepartment, requireDestinationDepartmentAdmin } = require('../middleware/ticketMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Public routes accessible to all authenticated users
router.get('/', getAllTickets);
router.get('/status/:status', getTicketsByStatus);
router.get('/priority/:priority', getTicketsByPriority);
router.get('/:id', getTicket);
router.post('/', addTicket);

// Routes that require destination department permissions
router.put('/:id/claim', requireDestinationDepartment, assignTicketToUser);
router.put('/:id/status', requireDestinationDepartment, modifyTicketStatus);
router.put('/:id/escalate', requireDestinationDepartment, escalateTicketToAdmin);

// Admin-only routes
router.delete('/:id', authenticateAdmin, removeTicket);
router.put('/:id/reassign', requireDestinationDepartmentAdmin, adminReassignTicket);

module.exports = router;

