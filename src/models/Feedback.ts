import { pool } from '../index';
import { VoteModel } from './Vote';

interface Feedback {
  id?: number;
  title: string;
  content: string;
  category: number;
  status: number;
  author_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface FilterOptions {
  category?: number;
  status?: number;
  page?: number;      
  limit?: number;    
}

export class FeedbackModel {

  // метод для создания фидбека
  static async createFeedback(feedback: Feedback) {
    const result = await pool.query(
      `INSERT INTO feedbacks (title, content, category, author_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [feedback.title, feedback.content, feedback.category, feedback.author_id]
    );
    return result.rows[0];
  }
  
  // метод для получения фидбека по id
  static async getFeedbackById(id: number) {
    const result = await pool.query('SELECT * FROM feedbacks WHERE id = $1', [id]);
    
    if (result.rows[0]) result.rows[0].votes = await VoteModel.countVotes(result.rows[0].id);
    
    return result.rows[0];
  }

  // метод для получения всех фидбеков
  static async getAllFeedbacks(filters?: FilterOptions) {
    let query = 'SELECT * FROM feedbacks';
    let values: number[] = [];
    
    if (filters) {
      let conditions: string[] = [];
      if (typeof filters.category === 'number') {
        conditions = [...conditions, `category = $${values.length + 1}`];
        values = [...values, filters.category];
      }
      if (typeof filters.status === 'number') {
        conditions = [...conditions, `status = $${values.length + 1}`];
        values = [...values, filters.status];
      }
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (${query}) AS filtered_feedbacks`, 
      values
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // пагинация
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;
    
    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values = [...values, limit, offset];

    const feedbacks = await pool.query(query, values);
    
    // подсчет голосов
    for (const feedback of feedbacks.rows) {
      feedback.votes = await VoteModel.countVotes(feedback.id);
    }

    return {
      feedbacks: feedbacks.rows,
      pagination: {
        total: totalCount,
        page: page,
        limit: limit,
        pages: Math.ceil(totalCount / limit)
      }
    };
  }

// метод для обновления фидбека
  static async updateFeedback(id: number, updates: Partial<Feedback>) {
    const fields = Object.keys(updates).map((field, index) => `${field} = $${index + 1}`).join(', ');
    let values = Object.values(updates);
    values = [...values, id]

    const result = await pool.query(
      `UPDATE feedbacks SET ${fields}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );
    return result.rows[0];
  }

// метод для удаления фидбека
  static async deleteFeedback(id: number) {
    await pool.query('DELETE FROM feedbacks WHERE id = $1', [id]);
  }
}
