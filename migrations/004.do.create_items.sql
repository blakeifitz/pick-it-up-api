
DROP TABLE IF EXISTS items;

CREATE TABLE items (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    img_src TEXT NOT NULL,
    category TEXT REFERENCES categories(title) ON DELETE CASCADE NOT NULL ,
    location INTEGER REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL
);