import express from 'express';
import Jobsite from '../models/jobsite.model';
import { authMiddleware } from '../middlewares';
import { UserDomain } from '../models/domain/user-domain.model';
import User from '../models/user.model';
import Role from '../models/role.model';
import { getJobsiteQuery } from '../utilities/query';

const router = express.Router();

// GET all jobsites
router.get('/', async (req, res) => {
  try {
    const query = getJobsiteQuery(req);
    const jobsites = await Jobsite.find(query);

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

    if (!jobsite || !jobsite.isActive) {
      return res.status(404).json({ message: 'Jobsite not found' });
    }

    res.json(jobsite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST a new jobsite
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user: UserDomain = new UserDomain(req.user);

    if (!user.getIsAdmin) {
      res.status(403).json({ message: 'Unauthorized' });
    }

    const { name, city } = req.body;
    const newJobsite = await Jobsite.create({ name, city });
    res.status(201).json(newJobsite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH/update an existing jobsite by ID
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const user: UserDomain = new UserDomain(req.user);

    if (!user.getIsAdmin) {
      res.status(403).json({ message: 'Unauthorized' });
    }
    const updatedJobsite = await Jobsite.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedJobsite || !updatedJobsite.isActive) {
      return res.status(404).json({ message: 'Jobsite not found' });
    }

    res.json(updatedJobsite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE a jobsite by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const user: UserDomain = new UserDomain(req.user);

    if (!user.getIsAdmin) {
      res.status(403).json({ message: 'Unauthorized' });
    }

    const deletedJobsite = await Jobsite.findById(id);

    if (!deletedJobsite || !deletedJobsite.isActive) {
      return res.status(404).json({ message: 'Jobsite not found' });
    }

    deletedJobsite.isActive = false;
    deletedJobsite.save();

    res.json({ message: 'Jobsite deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// returns jobsite and it's list of supervisors
router.get('/:id/user', authMiddleware, async (req, res) => {
  const { id, userId } = req.params;

  try {
    const user: UserDomain = new UserDomain(req.user);

    if (!user.getIsAdmin) {
      res.status(403).json({ message: 'Unauthorized' });
    }

    const jobsite = await Jobsite.findById(id);

    if (!jobsite || !jobsite.isActive) {
      return res.status(404).json({ message: 'Jobsite not found' });
    }

    const supervisors = await User.find({ jobsites: id, isActive: true });

    return res.status(200).json({jobsite, supervisors: supervisors});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// create a new existing user jobsite
router.post('/:id/user/:userId', authMiddleware, async (req, res) => {
  const { id, userId } = req.params;

  try {
    const user: UserDomain = new UserDomain(req.user);

    if (!user.getIsAdmin) {
      res.status(403).json({ message: 'Unauthorized' });
    }

    const userToUpdate = await User.findById(userId);
    const jobsiteToUpdate = await Jobsite.findById(id);

    if (!userToUpdate || !jobsiteToUpdate || !userToUpdate.isActive || !jobsiteToUpdate.isActive) {
      return res.status(404).json({ message: 'User or jobsite does not exist' });
    }

    if (userToUpdate.jobsites.some((j) => j.equals(jobsiteToUpdate._id))) {
      return res.status(200).json({ message: 'User already assigned to this jobsite' });
    } else {
      userToUpdate.jobsites.push(jobsiteToUpdate._id);
      userToUpdate.save();
    }

    return res.status(200).json({ message: 'Successfully added user to jobsite' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// delete an existing user jobsite
router.delete('/:id/user/:userId', authMiddleware, async (req, res) => {
  const { id, userId } = req.params;

  try {
    const user: UserDomain = new UserDomain(req.user);

    if (!user.getIsAdmin) {
      res.status(403).json({ message: 'Unauthorized' });
    }

    const userToUpdate = await User.findById(userId);
    const jobsiteToUpdate = await Jobsite.findById(id);

    if (!userToUpdate || !jobsiteToUpdate || !userToUpdate.isActive || !jobsiteToUpdate.isActive)
      return res.status(404).json({ message: 'User or jobsite does not exist' });

    if (userToUpdate.jobsites.some((j) => j.equals(jobsiteToUpdate._id))) {
      const jobsiteDeleteIndex = userToUpdate.jobsites.findIndex((j) => j._id == jobsiteToUpdate._id);
      userToUpdate.jobsites.splice(jobsiteDeleteIndex, 1);
      userToUpdate.save();
    } else {
      return res.status(200).json({ message: 'User not assigned to this jobsite' });
    }

    return res.status(200).json({ message: 'Successfully deleted user jobsite' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
