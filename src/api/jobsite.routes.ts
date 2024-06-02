import express from 'express';
import Jobsite from '../models/jobsite.model';

const router = express.Router();

// GET all jobsites
router.get('/', async (req, res) => {
  try {
    const jobsites = await Jobsite.find();

    res.json(jobsites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET a specific jobsite by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const jobsite = await Jobsite.findById(id);

    if (!jobsite) {
      return res.status(404).json({ message: 'Jobsite not found' });
    }

    res.json(jobsite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST a new jobsite
router.post('/', async (req, res) => {
  try {
    const { name, city } = req.body;
    const newJobsite = await Jobsite.create({ name, city });
    res.status(201).json(newJobsite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH/update an existing jobsite by ID
router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const updatedJobsite = await Jobsite.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedJobsite) {
      return res.status(404).json({ message: 'Jobsite not found' });
    }

    res.json(updatedJobsite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE a jobsite by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedJobsite = await Jobsite.findByIdAndDelete(id);

    if (!deletedJobsite) {
      return res.status(404).json({ message: 'Jobsite not found' });
    }

    res.json({ message: 'Jobsite deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;