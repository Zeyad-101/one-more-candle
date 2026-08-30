-- 1. Remove anon's ability to read the table directly.
revoke select on public.gifts from anon;

-- 2. Drop the old "anyone can read any row" policy — it's now moot since
--    anon has no table-level SELECT grant, but removing it avoids confusion.
drop policy if exists "public read gifts" on public.gifts;

-- 3. A narrow function: given an exact id, return that one row (or nothing).
--    SECURITY DEFINER means it runs with the owner's privileges, bypassing
--    RLS internally — that's fine here because the function itself is the
--    access control (it can only ever return the one row you ask for by id,
--    never a listing of all rows).
create or replace function public.get_gift(p_id text)
returns setof public.gifts
language sql
security definer
set search_path = public
as $$
  select * from public.gifts where id = p_id;
$$;

-- 4. Let anon call the function (but still not query the table directly).
grant execute on function public.get_gift(text) to anon;
