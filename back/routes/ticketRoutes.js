const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/ticketController');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');
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
router.put('/:id/escalate', requireDestinationDepartment, escalateTicketToAdmin); // Add this

// Admin-only routes
router.delete('/:id', requireAdmin, removeTicket);
router.put('/:id/reassign', requireDestinationDepartmentAdmin, adminReassignTicket); // Add this

module.exports = router;

