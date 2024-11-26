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
    return res.status(401).json({ message: 'email and password required' });
  }
  const existEmail = await User.findOne({ email });
  if (existEmail) {
    return res.status(401).json({ message: 'email already exist' });
  }

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    const users = await User.create({
      username,
      email,
      password: hashPassword,
    });
    res.cookie('jwt', createToken(email, users.id), {
      secure: true,
      sameSite: 'none',
    });

    return res.status(200).json({ message: `Resgister Successfully`, users });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const getUserProfile = (req: Request, res: Response) => {
  try {
    console.log('users');
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
