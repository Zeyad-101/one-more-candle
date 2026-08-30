-- One More Candle — table-level grants for the anon role
-- Run AFTER 01_schema.sql
--
-- Why this is needed: 01_schema.sql enables RLS and creates SELECT/INSERT
-- policies, but does NOT grant the base table privileges to the `anon` role.
-- Without these GRANTs, the anon role gets a 42501 "permission denied for
-- table gifts" error from PostgREST, even when the policies would allow it.

grant select, insert on public.gifts to anon;