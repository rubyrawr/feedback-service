/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: 'Авторизация с помощью JWT токена'
 * 
 *   responses:
 *     UnauthorizedError:
 *       description: Нет авторизации
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: 'Не авторизован'
 *               error:
 *                 type: string
 *                 example: 'Неверный токен'
 * 
 *   schemas:
 *     AuthToken:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: 'JWT токен для авторизации'
 *           example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 */

import jwt from 'jsonwebtoken';
import { RequestHandler, Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authorize: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(401).json({ message: 'Unauthorized', error: errorMessage });
    return;
  }
};