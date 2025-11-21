import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'; // Corrected import
import * as dotenv from 'dotenv';
dotenv.config();

// Define a more specific type for our JWT payload
interface TokenPayload extends JwtPayload {
    id: string; // Changed to string to match User entity's UUID
    email: string; // Changed to email to match User entity
}

export interface AuthenticatedRequest extends Request {
    user?: { id: string; email: string }; // Updated to match TokenPayload
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer TOKEN"

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET is not defined in environment variables.');
        return res.status(500).json({ message: 'Internal Server Error: JWT secret is not configured.' });
    }

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        // Type-guard to ensure the decoded payload is what we expect
        const payload = decoded as TokenPayload;
        req.user = { id: payload.id, email: payload.email }; // Updated to set email
        next();
    });
};

export default authenticateToken;