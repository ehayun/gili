
-- +migrate Up
create table cards (
    id serial primary key,
    title varchar(255) not null,
    image_url varchar(255) not null,
    content text not null,
    order_num integer not null default 1
);
-- +migrate Down
drop table cards;
