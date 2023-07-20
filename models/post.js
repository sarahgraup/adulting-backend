"use strict";

/** Post class for Adulting */

const { NotFoundError } = require("../expressError");
const db = require("../db");

/** Posts on the site. */

class Post {

  /** Register new post -- returns
   *    {id, title, description, date}
   */

  static async create({ title, description, date }) {
    const result = await db.query(
          `INSERT INTO post (title,
                            description,
                            date)
             VALUES
               ($1, $2, current_timestamp)
             RETURNING id, title, description, date`,
        [title, description, date]);

    return result.rows[0];
  }

  /** Update likes for post
   *
   * updates the likes posts
   *
   * returns {id, read_at}
   *
   **/

//   static async likePost(post_id) {
//     const result = await db.query(
//           `INSERT INTO likes (username,
//                                 post_id)
//              WHERE post_id = $1

//              RETURNING post_id, username`,
//         [post_id]);
//     const likedPost = result.rows[0];

//     if (!likedPost) throw new NotFoundError(`No such post: ${likedPost}`);

//     return likedPost;
//   }

  /** Get: get post by id
   *
   * returns {id, title, description, date}
   *
   * user = {username, first_name, last_name, email}
   *
   */

  static async get(id) {
    const result = await db.query(
          `SELECT p.id,
                  p.username,
                  u.first_name,
                  u.last_name,
                  u.email,
                  p.title,
                  p.description,
                  p.date
             FROM posts AS p
                    JOIN users AS u ON u.username = p.username
             WHERE p.id = $1`,
        [id]);

    let p = result.rows[0];

    if (!p) throw new NotFoundError(`No such message: ${id}`);

    return {
      id: p.id,
      user: {
        username: p.username,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
      },
      title: p.title,
      description: p.description,
      date: p.date,
    };
  }

   /** Get: get usernames based on frequent posts about given type
    * USER DOES NOT ALREADY FOLLOW THEM
    * 
   *
   * returns {username}
   *
   * user = {username, first_name, last_name, email}
   *
   */
  static async getRecommendations(type) {
    const results = await db.query(
      `SELECT DISTINCT username
       FROM posts
       WHERE type = $1 AND username NOT IN (
         SELECT user_being_followed_id
         FROM follows
         WHERE user_following_id = $2
       )
       ORDER BY COUNT(*) DESC
       LIMIT 10`,
      [type, username]
    );

    return results.rows.map(r => r.username);
  }
}


module.exports = Post;