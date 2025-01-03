/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth: 
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT 
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Электронная почта пользователя
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: Пароль пользователя
 *           example: "********"
 *         avatar:
 *           type: string
 *           nullable: true
 *           description: Ссылка на аватар пользователя
 *           example: "https://example.com/avatar.jpg"
 */


import { Router, Request, Response, RequestHandler } from 'express';
import { createUser, editUser, findByEmail, findById } from '../models/User';
import { authorize, AuthRequest } from '../middleware/authorize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
const router = Router();

// TODO: добавить возможность изменения профилей пользователей, добавить привелегии администратора, запретить обычным пользователям менять статус фидбека

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Зарегестрировать нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *       400:
 *         description: Неверный формат данных
 *       500:
 *         description: Ошибка сервера
 */

// регистрация нового пользователя
router.post('/register', (async (req: Request, res: Response) => {
  try {
    if (!req.body.email || !req.body.password) return res.status(400).json({ message: 'Invalid data' });

    const { email, password, avatar } = req.body;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!pattern.test(email)) return res.status(400).json({ message: 'Invalid email' });
    const user = await createUser({ email, password, avatar });
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: 'Unknown error' });
  }
}) as RequestHandler);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Аутентификация пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Неверные учетные данные
 *       404:
 *         description: Пользователь не найден
 */

// аутентификация пользователя
router.post('/login', (async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await findByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '48h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error' });
  }
}) as RequestHandler);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Получить профиль текущего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Требуется JWT токен в заголовке Authorization
 *     responses:
 *       200:
 *         description: Профиль текущего пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: Не авторизован - отсутствует токен/неверный токен
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */

// получение профиля текущего пользователя
router.get('/me', authorize, (async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const user = await findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Unknown error' });
  }
}) as RequestHandler);

/**
 * @swagger
 * /api/users/edit:
 *   post:
 *     summary: Редактировать профиль пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Требуется JWT токен в заголовке Authorization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Новый email пользователя
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Новый пароль
 *               avatar:
 *                 type: string
 *                 nullable: true
 *                 description: Ссылка на новый аватар
 *     responses:
 *       200:
 *         description: Профиль успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: Не авторизован - отсутствует токен/неверный токен
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */

// редактирование профиля пользователя
router.post('/edit', authorize, (async (req: AuthRequest, res: Response) => {
  interface UserEditFields {
    email?: string;
    password?: string;
    avatar?: string;
  }

  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    Object.entries(req.body as UserEditFields).forEach(([key]) => {
      if (key && !['email', 'password', 'avatar'].includes(key)) {
        res.send(400).json({ message: `Invalid field: ${key}` });
      }
    });

    const { email, password, avatar } = req.body;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!pattern.test(email)) return res.status(400).json({ message: 'Invalid email' });

    const result = await editUser({ email, password, avatar, id: req.user.id });
    res.json(result);
    
  } catch (error) {
    
  }
}) as RequestHandler);

export default router;