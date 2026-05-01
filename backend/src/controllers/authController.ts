import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import User from '../models/User';
import OTP from '../models/OTP';
import { sendEmail } from '../services/emailService';
import crypto from 'crypto';

// Generate JWT Token
const generateToken = (id: string): string => {
  // @ts-ignore - JWT types issue with config
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

// Generate OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.create({
      email,
      otp,
      expiresAt: otpExpiry,
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - AI Passport Photo Maker Pro',
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
      html: `<h1>Email Verification</h1><p>Your OTP is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please verify your email with the OTP sent.',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Registration failed',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      status: 'success',
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Login failed',
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() },
      verified: false,
    });

    if (!otpRecord) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired OTP',
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.json({
      status: 'success',
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'OTP verification failed',
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that email',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Send reset email
    const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click this link to reset: ${resetUrl}`,
      html: `<h1>Password Reset</h1><p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });

    res.json({
      status: 'success',
      message: 'Password reset email sent',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to send reset email',
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token',
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      status: 'success',
      message: 'Password reset successful',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Password reset failed',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user._id);

    res.json({
      status: 'success',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get user data',
    });
  }
};
