import express from 'express';
import Notification from '../models/notification.model';

const router = express.Router();

// GET all jobsites
router.get('/', async (req, res) => {
  try {
    const jobsites = await Notification.find();

    res.json(jobsites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET a specific notification by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST a new notification
router.post('/', async (req, res) => {
  try {
    const { name, city } = req.body;
    const newJobsite = await Notification.create({ name, city });
    res.status(201).json(newJobsite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH/update an existing notification by ID
router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const updatedJobsite = await Notification.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedJobsite) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(updatedJobsite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE a notification by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedJobsite = await Notification.findByIdAndDelete(id);

    if (!deletedJobsite) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
