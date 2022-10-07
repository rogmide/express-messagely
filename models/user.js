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

  static async all() {
    try {
      const results = await db.query(
        `
        select username, first_name, last_name, phone, last_login_at, join_at 
        from users;
          `
      );
      if (!results.rows) {
        throw new ExpressError(`Not users found in the DataBase`);
      }
      return results.rows.map((u) => new User(u));
    } catch (error) {
      return error;
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    try {
      const results = await db.query(
        `
        select username, first_name, last_name, phone, join_at, last_login_at
        from users
        where username = $1;
          `,
        [username]
      );
      if (!results.rows[0]) {
        throw new ExpressError(`User not found: ${username}`);
      }
      return results.rows[0];
    } catch (error) {
      return error;
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    try {
      const results = await db.query(
        `
        select m.id, m.body, m.sent_at, m.read_at, m.to_username, u.first_name, u.last_name, u.phone 
        from messages as m
        join users as u 
        on m.to_username = u.username
        where m.from_username = $1;
          `,
        [username]
      );
      if (!results.rows[0]) {
        throw new ExpressError(`User not found: ${username}`);
      }

      // id: expect.any(Number),
      // body: "u1-to-u2",
      // sent_at: expect.any(Date),
      // read_at: null,
      // to_user: {
      //   username: "test2",
      //   first_name: "Test2",
      //   last_name: "Testy2",
      //   phone: "+14155552222",
      // }

      return results.rows.map((m) => ({
        id: m.id,
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
        to_user: {
          username: m.to_username,
          first_name: m.first_name,
          last_name: m.last_name,
          phone: m.phone,
        },
      }));
    } catch (error) {
      return error;
    }
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    try {
      const results = await db.query(
        `
        select m.id, m.body, m.sent_at, m.read_at, m.from_username, u.first_name, u.last_name, u.phone 
        from messages as m
        join users as u 
        on m.from_username = u.username
        where m.to_username = $1
          `,
        [username]
      );
      if (!results.rows[0]) {
        throw new ExpressError(`User not found: ${username}`);
      }

      return results.rows.map((m) => ({
        id: m.id,
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
        from_user: {
          username: m.from_username,
          first_name: m.first_name,
          last_name: m.last_name,
          phone: m.phone,
        },
      }));
    } catch (error) {
      return error;
    }
  }
}

module.exports = User;
