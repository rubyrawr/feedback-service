import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import userRoutes from './routes/userRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import voteRoutes from './routes/voteRoutes';
import infoRoutes from './routes/infoRoutes';
import { swaggerOptions } from './swaggerOptions';

dotenv.config();

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const app = express();
const PORT = process.env.PORT || 5000;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

console.log(process.env.DB_HOST);


app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/users', userRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/info', infoRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

