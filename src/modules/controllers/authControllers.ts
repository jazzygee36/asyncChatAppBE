import { NextFunction, Request, RequestHandler, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { sign } from 'jsonwebtoken';
import User from '../models/users.schama';

import 'express';

declare module 'express' {
  export interface Request {
    userId?: string;
  }
}

// const createToken = (email: string, userId: number) => {
//   return sign({ email, userId }, process.env.JWT_KEY as string, {
//     expiresIn: '48h',
//   });
// };

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

    // Generate a JWT token with the user profile ID in the payload
    const token = jwt.sign(
      {
        username: user.username,
        userId: user.id,
      },
      process.env.JWT_KEY as string, // Use the JWT secret from environment variables
      { expiresIn: '48h' } // Token expiration time
    );

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        username: user.username,

        image: user.image,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to authenticate the token
export const authenticateToken = (
  req: Request & { userId?: string }, // Extend Request type to include `userId`
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'You are not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY || '') as {
      userId: string;
    };

    if (decoded?.userId) {
      req.userId = decoded.userId; // Attach `userId` to request object
      next(); // Proceed to the next middleware
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Controller to get user profile
export const getUserProfile = async (
  req: Request & { userId?: string },
  res: Response
) => {
  try {
    if (!req.userId) {
      return res
        .status(400)
        .json({ message: 'User ID is missing in the request' });
    }

    const userData = await User.findById(req.userId);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        profileSetup: userData.profileSetup,
        username: userData.username,
        image: userData.image,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserProfile = async (
  req: Request & { userId?: string },
  res: Response
) => {
  const { userId, image } = req.body;

  if (!image || !userId) {
    return res.status(400).json({ message: 'Image is required.' });
  }

  try {
    const updateProfile = await User.findByIdAndUpdate(
      userId,
      {
        image,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );

    if (!updateProfile) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      user: {
        id: updateProfile.id,
        email: updateProfile.email,
        profileSetup: updateProfile.profileSetup,
        username: updateProfile.username,
        image: updateProfile.image,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
export const searchContacts: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { searchTerm } = req.body;

  if (!searchTerm) {
    res.status(400).json({ message: 'Search term is required' });
    return;
  }

  try {
    // Sanitize and prepare the search term
    const sanitizedSearchTerm = searchTerm.trim();
    const regex = new RegExp(sanitizedSearchTerm, 'i'); // Case-insensitive search

    // Perform the query
    const contacts = await User.find({
      _id: { $ne: req.userId }, // Exclude the current user
      $or: [
        { username: regex }, // Match username
        { email: regex }, // Match email if applicable
      ],
    });

    res.status(200).json({ contacts });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
};
