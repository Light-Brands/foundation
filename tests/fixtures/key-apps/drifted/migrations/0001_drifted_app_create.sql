create table bookings (
  id uuid primary key,
  client_email text,
  paid text,
  nickname text,
  created_at timestamptz,
  updated_at timestamptz
);
