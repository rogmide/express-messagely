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

  async register() {
    try {
      const hashpwd = await bcrypt.hash(this.password, BCRYPT_WORK_FACTOR);
      const results = await db.query(
        `
        insert into users (username, password, first_name, last_name, phone, join_at, last_login_at)
        values ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
        returning username, password
        `,
        [this.username, hashpwd, this.first_name, this.last_name, this.phone]
      );

      return results.rows[0];
    } catch (error) {
      return error;
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  async authenticate() {
    try {
      const results = await db.query(
        `
      select username, password
      from users
      where username = $1
      `,
        [this.username]
      );

      const user = results.rows[0];
      if (user) {
        let username = this.username;
        if (await bcrypt.compare(this.password, user.password)) {
          const token = jwt.sign({ username }, SECRET_KEY);
          return token;
        }
      }

      throw new ExpressError(`Invalid username/password!`, 400);
    } catch (error) {
      return error;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {}

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
