import express from 'express';
import User from '../models/user.model';
import { authMiddleware } from '../middlewares';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserDomain } from '../models/domain/user-domain.model';
import { generateRandomDigits } from '../utilities/calc';
import { generateWelcomeEmailHtml, sendEmail } from '../services/email.service';
import { getUserQuery } from '../utilities/query';

const router = express.Router();

// POST
router.post('/', authMiddleware, async (req, res) => {
  const user: UserDomain = new UserDomain(req.user);
  const { email, roles, jobsites, firstName, lastName, company } = req.body;

  try {
    if (!user.getIsAdmin()) return res.status(403).send({ message: 'Unauthorised' });

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send({ message: 'User already exists' });
    }

    const randomPassword: string = generateRandomDigits(8);

    // Send email with token to the user
    sendEmail(email, 'Password Reset', generateWelcomeEmailHtml(randomPassword, email))
      .then(async () => {
        // Hash the password
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Create new user
        const newUser = new User({
          email,
          password: hashedPassword,
          roles,
          jobsites,
          firstName,
          lastName,
          company,
        });
        await newUser.save();

        return res.status(201).send(newUser);
      })
      .catch((error) => {
        return res.status(500).send({ message: 'Internal server error' });
      });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// GET all
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userDomain: UserDomain = new UserDomain(req.user);

    if (userDomain.getIsAdmin() || userDomain.getIsSupervisor()) {
      const query = await getUserQuery(req, userDomain);
      
      const user = await User.find(query);

      if (user) {
        return res.status(200).send(user);
      }
    }

    return res.status(403).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET user by Id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const userDomain: UserDomain = new UserDomain(req.user);

    if (userDomain.getIsAdmin() || userDomain.getIsSupervisor()) {
      const user = await User.find({ _id: userId, isActive: true });

      if (user) {
        return res.status(200).send(user);
      }
    }

    return res.status(403).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH/update an existing jobsite by ID
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { email, firstName, lastName, jobsites, roles } = req.body;

  try {
    const userDomain: UserDomain = new UserDomain(req.user);

    if (userDomain.getIsAdmin() || userDomain.getIsSupervisor()) {
      const updatedUser = await User.findById(id);

      if (!updatedUser || !updatedUser.isActive) {
        return res.status(404).json({ message: 'User not found' });
      }

      updatedUser.email = email;
      updatedUser.firstName = firstName;
      updatedUser.lastName = lastName;
      updatedUser.jobsites = jobsites;
      updatedUser.roles = roles;

      updatedUser.save();
      return res.json(updatedUser);
    }

    return res.status(403).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE a user by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const userDomain: UserDomain = new UserDomain(req.user);

    if (userDomain.getIsAdmin()) {
      const deletedUser = await User.findById(id);

      if (!deletedUser || !deletedUser.isActive) {
        return res.status(404).json({ message: 'User not found' });
      }

      deletedUser.isActive = false;
      deletedUser.save();
  
      return res.json({ message: 'User deleted successfully' });
    }

    return res.status(403).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
