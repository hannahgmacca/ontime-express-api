import express from 'express';
import User from '../models/user.model';
import { authMiddleware } from '../middlewares';
import { Types } from 'mongoose';

const router = express.Router();

// GET current user
router.get<{}>('/me', authMiddleware, async (req, res) => {
  try {
    const email = req.user.email;

    const user = await User.findOne({ email }).populate('jobsites');

    if (user) {
      return res.status(200).send(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET all
router.get('/', async (req, res) => {
  try {
    const user = await User.find({});

    if (user) {
      return res.status(200).send(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET user by Id
router.get<{ id: Types.ObjectId }>('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.find({ _id: userId });

    if (user) {
      return res.status(200).send(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH/update an existing jobsite by ID
router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const updatedJobsite = await User.findByIdAndUpdate(id, req.body, {
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

// DELETE a role by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRole = await User.findByIdAndDelete(id);

    if (!deletedRole) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
