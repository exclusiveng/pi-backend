import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as UserService from '../services/user.service';

/**
 * Controller to handle new admin registration.
 */
export const register = async (req: Request, res: Response) => {
    const allUsers = UserService.getAllUsers();

    // 1. Check if the registration limit has been reached.
    if (allUsers.length >= UserService.ADMIN_LIMIT) {
        return res.status(403).json({ message: `Registration is closed. The maximum of admins has been reached.` });
    }

    try {
        const { username, password } = req.body;
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error('JWT_SECRET is not defined in environment variables.');
            return res.status(500).json({ message: 'Internal Server Error: JWT secret is not configured.' });
        }

        // 2. Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        // 3. Check if username already exists
        if (UserService.findUserByUsername(username)) {
            return res.status(409).json({ message: 'Username already exists.' });
        }

        // 4. Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // 5. Create and store the new user via the service
        const newUser = UserService.createUser(username, passwordHash);

        // 6. Generate a JWT
        const tokenPayload = { id: newUser.id, username: newUser.username };
        const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '1h' });

        // 7. Send the token to the client
        res.status(201).json({
            message: 'Admin registered successfully.',
            accessToken: token,
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error('JWT_SECRET is not defined in environment variables.');
            return res.status(500).json({ message: 'Internal Server Error: JWT secret is not configured.' });
        }

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        // 1. Find the user by username
        const user = UserService.findUserByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // Use a generic message
        }

        // 2. Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // Use a generic message
        }

        // 3. Generate a JWT
        const tokenPayload = { id: user.id, username: user.username };
        const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '1h' });

        // 4. Send the token to the client
        res.json({
            message: 'Login successful.',
            accessToken: token,
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
}
