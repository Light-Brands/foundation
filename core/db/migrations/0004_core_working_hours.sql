alter table business_profile add column if not exists work_days text not null default '';
alter table business_profile add column if not exists work_start text not null default '';
alter table business_profile add column if not exists work_end text not null default '';
