create table if not exists "order"
(
	id serial not null
		constraint order_pk
			primary key,
	order_number integer not null,
	order_date timestamp not null,
	cancelled boolean default false not null
);

create table if not exists line_item
(
	id serial not null
		constraint line_item_pk
			primary key,
	sku varchar not null,
	rush boolean default false,
	order_id integer
		constraint line_item_order_id_fk
			references "order"
);

create table if not exists component
(
	id serial not null
		constraint component_pk
			primary key,
	line_item_id integer not null
		constraint component_line_item_id_fk
			references line_item,
	status varchar default 'Pending'::character varying not null,
	size varchar not null,
	line_item_length numeric not null,
	line_item_width numeric not null,
	position_width integer not null
);

insert into "order" (id, order_number, order_date, cancelled) values (1, 2562, '2020-10-13 04:27:30.000000', 'false') ON CONFLICT DO NOTHING;
insert into "order" (id, order_number, order_date, cancelled) values (2, 2563, '2020-10-14 09:14:30.000000', 'false') ON CONFLICT DO NOTHING;
insert into "order" (id, order_number, order_date, cancelled) values (3, 2564, '2020-10-14 10:10:10.000000', 'false') ON CONFLICT DO NOTHING;
insert into "order" (id, order_number, order_date, cancelled) values (4, 2565, '2020-10-15 10:10:32.100000', 'true') ON CONFLICT DO NOTHING;
insert into "order" (id, order_number, order_date, cancelled) values (5, 2566, '2020-10-16 10:27:30.000000', 'false') ON CONFLICT DO NOTHING;
insert into "order" (id, order_number, order_date, cancelled) values (6, 2567, '2020-10-17 19:25:00.000000', 'false') ON CONFLICT DO NOTHING;

insert into line_item (id, sku, rush, order_id) values (1, 'RC-0027-27', 'false', 1) ON CONFLICT DO NOTHING;
insert into line_item (id, sku, rush, order_id) values (2, 'RC-0030-57', 'false', 1) ON CONFLICT DO NOTHING;
insert into line_item (id, sku, rush, order_id) values (3, 'RC-DY25-27', 'false', 2) ON CONFLICT DO NOTHING;
insert into line_item (id, sku, rush, order_id) values (4, 'RS-MY18-35', 'true', 3) ON CONFLICT DO NOTHING;
insert into line_item (id, sku, rush, order_id) values (5, 'RS-BS73-57', 'false', 4) ON CONFLICT DO NOTHING;
insert into line_item (id, sku, rush, order_id) values (6, 'RS-DS55-27', 'true', 5) ON CONFLICT DO NOTHING;
insert into line_item (id, sku, rush, order_id) values (7, 'RC-IH17-35', 'false', 5) ON CONFLICT DO NOTHING;
insert into line_item (id, sku, rush, order_id) values (8, 'RS-AH27-27', 'false', 6) ON CONFLICT DO NOTHING;

insert into component (id, line_item_id, status, size, line_item_length, line_item_width, position_width) values (1, 1, 'Pending', '2.5x7', 3.5, 2.5, 2) ON CONFLICT DO NOTHING;
insert into component (id, line_item_id, status, size, line_item_length, line_item_width, position_width) values (2, 2, 'Pending', '5x7', 7, 5, 1) ON CONFLICT DO NOTHING;
insert into component (id, line_item_id, status, size, line_item_length, line_item_width, position_width) values (3, 3, 'Pending', '2.5x7', 3.5, 2.5, 2) ON CONFLICT DO NOTHING;
insert into component (id, line_item_id, status, size, line_item_length, line_item_width, position_width) values (4, 4, 'Pending', '3x5', 5, 3, 1) ON CONFLICT DO NOTHING;
insert into component (id, line_item_id, status, size, line_item_length, line_item_width, position_width) values (5, 5, 'Cancelled', '5x7', 7, 5, 1) ON CONFLICT DO NOTHING;
insert into component (id, line_item_id, status, size, line_item_length, line_item_width, position_width) values (6, 6, 'Pending', '2.5x7', 3.5, 2.5, 2) ON CONFLICT DO NOTHING;
insert into component (id, line_item_id, status, size, line_item_length, line_item_width, position_width) values (7, 7, 'Pending', '3x5', 5, 3, 1) ON CONFLICT DO NOTHING;
insert into component (id, line_item_id, status, size, line_item_length, line_item_width, position_width) values (8, 8, 'Pending', '2.5x7', 3.5, 2.5, 2) ON CONFLICT DO NOTHING;
