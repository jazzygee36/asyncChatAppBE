import express, { RequestHandler } from 'express';
import {
  Register,
  getUserProfile,
  userLogin,
  authenticateToken,
  updateUserProfile
} from '../controllers/authControllers';
const router = express.Router();

router.post('/register', Register as RequestHandler);
router.post('/login', userLogin as RequestHandler);
router.get(
  '/profile',
  authenticateToken as RequestHandler,
  getUserProfile as RequestHandler
);
router.post(
  '/update-profile',
  authenticateToken as RequestHandler,
  updateUserProfile as RequestHandler
);

export default router;
