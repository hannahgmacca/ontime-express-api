/* eslint-disable import/no-extraneous-dependencies */
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User, { IUser } from '../models/user.model';

const router = express.Router();

// SIGNUP
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, roles, jobsites, firstName, lastName, company } = req.body;

  try {
    const secretKey: string = process.env.SECRET_KEY || '';

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

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

    // Generate token
    const token = jwt.sign({ userId: newUser._id }, secretKey, {
      expiresIn: '1h',
    });

    res.status(201).send({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// SIGNIN
router.post('/signin', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const secretKey: string = process.env.SECRET_KEY || '';

    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userDomain: IUser = {
      _id: user._id,
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      roles: user.roles,
      jobsites: user.jobsites,
    };

    // Generate token
    const token = jwt.sign(userDomain, secretKey, {
      expiresIn: '7d',
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
