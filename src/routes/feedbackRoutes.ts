/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Эндпоинты управления фидбеками пользователей
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FeedbackInput:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           description: Заголовок фидбека
 *         content:
 *           type: string
 *           description: Содержание фидбека
 *         category:
 *           type: integer
 *           description: ID категории
 */

import { Router, Request, Response, RequestHandler } from 'express';
import { FeedbackModel } from '../models/Feedback';
import { authorize, AuthRequest } from '../middleware/authorize';
const router = Router();

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Создать новый фидбек
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     description: Требуется JWT токен в заголовке Authorization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedbackInput'
 *     responses:
 *       201:
 *         description: Фидбек создан успешно
 *       400:
 *         description: Не переданы обязательные поля
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Ошибка сервера
 */

// метод для создания фидбека
router.post('/', authorize, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.body.title || !req.body.content || req.body.category > 4 || req.body.category < 1) {
    res.status(400).json({ message: 'Missing required fields or category exceeds available range' });
    return;
  } else if (!req.user) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  } else {
    req.body.author_id = req.user.id;
    console.log(req.body);
    try {
      const feedback = await FeedbackModel.createFeedback(req.body);
      res.status(201).json(feedback);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
});

/**
 * @swagger
 * /api/feedback:
 *   get:
 *     summary: Получить список фидбеков
 *     tags: [Feedback]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Фильтр по ID категории
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: Фильтр по ID статуса
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Количество элементов на странице
 *     responses:
 *       200:
 *         description: Список фидбеков с информацией о пагинации
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedbacks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FeedbackInput'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Общее количество фидбеков
 *                     page:
 *                       type: integer
 *                       description: Текущая страница
 *                     limit:
 *                       type: integer
 *                       description: Элементов на странице
 *                     pages:
 *                       type: integer
 *                       description: Всего страниц
 *       500:
 *         description: Ошибка сервера
 */

// получение всех фидбеков
router.get('/', async (req: Request, res: Response) => {
  try {

    if (!req.body.query) {
      req.body.query = {};
    }

    const filters = {
      category: req.body.query.category ? Number(req.body.query.category) : undefined,
      status: req.body.query.status ? Number(req.body.query.status) : undefined,
      page: req.body.query.page ? Number(req.body.query.page) : 1,
      limit: req.body.query.limit ? Number(req.body.query.limit) : 10
    };
    const feedbacks = await FeedbackModel.getAllFeedbacks(filters);
    res.json(feedbacks);
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * @swagger
 * /api/feedback/{id}:
 *   get:
 *     summary: Получить фидбек по ID
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID фидбека
 *     responses:
 *       200:
 *         description: Данные фидбека
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeedbackInput'
 *             example:
 *               id: 1
 *               title: "Пример фидбека"
 *               content: "Содержание фидбека"
 *               category: 1
 *               status: 1
 *               author_id: 1
 *       404:
 *         description: Фидбек не найден
 *       500:
 *         description: Ошибка сервера
 */

// получение фидбека по id
router.get('/:id', (async (req: Request, res: Response) => {
  try {
    const feedback = await FeedbackModel.getFeedbackById(Number(req.params.id));
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json(feedback);
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}) as RequestHandler);

/**
 * @swagger
 * /api/feedback/{id}:
 *   put:
 *     summary: Обновить фидбек
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     description: Требуется JWT токен в заголовке Authorization
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedbackInput'
 *     responses:
 *       200:
 *         description: Фидбек обновлен успешно
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Фидбек не найден
 *   delete:
 *     summary: Удалить фидбек
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     description: Требуется JWT токен в заголовке Authorization
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID фидбека для удаления
 *     responses:
 *       204:
 *         description: Фидбек успешно удален
 *       401:
 *         description: Не авторизован/Не является автором фидбека
 *       404:
 *         description: Фидбек не найден
 *       500:
 *         description: Ошибка сервера
 */

// обновление фидбека
router.put('/:id', authorize, (async (req: AuthRequest, res: Response) => {
  interface FeedbackUpdateFields {
    title?: string;
    content?: string;
    category?: number;
    status?: number;
  }

  try {
    if (!req.user) { return res.status(401).json({ message: 'Unauthorized' }) };
    if (req.body.status < 1 || req.body.status > 4) return res.status(401).json({ message: "Status can't be less than 1 or greater than 4"});

    Object.entries(req.body as FeedbackUpdateFields).forEach(([key, value]) => {
      if (key && !['title', 'content', 'category', 'status'].includes(key)) {
      throw new Error(`Invalid field: ${key}`);
      }
    });

    const feedback = await FeedbackModel.updateFeedback(Number(req.params.id), req.body);

    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    if (feedback.author_id !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

    

    res.json(feedback);
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}) as RequestHandler);

// удаление фидбека
router.delete('/:id', authorize, (async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { return res.status(401).json({ message: 'Unauthorized' }); };
    const feedback = await FeedbackModel.updateFeedback(Number(req.params.id), req.body);
    if (feedback.author_id !== req.user.id) { return res.status(401).json({ message: 'Unauthorized' }); };
    await FeedbackModel.deleteFeedback(Number(req.params.id));
    res.status(204).send("Success");
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}) as RequestHandler);

export default router;
