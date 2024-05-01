/* eslint-disable import/no-extraneous-dependencies */
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User, { IUser } from '../models/user.model';
import { generatePasswordResetHtml, sendEmail } from '../services/email.service';

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
      expiresIn: '7d',
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
      resetToken: '',
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

//PING
router.post('/ping', async (req: Request, res: Response) => {

  try {
    await sendEmail('hannahgmacca@gmail.com', 'Ping test', '<b>This is a test</b>');

    res.status(200).json('Success');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Forgot Password
router.post('/forgotpassword', async (req: Request, res: Response) => {
  const { email } = req.body;
  const secretKey: string = process.env.SECRET_KEY || '';

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
      resetToken: '',
    };

    // Generate token
    const token = jwt.sign(userDomain, secretKey, {
      expiresIn: '1d',
    });

    // Send email with token to the user (Replace this with your email sending logic)
    sendEmail(userDomain.email, 'Password Reset', generatePasswordResetHtml(token)); 

    user.resetToken = token;
    user.save();

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset Password
router.post('/resetpassword', async (req: Request, res: Response) => {
  const { token, password, confirmationPassword } = req.body;
  const secretKey: string = process.env.SECRET_KEY || '';

  try {
    // Validate passwords
    if (password !== confirmationPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const decodedToken = jwt.verify(token, secretKey) as IUser;

    // Check token validity and retrieve user
    const user = await User.findOne({ _id: decodedToken._id });

    if (!user || user.resetToken != token) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    user.password = hashedPassword;

    // // Clear/reset the token or mark it as used
    user.resetToken = null; // Reset the token after successful password reset

    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin Reset Password
router.post('/updatepassword', async (req: Request, res: Response) => {
  const { token, password, confirmationPassword } = req.body;
  const secretKey: string = process.env.SECRET_KEY || '';

  try {
    // Validate passwords
    if (password !== confirmationPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const decodedToken = jwt.verify(token, secretKey) as IUser;

    // Check token validity and retrieve user
    const user = await User.findOne({ _id: decodedToken._id });

    if (!user) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    user.password = hashedPassword;

    // // Clear/reset the token or mark it as used
    // user.token = null; // Reset the token after successful password reset

    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
