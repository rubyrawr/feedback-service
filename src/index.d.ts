// Декларации для переменных окружения

declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    JWT_SECRET: string;
  }
}
  
// Декларации для моделей

declare module 'models/User' {
  export interface User {
    id?: number;
    email: string;
    password: string;
    avatar?: string;
  }

  export class UserModel {
    static createUser(user: User): Promise<User>;
    static findByEmail(email: string): Promise<User | null>;
    static findById(id: number): Promise<User | null>;
  }
}

declare module 'models/Feedback' {
  export interface Feedback {
    id?: number;
    title: string;
    description: string;
    category: string;
    status: string;
    author_id: number;
    created_at?: Date;
    updated_at?: Date;
  }

  export class FeedbackModel {
    static createFeedback(feedback: Feedback): Promise<Feedback>;
    static getAllFeedbacks(): Promise<Feedback[]>;
    static getFeedbackById(id: number): Promise<Feedback | null>;
    static updateFeedback(id: number, updates: Partial<Feedback>): Promise<Feedback | null>;
    static deleteFeedback(id: number): Promise<void>;
  }
}

declare module 'models/Vote' {
  export interface Vote {
    user_id: number;
    feedback_id: number;
  }

  export class VoteModel {
    static addVote(user_id: number, feedback_id: number): Promise<Vote>;
    static removeVote(user_id: number, feedback_id: number): Promise<void>;
    static countVotes(feedback_id: number): Promise<number>;
    static hasVoted(user_id: number, feedback_id: number): Promise<boolean>;
  }
}


// Декларации для Express Request

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: number }; // Для добавления информации о пользователе
  }
}

declare module 'middleware/authorize' {
  import { Request, Response, NextFunction } from 'express';

  export interface JWTPayload {
    id: number;
    email: string;
    iat: number;
    exp: number;
  }

  export interface AuthenticatedUser {
    id: number;
    email: string;
  }

  export interface AuthRequest extends Request {
    user?: AuthenticatedUser;
  }
  
  export function authorize(
    req: Request, 
    res: Response, 
    next: NextFunction
  ): Promise<void>;
}
  