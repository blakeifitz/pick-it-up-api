BEGIN;

TRUNCATE
  users CASCADE;

INSERT INTO users (username, full_name, password, id)
VALUES
  (
    'admin',
    'Dunder Mifflin Admin',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG', 1
  ),
    ('dunder', 'Dunder Mifflin', '$2a$12$lHK6LVpc15/ZROZcKU00QeiD.RyYq5dVlV/9m4kKYbGibkRc5l4Ne',4),
  ('b.deboop', 'Bodeep Deboop', '$2a$12$VQ5HgWm34QQK2rJyLc0lmu59cy2jcZiV6U1.bE8rBBnC9VxDf/YQO', 2),
  ('c.bloggs', 'Charlie Bloggs', '$2a$12$2fv9OPgM07xGnhDbyL6xsuAeQjAYpZx/3V2dnu0XNIR27gTeiK2gK', 3);


INSERT INTO locations (name, description, coordinates, user_id, id )
VALUES
    ('test 1', 'This is a test location', POINT(36.1564, -84.1284), 1, 1),
     ('test 2', 'This is a test location', POINT(36.2564, -84.2284), 1, 2),
      ('test 3', 'This is a test location', POINT(36.3564, -84.3284), 1, 3);

INSERT INTO categories (id, user_id, title )
VALUES(1, 1, 'fossils'),
(2, 1, 'foraging'),
(3, 1, 'artifacts');

INSERT INTO items (name, description, img_src, category, user_id, location)
VALUES

    ('test', 'this is a test item', 'https://firebasestorage.googleapis.com/v0/b/pick-it-up-897da.appspot.com/o/images%2Fno-image.png?alt=media', 'fossils', 1, 1),
     ('test 2', 'this is a test item', 'https://firebasestorage.googleapis.com/v0/b/pick-it-up-897da.appspot.com/o/images%2Fno-image.png?alt=media', 'fossils', 1, 2),
      ('test 3', 'this is a test item', 'https://firebasestorage.googleapis.com/v0/b/pick-it-up-897da.appspot.com/o/images%2Fno-image.png?alt=media', 'fossils', 1, 3);


COMMIT;
