
-- +migrate Up
create table cards (
    id serial primary key,
    title varchar(255) not null,
    image_url varchar(255) not null,
    menu_id integer not null,
    content text not null,
    order_num integer not null default 1,
    foreign key (menu_id) references menus(id) on delete cascade on update cascade
);
-- +migrate Down
drop table cards;
