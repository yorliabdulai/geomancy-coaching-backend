import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middlewares/authMiddleware';
import sanityClient from '../sanityClient';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/free', async (req: Request, res: Response) => {
  const freeContent = await prisma.content.findMany({ where: { isFree: true } });
  res.json(freeContent);
});

router.get('/premium', authMiddleware, async (req: Request, res: Response) => {
  const premiumContent = await prisma.content.findMany({ where: { isFree: false } });
  res.json(premiumContent);
});

router.get('/blogs', async (req: Request, res: Response) => {
  const blogs = await sanityClient.fetch('*[_type == "post"]');
  res.json(blogs);
});

router.post('/blogs/comment', authMiddleware, async (req: Request, res: Response) => {
  const { postId, comment } = req.body;
  const newComment = await prisma.comment.create({
    data: {
      postId,
      authorId: req.user.userId,
      comment
    }
  });
  res.json(newComment);
});

router.post('/blogs/like', authMiddleware, async (req: Request, res: Response) => {
  const { postId } = req.body;
  const newLike = await prisma.like.create({
    data: {
      postId,
      userId: req.user.userId
    }
  });
  res.json(newLike);
});

export default router;
