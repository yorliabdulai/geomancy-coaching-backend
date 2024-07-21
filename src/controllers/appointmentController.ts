import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  const appointments = await prisma.appointment.findMany();
  res.json(appointments);
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { expertId, startTime, endTime, price } = req.body;
  const appointment = await prisma.appointment.create({
    data: {
      userId: req.user.userId,
      expertId,
      startTime,
      endTime,
      status: 'pending',
      price
    }
  });
  res.json(appointment);
});

router.get('/user', authMiddleware, async (req: Request, res: Response) => {
  const appointments = await prisma.appointment.findMany({
    where: { userId: req.user.userId }
  });
  res.json(appointments);
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.appointment.delete({ where: { id: Number(id) } });
  res.status(204).end();
});

export default router;
