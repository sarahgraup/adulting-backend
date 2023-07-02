"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/**Related functions for users */

class User {
  /** authenticate user with username, password.
 *
 * Returns { username, first_name, last_name, email, is_admin }
 *
 * Throws UnauthorizedError is user not found or wrong password.
 **/
  static async authenticate(username, password) {
    const result = await db.query(`
    SELECT username,
           password,
           first_name AS "firstName",
           last_name  AS "lastName",
           email
    FROM users
    WHERE username = $1`, [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
  *
  * Returns { username, firstName, lastName, email}
  *
  * Throws BadRequestError on duplicates.
  **/

  static async register(
    { username, password, firstName, lastName, email }) {
    const duplicateCheck = await db.query(`
      SELECT username
      FROM users
      WHERE username = $1`, [username],
    );

    if (duplicateCheck.rows.length > 0) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(`
              INSERT INTO users
              (username,
               password,
               first_name,
               last_name,
               email)
              VALUES ($1, $2, $3, $4, $5)
              RETURNING
                  username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email`,
      [
        username,
        hashedPassword,
        firstName,
        lastName,
        email,
      ],
    );

    const user = result.rows[0];

    return user;
  }

   /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, posts, likes, comments}
   *    where posts is { id, title, username, description}
   *    where likes is {username, post_id}
   *    where dislikes is {username, post_id}
   *    where comments is {text, username, post_id}
   *    where follows is {user_being_followed_id, user_following_id}
   * 
   *
   * Throws NotFoundError if user not found.
   **/

   static async get(username) {
    const userRes = await db.query(`
        SELECT username,
               first_name AS "firstName",
               last_name  AS "lastName",
               email,
        FROM users
        WHERE username = $1`, [username],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const userPosts = await db.query(`
        SELECT id, title, username, description
        FROM posts
        WHERE username = $1`, [username]);

    user.posts = userPosts.rows.map(p => p.id);
    return user;
  }

}