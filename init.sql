CREATE TABLE files (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        name VARCHAR(255),
        type VARCHAR(255),
        data BYTEA);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL);

CREATE TABLE user_favourites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    file_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);