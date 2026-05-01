import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import User, { IUser } from '../models/User';

interface JwtPayload {
  id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found',
      });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized, token failed',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as IUser;
    
    if (!roles.includes(user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `User role ${user.role} is not authorized to access this route`,
      });
    }
    
    next();
  };
};
