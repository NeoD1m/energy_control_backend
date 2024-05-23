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

CREATE TABLE admins (
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

CREATE TABLE user_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    action VARCHAR(255) NOT NULL,
    file_id INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL
);

INSERT INTO admins (name, password) VALUES ('admin', '$argon2id$v=19$m=65536,t=3,p=4$vLzzSfT5Meb9evy0YXuniQ$h44fuu37MuH6h5qZIzEoFLS0fNVPLSwE/ZnsgT1CIaQ');