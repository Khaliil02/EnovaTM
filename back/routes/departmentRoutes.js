const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  getDepartment,
  addDepartment,
  modifyDepartment,
  removeDepartment,
} = require('../controllers/departmentController');

// Define your routes here
router.get('/', getAllDepartments);
router.get('/:id', getDepartment);
router.post('/', addDepartment);
router.put('/:id', modifyDepartment);
router.delete('/:id', removeDepartment); // Ensure this line is present

module.exports = router;

