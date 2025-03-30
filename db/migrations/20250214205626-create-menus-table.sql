-- +migrate Up
create table menus
(
    id        serial primary key,
    title     varchar(255) not null,
    url       varchar(255) not null,
    order_num integer      not null default 1,
    parent_id integer,
    foreign key (parent_id) references menus (id)
);
insert into menus (id, title, url, order_num)
values (0, 'no menue', '/pages', 1);
-- +migrate Down
drop table menus;
