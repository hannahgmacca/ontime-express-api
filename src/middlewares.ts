/* eslint-disable import/no-extraneous-dependencies */
/*  eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import ErrorResponse from './interfaces/ErrorResponse';
import Role, { RoleModel } from './models/role.model';
import Jobsite, { JobsiteModel } from './models/jobsite.model';
import { ObjectId } from 'mongoose';
import { JwtPayload } from './interfaces/JwtPayload';
import { IUser } from './models/user.model';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction,
) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}

// Middleware for authorization
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const secretKey: string = process.env.SECRET_KEY || '';

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Authorization token not provided' });
  }

  try {
    const decodedToken = jwt.verify(token, secretKey) as IUser;
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
