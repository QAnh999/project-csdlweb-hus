const db = require('../database/config');

class User {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.query(query);
    console.log('✅ Users table created/verified');
  }

  static async create(userData) {
    const { name, email } = userData;
    const query = `
      INSERT INTO users (name, email) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    const result = await db.query(query, [name, email]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await db.query('SELECT * FROM users ORDER BY id');
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
}

module.exports = User;