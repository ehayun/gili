
-- +migrate Up
create table pages (
    id serial primary key,
    slug varchar(255) not null unique ,
    title varchar(255) not null,
    image_url varchar(255) not null,
    content text ,
    menu_id integer,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    foreign key (menu_id) references menus(id)
);
-- +migrate Down
drop table pages;
