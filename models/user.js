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

  //get their posts, likes, dislikes, follows, followers, comments
  /** Return posts from this user.
   *
   * [{id, username, title, description, date}]
   *
   * where user is
   *   {username, first_name, last_name, email}
   */

  static async userPosts(username) {
    const results = await db.query(
      `SELECT p.id,
      p.username,
      p.title,
      p.type,
      p.description,
      p.date,
      u.username,
      u.first_name,
      u.last_name,
      u.email
      FROM posts AS p
      JOIN users AS u
      ON p.username = u.username
      WHERE p.username = $1`,
      [username]
    );

    return results.rows.map(r => r = {
      id: r.id,
      title: r.title,
      description: r.description,
      date: r.date,
      user: {
        first_name: r.first_name,
        last_name: r.last_name,
        username: r.username,
        email: r.email
      },

    });

  }

  /** Return likes from this user.
   *
   * [{id, username, title, description, date}]
   *
   * where post_creator_user is
   *   {username, first_name, last_name, email}
   */

  static async userLikes(username) {

    const results = await db.query(
      `SELECT l.post_id,
      l.username AS post_creator_username,
      p.id,
      p.username,
      p.title,
      p.type,
      p.description,
      p.date,
      u.username,
      u.first_name,
      u.last_name,
      u.email
      FROM likes AS l
      JOIN posts AS p
      ON l.post_id = p.id
      JOIN users AS u
      ON l.username = u.username
      WHERE l.username = $1`,
      [username]
    );

    return results.rows.map(r => ({
      id: r.id,
      username: r.post_creator_username,
      title: r.title,
      description: r.description,
      date: r.date,
      user: {
        username: r.post_creator_username,
        first_name: r.first_name,
        last_name: r.last_name,
        email: r.email
      }
    }));

  }

   /** Return dislikes from this user.
   *
   * [{id, username, title, description, date}]
   *
   * where post_creator_user is
   *   {username, first_name, last_name, email}
   */

  static async userDislikes(username) {

    const results = await db.query(
      `SELECT d.post_id,
      d.username AS post_creator_username,
      p.id,
      p.username,
      p.title,
      p.description,
      p.date,
      u.username,
      u.first_name,
      u.last_name,
      u.email
      FROM dislikes AS d
      JOIN posts AS p
      ON l.post_id = p.id
      JOIN users AS u
      ON l.username = u.username
      WHERE l.username = $1`,
      [username]
    );

    return results.rows.map(r => ({
      id: r.id,
      username: r.post_creator_username,
      title: r.title,
      description: r.description,
      date: r.date,
      user: {
        username: r.post_creator_username,
        first_name: r.first_name,
        last_name: r.last_name,
        email: r.email
      }
    }));

  }

  /** Return frequent post types from this user.
   *
   * returns {type}
   */

  static async getFrequentPostTypes(username) {
    const results = await db.query(
      `SELECT type
       FROM posts
       WHERE username = $1
       GROUP BY type
       ORDER BY COUNT(*) DESC`,
      [username]
    );

    return results.rows.map(r => r.type);
  }

  /** Returns users followers
  *
  * Returns follower
  *
  **/
  static async getFollowers(username) {
    const results = await db.query(
      `SELECT user_following_id AS follower
       FROM follows
       WHERE user_being_followed_id = $1`,
      [username]
    );

    return results.rows.map(r => r.follower);
  }
  /** Returns users followings
  *
  * Returns following
  *
  **/
  static async getFollowing(username) {
    const results = await db.query(
      `SELECT user_being_followed_id AS following
       FROM follows
       WHERE user_following_id = $1`,
      [username]
    );

    return results.rows.map(r => r.following);
  }

  /**Adds follower
   * returns user_following_id and user_being_followed_id
   * 
   * Throws NotFoundError is user not found 
   */
  static async addFollow(userFollowingId, userBeingFollowedId) {
    const result = await db.query(
      `INSERT INTO follows(user_following_id, user_being_followed_id)
       VALUES ($1, $2)
       RETURNING user_following_id, user_being_followed_id`,
      [userFollowingId, userBeingFollowedId]
    );

    const follow = result.rows[0];
    if (!follow) {
      throw new NotFoundError(`No such user: ${userBeingFollowedId}`);
    }

    return result.rows[0];
  }

   /**Removes follower
   * returns user_following_id and user_being_followed_id
   * 
   * Throws NotFoundError is user not found 
   */
  static async removeFollow(userFollowingId, userBeingFollowedId) {
    const result = await db.query(
      `DELETE FROM follows
       WHERE user_following_id = $1 AND user_being_followed_id = $2
       RETURNING user_following_id, user_being_followed_id`,
      [userFollowingId, userBeingFollowedId]
    );

    const removeFollow = result.rows[0];
    if (!removeFollow) {
      throw new NotFoundError(`No such user: ${userBeingFollowedId}`);
    }


    return result.rows[0];
  }

}