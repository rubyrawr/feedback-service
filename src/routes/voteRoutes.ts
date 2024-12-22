/**
 * @swagger
 * tags:
 *   name: Голоса
 *   description: Управление голосами за фидбекы
 */

import { Router, Request, Response, RequestHandler } from 'express';
import { VoteModel } from '../models/Vote';
import { FeedbackModel } from '../models/Feedback';
import { authorize } from '../middleware/authorize';

interface AuthRequest extends Request {
  user?: {
    id: number;
    [key: string]: any;
  }
}

const router = Router();

/**
 * @swagger
 * /api/vote/{feedbackId}:
 *   post:
 *     summary: Добавить голос к фидбеку
 *     tags: [Голоса]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID фидбека для голосования
 *     responses:
 *       201:
 *         description: Голос успешно добавлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Голос учтен'
 *       401:
 *         description: Пользователь не авторизован
 *       404:
 *         description: Фидбек не найден
 *       409:
 *         description: Пользователь уже голосовал за этот фидбек
 */

// добавление голоса фидбеку
router.post('/:feedbackId', authorize, (async (req: AuthRequest, res: Response) => {

  if (!req.user) { return res.status(401).json({ message: 'Unauthorized' }); }
  
  try { 
    const feedbackId = Number(req.params.feedbackId);
    const userId = req.user.id;

    const feedback = await FeedbackModel.getFeedbackById(feedbackId);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    const hasVoted = await VoteModel.hasVoted(userId, feedbackId);
    if (hasVoted) return res.status(400).json({ message: 'Already voted' });

    await VoteModel.addVote(userId, feedbackId);
    res.status(201).json({ message: 'Vote added' });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}) as RequestHandler);

/**
 * @swagger
 * /api/vote/{feedbackId}:
 *   delete:
 *     summary: Удалить голос из фидбека
 *     tags: [Голоса]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID фидбека для удаления голоса
 *     responses:
 *       200:
 *         description: Голос успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Голос удален'
 *       400:
 *         description: Голос не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Голос не найден'
 *       401:
 *         description: Пользователь не авторизован
 *       404:
 *         description: Фидбек не найден
 *       500:
 *         description: Ошибка сервера
 */

// удаление голоса фидбека
router.delete('/:feedbackId', authorize, (async (req: AuthRequest, res: Response) => {

  if (!req.user) { return res.status(401).json({ message: 'Unauthorized' }); }

  try {
    const feedbackId = Number(req.params.feedbackId);
    const userId = req.user.id;

    const feedback = await FeedbackModel.getFeedbackById(feedbackId);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    const hasVoted = await VoteModel.hasVoted(userId, feedbackId);
    if (!hasVoted) return res.status(400).json({ message: 'No vote to remove' });

    await VoteModel.removeVote(userId, feedbackId);
    res.status(200).json({ message: 'Vote removed' });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}) as RequestHandler);

export default router;
