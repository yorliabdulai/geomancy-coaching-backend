import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middlewares/authMiddleware';
import axios from 'axios';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/books', async (req: Request, res: Response) => {
  const books = await prisma.book.findMany();
  res.json(books);
});

router.get('/books/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const book = await prisma.book.findUnique({ where: { id: Number(id) } });
  res.json(book);
});

router.post('/purchase', authMiddleware, async (req: Request, res: Response) => {
  const { bookId, quantity, paymentDetails } = req.body;

  // Verify payment with Paystack
  const response = await axios.get(`https://api.paystack.co/transaction/verify/${paymentDetails.reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
  });

  if (response.data.status === 'success') {
    const order = await prisma.order.create({
      data: {
        userId: req.user.userId,
        bookId,
        quantity,
        status: 'completed',
        paymentId: paymentDetails.reference
      }
    });
    res.json(order);
  } else {
    res.status(400).json({ message: 'Payment verification failed' });
  }
});

router.get('/orders', authMiddleware, async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.userId }
  });
  res.json(orders);
});

export default router;
