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
import { RequestHandler, Request, Response } from 'express';

interface JWTPayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

interface AuthenticatedUser {
  id: number;
  email: string;
}

interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authorize: RequestHandler = (req: AuthRequest, res: Response, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(401).json({ message: 'Unauthorized', error: errorMessage });
    return;
  }
};