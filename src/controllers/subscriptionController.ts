import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middlewares/authMiddleware';
import axios from 'axios';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/plans', async (req: Request, res: Response) => {
  const plans = await prisma.subscriptionPlan.findMany();
  res.json(plans);
});

router.post('/subscribe', authMiddleware, async (req: Request, res: Response) => {
  const { planId, paymentDetails } = req.body;

  // Verify payment with Paystack
  const response = await axios.get(`https://api.paystack.co/transaction/verify/${paymentDetails.reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
  });

  if (response.data.status === 'success') {
    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user.userId,
        planId,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // Assuming 1 year subscription
      }
    });
    res.json(subscription);
  } else {
    res.status(400).json({ message: 'Payment verification failed' });
  }
});

router.get('/user', authMiddleware, async (req: Request, res: Response) => {
  const subscription = await prisma.subscription.findUnique({ where: { userId: req.user.userId } });
  res.json(subscription);
});

export default router;
