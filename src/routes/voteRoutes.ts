/**
 * @swagger
 * tags:
 *   name: Votes
 *   description: Управление голосами за фидбеки
 */

import { Router, Request, Response, RequestHandler } from 'express';
import { addVote, removeVote, countVotes, hasVoted } from '../models/Vote';
import { getFeedbackById } from '../models/Feedback';
import { authorize, AuthRequest } from '../middleware/authorize';

const router = Router();

/**
 * @swagger
 * /api/vote/{feedbackId}:
 *   post:
 *     summary: Добавить голос к фидбеку
 *     tags: [Votes]
 *     security:
 *       - bearerAuth: []
 *     description: Требуется JWT токен в заголовке Authorization
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
 *                   example: 'Vote added'
 *       401:
 *         description: Пользователь не авторизован
 *       404:
 *         description: Фидбек не найден
 *       409:
 *         description: Пользователь уже голосовал за этот фидбек
 */

// добавление голоса фидбеку
router.post('/:feedbackId', authorize, (async (req: AuthRequest, res: Response) => {

  if (!req.user) return res.status(401).json({ message: 'Unauthorized' }); 
  
  try { 
    const feedbackId = Number(req.params.feedbackId);
    const userId = req.user.id;

    const feedback = await getFeedbackById(feedbackId);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    const voted = await hasVoted(userId, feedbackId);
    if (voted) return res.status(400).json({ message: 'Already voted' });

    await addVote(userId, feedbackId);
    res.status(201).json({ message: 'Vote added' });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error' });
  }
}) as RequestHandler);

/**
 * @swagger
 * /api/vote/{feedbackId}:
 *   delete:
 *     summary: Удалить голос из фидбека
 *     tags: [Votes]
 *     security:
 *       - bearerAuth: []
 *     description: Требуется JWT токен в заголовке Authorization
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
 *                   example: 'Vote removed'
 *       400:
 *         description: Голос не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No vote to remove'
 *       401:
 *         description: Пользователь не авторизован
 *       404:
 *         description: Фидбек не найден
 *       500:
 *         description: Ошибка сервера
 */

// удаление голоса фидбека
router.delete('/:feedbackId', authorize, (async (req: AuthRequest, res: Response) => {

  if (!req.user) return res.status(401).json({ message: 'Unauthorized' }); 

  try {
    const feedbackId = Number(req.params.feedbackId);
    const userId = req.user.id;

    const feedback = await getFeedbackById(feedbackId);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    const voted = await hasVoted(userId, feedbackId);
    if (!voted) return res.status(400).json({ message: 'No vote to remove' });

    await removeVote(userId, feedbackId);
    res.status(200).json({ message: 'Vote removed' });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error' });
  }
}) as RequestHandler);

export default router;
