"use strict";

const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");


async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await db.query(`
    INSERT INTO users(username,
                        password,
                        first_name,
                        last_name,
                        email,
                        bio,
                        image_url)
    VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com', 'u1 bio', 'u1url.jpg'),
            ('u2', $2, 'U2F', 'U2L', 'u2@email.com','u2 bio', 'u2url.jpg')
    RETURNING username`, [
    await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
    await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
  ]);

  const results = await db.query(`
      INSERT INTO posts(title, username, description)
      VALUES ('t1', 'u1', 'Desc1'),
             ('t2', 'u1', 'Desc2'),
             ('t3', 'u1', 'Desc3'),
             ('t4', 'u2', 'Desc4'),
             ('t5', 'u2', 'Desc5'),
             ('t6', 'u2', 'Desc6')
             RETURNING id`);

  //ids of each inserted post
  const testPostIds = [];
  testPostIds.splice(0, 0, ...resultsJobs.rows.map(r => r.id));


  await db.query(`
    INSERT INTO likes (username, post_id)
    VALUES ('u1' '$1'),
    ('u2' '$2'),
    ('u1' '$3')
    ('u1' '$4')`, 
    [testPostIds[0], testPostIds[1], testPostIds[3],testPostIds[4]]
  );
  
  await db.query(`
    INSERT INTO dislikes (username, post_id)
    VALUES ('u2' '$1'),
    ('u1' '$2')`, [testPostIds[2], testPostIds[5]]);

  await db.query(`
    INSERT INTO follows (user_being_followed_id, user_following_id)
    VALUES ('u2', 'u1'), ('u1', 'u2')`
  );

  await db.query(`
    INSERT INTO comments (text, username, post_id)
    VALUES ('comment made by u1 on post 4', 'u1', $1),
          ('comment made by u2 on post 1', 'u2', $2)`,
           [testPostIds[3], testPostIds[0]]
  );
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testPostIds,
};