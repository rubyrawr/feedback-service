import { pool } from '../index';

export class VoteModel {
  // метод для добавления голоса
  static async addVote(user_id: number, feedback_id: number) {
    const result = await pool.query(
      `INSERT INTO votes (user_id, feedback_id) VALUES ($1, $2) RETURNING *`,
      [user_id, feedback_id]
    );
    return result.rows[0];
  }

  // метод для удаления голоса
  static async removeVote(user_id: number, feedback_id: number) {
    await pool.query('DELETE FROM votes WHERE user_id = $1 AND feedback_id = $2', [user_id, feedback_id]);
  }

  // метод для подсчета голосов
  static async countVotes(feedback_id: number) {
    const result = await pool.query('SELECT COUNT(*) FROM votes WHERE feedback_id = $1', [feedback_id]);
    return parseInt(result.rows[0].count, 10);
  }

  // метод для проверки, голосовал ли пользователь
  static async hasVoted(user_id: number, feedback_id: number) {
    const result = await pool.query(
      'SELECT * FROM votes WHERE user_id = $1 AND feedback_id = $2',
      [user_id, feedback_id]
    );
    return result.rows.length > 0;
  }
}
