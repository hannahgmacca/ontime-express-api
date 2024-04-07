import express from 'express';
import Company from '../models/company.model';

const router = express.Router();

// GET all jobsites
router.get('/', async (req, res) => {
  try {
    const jobsites = await Company.find();

    res.json(jobsites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET a specific company by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST a new company
router.post('/', async (req, res) => {
  try {
    const { name, city } = req.body;
    const newJobsite = await Company.create({ name, city });
    res.status(201).json(newJobsite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH/update an existing company by ID
router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const updatedComppany = await Company.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedComppany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(updatedComppany);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE a company by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedComppany = await Company.findByIdAndDelete(id);

    if (!deletedComppany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
