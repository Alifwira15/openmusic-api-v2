const { nanoid } = require( 'nanoid');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users(id, username, password, fullname) VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };
    const result = await this._pool.query(query);
    if (result.rowCount > 0) {
      throw new InvariantError('Username sudah digunakan');
    }
  }

  async getPasswordByUsername(username) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0];
  }
}

module.exports = UsersService;