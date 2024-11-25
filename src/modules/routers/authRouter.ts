import express, { RequestHandler } from 'express';
import { Register } from '../controllers/authControllers';
const router = express.Router();

router.post('/register', Register as RequestHandler);
router.post('/login');

export default router;
