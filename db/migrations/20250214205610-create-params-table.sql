
-- +migrate Up
create table params (
    id serial primary key,
    main_title varchar(255) not null,
    sub_title varchar(255) not null,
    phone varchar(255) not null,
    email varchar(255) not null,
    address varchar(255) not null,
    facebook varchar(255) not null,
    twitter varchar(255) not null,
    instagram varchar(255) not null,
    linkedin varchar(255) not null
);
-- +migrate Down
drop table params;
