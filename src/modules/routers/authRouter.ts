import express, { RequestHandler } from 'express';
import {
  Register,
  getUserProfile,
  userLogin,
  authenticateToken,
} from '../controllers/authControllers';
const router = express.Router();

router.post('/register', Register as RequestHandler);
router.post('/login', userLogin as RequestHandler);
router.get(
  '/profile',
  authenticateToken as RequestHandler,
  getUserProfile as RequestHandler
);

export default router;
