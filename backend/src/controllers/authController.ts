import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { sendOtpEmail } from '../lib/email';
import { sendServerError } from '../lib/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const PASSWORD_RESET_SECRET = process.env.PASSWORD_RESET_SECRET || `${JWT_SECRET}-password-reset`;

const createResetToken = (email: string) =>
  jwt.sign({ email, scope: 'password-reset' }, PASSWORD_RESET_SECRET, { expiresIn: '15m' });

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'STAFF',
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    sendServerError(res, error, 'Unable to create account right now');
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    sendServerError(res, error, 'Unable to sign in right now');
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpires },
    });

    await sendOtpEmail(email, otp);

    res.json({ message: 'A 6-digit verification code has been sent to your email.' });
  } catch (error) {
    sendServerError(res, error, 'Unable to send verification code');
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const resetToken = createResetToken(email);

    await prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpires: null,
      },
    });

    res.json({ message: 'OTP verified successfully', resetToken });
  } catch (error) {
    sendServerError(res, error, 'Unable to verify code');
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password, resetToken } = req.body;

    if (!email || !password || !resetToken) {
      return res.status(400).json({ message: 'Email, new password, and reset token are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const decoded = jwt.verify(resetToken, PASSWORD_RESET_SECRET) as { email: string; scope: string };
    if (decoded.scope !== 'password-reset' || decoded.email !== email) {
      return res.status(401).json({ message: 'Invalid reset session. Please request a new code.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpires: null,
      },
    });

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Reset session expired. Please verify your code again.' });
    }

    sendServerError(res, error, 'Unable to reset password');
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    sendServerError(res, error, 'Unable to fetch user profile');
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpires },
    });

    await sendOtpEmail(email, otp);

    res.json({ message: 'A new 6-digit verification code has been sent to your email.' });
  } catch (error) {
    sendServerError(res, error, 'Unable to resend verification code');
  }
};
