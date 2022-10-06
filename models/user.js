/** User class for message.ly */

/** User of the site. */

const db = require("../db");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");

class User {
  constructor({ username, password, first_name, last_name, phone }) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
  }

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    try {
      const hashpwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const results = await db.query(
        `
        insert into users (username, password, first_name, last_name, phone, join_at, last_login_at)
        values ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
        returning username, password
        `,
        [username, hashpwd, first_name, last_name, phone]
      );

      return results.rows[0];
    } catch (error) {
      return error;
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try {
      const results = await db.query(
        `
      select username, password
      from users
      where username = $1
      `,
        [username]
      );

      const user = results.rows[0];
      if (user) {
        return await bcrypt.compare(password, user.password);
      }
    } catch (error) {
      return error;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    try {
      const results = await db.query(
        `
        update users 
        set last_login_at = current_timestamp 
        where username = $1
        `,
        [username]
      );
      if (results.rows[0] === null) {
        throw new ExpressError(`User not found: ${username}`);
      }
    } catch (error) {
      return error;
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {}

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {}

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {}

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {}
}

module.exports = User;
