INSERT INTO users (username, password, first_name, last_name, email, bio, image_url)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'test@test.com',
        'test bio',
        'testUrl.jpg'),
       ('testuser2',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test2',
        'User2!',
        'test2@test2.com',
        'test2 bio',
        'test2Url.jpg');

INSERT INTO posts (id, title, username, description, type, date)
VALUES ( 1,
        'How to clean your moldy tub',
        'testuser',
        'remove caulk from tub by using caulk softener. i like goo gone or Krud Kutter',
        'home repairs',
        '7-20-23'),
       (2,
        'Best way to cook rice',
        'testuser2',
        'if you dont have a crock pot, rinse rice first',
        'cooking tips',
        '6-12-22');

INSERT INTO likes(username, post_id)
VALUES 
  ('testuser', 2),
  ('testuser2', 1);

INSERT INTO follows(user_being_followed_id, user_following_id)
VALUES 
  ('testuser', 'testuser2'),
  ('testuser2', 'testuser');