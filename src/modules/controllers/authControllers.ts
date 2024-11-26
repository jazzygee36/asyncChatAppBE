import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import User from '../models/users.schama';

const createToken = (email: string, userId: number) => {
  return sign({ email, userId }, process.env.JWT_KEY as string, {
    expiresIn: '48h',
  });
};

export const Register = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ message: 'Email, password, and username are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const existEmail = await User.findOne({ email });
  if (existEmail) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const users = await User.create({
      username,
      email,
      password: hashPassword,
    });

    res.cookie('jwt', createToken(email, users.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(201).json({ message: 'Registered successfully', users });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user with this email' });
    }

    const comparePwd = await bcrypt.compare(password, user.password);
    if (!comparePwd) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.cookie('jwt', createToken(email, user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserProfile = (req: Request, res: Response) => {
  try {
    // Placeholder logic - update as needed
    res.status(200).json({ message: 'User profile retrieved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
