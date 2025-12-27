import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { DataSource } from 'typeorm';
import { sendWalletPhrase, getWalletPhrases } from './mail';
import cron from 'node-cron';
import fetch from 'node-fetch';
import { WalletPhrase } from './entity/WalletPhrase';
import { User } from './entity/User';
import authenticateToken from './middlewares/auth';
import authRoutes from './controllers/auth.routes';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [WalletPhrase, User],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development', // Set to false in production
  logging: process.env.NODE_ENV === 'development',
  // Add SSL configuration for production environments like Render
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  extra: {
    max: 20, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000, // How long a connection can be idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait for a connection before timing out
  },
});


// Public routes
app.use('/api/auth', authRoutes); // Use the auth router for /api/auth/register and /api/auth/login
app.post('/api/send-wallet', sendWalletPhrase);
// Protected route
app.get('/api/phrases', authenticateToken, getWalletPhrases);

app.get('/', (_req, res) => {
  res.send('Backend API is running');
});

// Centralized error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// Cron job to ping the server every 5 minutes to keep it awake on Render
const SELF_URL: string = process.env.SELF_URL || 'https://pi-backend-vw0s.onrender.com'; // Set your Render URL in env
cron.schedule('*/5 * * * *', async () => {
  try {
    const res = await fetch(SELF_URL);
    console.log(`[CRON] Pinged ${SELF_URL} - Status: ${res.status}`);
  } catch (err) {
    console.error('[CRON] Error pinging self:', err);
  }
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
