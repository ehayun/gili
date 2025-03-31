-- +migrate Up
CREATE TABLE pages
(
    id         serial PRIMARY KEY,
    slug       varchar(255) NOT NULL UNIQUE,
    title      varchar(255) NOT NULL,
    image_url  varchar(255) NOT NULL,
    content    text,
    keywords   text,
    menu_id    integer,
    parent_id  integer,
    created_at timestamp DEFAULT current_timestamp,
    updated_at timestamp DEFAULT current_timestamp,
    FOREIGN KEY (menu_id) REFERENCES menus (id),
    FOREIGN KEY (parent_id) REFERENCES pages (id)
);

-- +migrate Down
drop table pages;
