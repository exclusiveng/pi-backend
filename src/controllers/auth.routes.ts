import { Router, Request, Response } from 'express';
import { register, login } from '../controllers/auth.controller';
import authenticateToken, { AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new admin
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login an admin and get a token
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current user's profile (protected)
// @access  Private
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  // The user object is attached to the request by the authenticateToken middleware
  // We can send it back to the client as a confirmation of their identity.
  res.status(200).json(req.user);
});

export default router;
