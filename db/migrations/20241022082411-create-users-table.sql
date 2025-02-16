-- +migrate Up
-- Create users table
CREATE TABLE users
(
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    first_name      VARCHAR(50),
    last_name       VARCHAR(50),
    role            VARCHAR(50)              DEFAULT 'user',
    is_admin        BOOLEAN                  DEFAULT true,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

insert into users (email, hashed_password, first_name, last_name, role, is_admin)
values ('elihayun@gmail.com', '$2a$10$G7UQh/6kaHbvgCf7oJqWFOjrEhAM7lstKqktD7bKiQtTM.KlkXsBS', 'Eli', 'Hayun', 'admin', true);
-- +migrate Down
drop table users;
