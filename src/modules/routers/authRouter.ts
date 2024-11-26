import express, { RequestHandler } from 'express';
import { Register, getUserProfile } from '../controllers/authControllers';
const router = express.Router();

router.post('/register', Register as RequestHandler);
router.get('/profile', getUserProfile as RequestHandler);

export default router;
