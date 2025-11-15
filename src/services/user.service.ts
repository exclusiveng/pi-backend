/**
 * @file Manages user data and business logic.
 * In a real-world application, this file would interact with a database.
 */

// --- Data Model ---
export interface User {
    id: number;
    username: string;
    passwordHash: string;
}

// --- In-Memory Database ---
const users: User[] = [];
let userIdCounter = 1;

// --- Configuration ---
export const ADMIN_LIMIT = 2;

// --- Service Functions ---

export const getAllUsers = (): User[] => {
    return users;
};

export const findUserByUsername = (username: string): User | undefined => {
    return users.find(u => u.username === username);
};

export const createUser = (username: string, passwordHash: string): User => {
    const newUser: User = {
        id: userIdCounter++,
        username,
        passwordHash,
    };
    users.push(newUser);
    return newUser;
};