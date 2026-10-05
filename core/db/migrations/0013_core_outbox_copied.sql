-- When the owner copied an approved email to send it from their own mail. The automatic sender never claims a
-- copied row, so a copy and the sender can never both send one email, even after a connection turns active later.
-- Such a row waits for "I sent it" or a cancel.
alter table outbox add column if not exists copied_at timestamptz;
