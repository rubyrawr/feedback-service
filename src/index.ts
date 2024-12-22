import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import userRoutes from './routes/userRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import voteRoutes from './routes/voteRoutes';
import infoRoutes from './routes/infoRoutes';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Сервис обратной связи API',
      version: '1.0.0',
      description: 'API документация для сервиса обратной связи'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Сервер разработки',
      },
    ],
    components: {
      schemas: {
        Feedback: {
          type: 'object',
          properties: {
            id: { 
              type: 'integer',
              description: 'Уникальный идентификатор фидбека'
            },
            title: { 
              type: 'string',
              description: 'Заголовок фидбека'
            },
            content: { 
              type: 'string',
              description: 'Содержание фидбека'
            },
            category: { 
              type: 'integer',
              description: 'ID категории'
            },
            status: { 
              type: 'integer',
              description: 'Статус фидбека'
            },
            author_id: { 
              type: 'integer',
              description: 'ID автора'
            },
            created_at: { 
              type: 'string', 
              format: 'date-time',
              description: 'Дата создания'
            },
            updated_at: { 
              type: 'string', 
              format: 'date-time',
              description: 'Дата обновления'
            }
          }
        },
        Vote: {
          type: 'object',
          required: ['user_id', 'feedback_id'],
          properties: {
            id: { 
              type: 'integer',
              description: 'Уникальный идентификатор голоса'
            },
            user_id: { 
              type: 'integer',
              description: 'ID пользователя, который проголосовал'
            },
            feedback_id: { 
              type: 'integer',
              description: 'ID фидбека, за который проголосовали'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/users', userRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/info', infoRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

