const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../models/departmentModel');

const getAllDepartments = async (req, res) => {
  try {
    const departments = await getDepartments();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    const department = await getDepartmentById(id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addDepartment = async (req, res) => {
  const { name } = req.body;
  try {
    const newDepartment = await createDepartment(name);
    res.status(201).json(newDepartment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const modifyDepartment = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedDepartment = await updateDepartment(id, name);
    if (!updatedDepartment) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(updatedDepartment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedDepartment = await deleteDepartment(id);
    if (!deletedDepartment) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(deletedDepartment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllDepartments,
  getDepartment,
  addDepartment,
  modifyDepartment,
  removeDepartment
};
