import { Request, Response, NextFunction } from 'express';
import { protect } from './auth';

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  await protect(req, res, () => {
    const user = (req as any).user;
    
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({
        status: 'error',
        message: 'Not authorized as admin',
      });
    }
  });
};
