/**
 * @swagger
 * tags:
 *   name: Info
 *   description: Информация о статусах и категориях
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StatusList:
 *       type: object
 *       properties:
 *         statuses:
 *           type: object
 *           properties:
 *             1:
 *               type: string
 *               example: Открыт
 *             2:
 *               type: string
 *               example: В процессе
 *             3:
 *               type: string
 *               example: Реализован
 *             4:
 *               type: string
 *               example: Закрыт
 *     CategoryList:
 *       type: object
 *       properties:
 *         categories:
 *           type: object
 *           properties:
 *             1:
 *               type: string
 *               example: Предложение функционала
 *             2:
 *               type: string
 *               example: Багрепорт
 *             3:
 *               type: string
 *               example: Предложение по улучшению
 *             4:
 *               type: string
 *               example: UI/UX
 */

import { Router, Request, Response, RequestHandler } from 'express';

const router = Router();

/**
 * @swagger
 * /api/info/statuses:
 *   get:
 *     summary: Получить список статусов фидбеков
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Список всех возможных статусов
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatusList'
 */

// получение всех статусов
router.get('/statuses', (req: Request, res: Response) => {
    res.json({
        statuses: {
            1: 'Открыт',
            2: 'В процессе',
            3: 'Реализован',
            4: 'Закрыт'
        }
    });
});


/**
 * @swagger
 * /api/info/categories:
 *   get:
 *     summary: Получить список категорий
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Список всех категорий
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryList'
 */

// получение всех категорий
router.get('/categories', (req: Request, res: Response) => {
    res.json({
        categories: {
            1: 'Предложение функционала',
            2: 'Багрепорт',
            3: 'Предложение по улучшению',
            4: 'UI/UX'
        }
    });
});

export default router;