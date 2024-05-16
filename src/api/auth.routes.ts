/* eslint-disable import/no-extraneous-dependencies */
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User, { IUser } from '../models/user.model';
import { generatePasswordResetHtml, sendEmail } from '../services/email.service';
import { authMiddleware } from '../middlewares';
import { UserDomain } from '../models/domain/user-domain.model';
import { generateRandomDigits } from '../utilities/calc';

const router = express.Router();

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
      resetCode: '',
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
      resetCode: '',
    };

    // Generate code
    const code = generateRandomDigits(6);

    // Send email with token to the user 
    sendEmail(userDomain.email, 'Password Reset', generatePasswordResetHtml(code)); 

    user.resetCode = code;
    user.save();

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset Password
router.post('/resetpassword', async (req: Request, res: Response) => {
  const { email, code, password, confirmationPassword  } = req.body;

  try {
    // Validate passwords
    if (password !== confirmationPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Retrieve user
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: 'Email is invaild' });
    }

    if (user.resetCode != code) {
      return res.status(400).json({ message: 'Code is invaild' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    user.password = hashedPassword;

    // // Clear/reset the token or mark it as used
    user.resetCode = null; // Reset the token after successful password reset

    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin Reset Password
router.post('/updatepassword',  authMiddleware, async (req: Request, res: Response) => {
  const { email, password, confirmationPassword } = req.body;

  try {
    const userDomain: UserDomain = new UserDomain(req.user);

    // Validate passwords
    if (password !== confirmationPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (!userDomain.getIsAdmin()) {
      return res.status(401).json({ message: 'Unauthorised' });
    }

    // Get user to update
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
