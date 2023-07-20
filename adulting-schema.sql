CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  bio TEXT,
  image_url TEXT
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE likes (
  username VARCHAR(25) 
    REFERENCES users ON DELETE CASCADE,
  post_id SERIAL
    REFERENCES posts ON DELETE CASCADE,
  PRIMARY KEY (username, post_id)
);

CREATE TABLE dislikes (
  username VARCHAR(25) 
    REFERENCES users ON DELETE CASCADE,
  post_id SERIAL
    REFERENCES posts ON DELETE CASCADE,
  PRIMARY KEY (username, post_id)
);

CREATE TABLE follows (
  user_being_followed_id VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  user_following_id VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  PRIMARY KEY (user_being_followed_id, user_following_id)
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    username VARCHAR(25) 
        REFERENCES users ON DELETE CASCADE,
    post_id SERIAL
        REFERENCES posts ON DELETE CASCADE
);