create table if not exists public.admin_users (
    user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from public, anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.admin_users
        where user_id = (select auth.uid())
    );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.products enable row level security;
revoke all on table public.products from anon, authenticated;
grant select on table public.products to anon, authenticated;
grant insert, update, delete on table public.products to authenticated;

drop policy if exists "Anyone can read products" on public.products;
create policy "Anyone can read products"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Only admins may insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Only admins may update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;
drop policy if exists "Only admins may delete products" on public.products;

drop policy if exists "Signed-in users can insert products" on public.products;
create policy "Signed-in users can insert products"
on public.products
for insert
to authenticated
with check (true);

drop policy if exists "Signed-in users can update products" on public.products;
create policy "Signed-in users can update products"
on public.products
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Signed-in users can delete products" on public.products;
create policy "Signed-in users can delete products"
on public.products
for delete
to authenticated
using (true);

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'public-image');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'public-image'
    and (select public.is_admin())
);

drop policy if exists "Only admins may upload product images" on storage.objects;
create policy "Only admins may upload product images"
on storage.objects
as restrictive
for insert
to public
with check (
    bucket_id <> 'public-image'
    or (select public.is_admin())
);

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'public-image'
    and (select public.is_admin())
)
with check (
    bucket_id = 'public-image'
    and (select public.is_admin())
);

drop policy if exists "Only admins may update product images" on storage.objects;
create policy "Only admins may update product images"
on storage.objects
as restrictive
for update
to public
using (
    bucket_id <> 'public-image'
    or (select public.is_admin())
)
with check (
    bucket_id <> 'public-image'
    or (select public.is_admin())
);

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'public-image'
    and (select public.is_admin())
);

drop policy if exists "Only admins may delete product images" on storage.objects;
create policy "Only admins may delete product images"
on storage.objects
as restrictive
for delete
to public
using (
    bucket_id <> 'public-image'
    or (select public.is_admin())
);

-- After creating the admin user in Supabase Auth, add that user's UUID here:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'admin@example.com'
-- on conflict do nothing;
