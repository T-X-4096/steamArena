-- db/migrations/001_profiles.sql
-- Creates the profiles table for role-based access control.
-- Run this in your Supabase SQL editor.

create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    role text not null default 'editor'
        check (role in ('admin', 'editor', 'public')),
    created_at timestamptz not null default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, display_name, role)
    values (new.id, new.email, 'editor');
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Enable RLS on profiles (users can only read their own profile)
alter table profiles enable row level security;

create policy "Users can read own profile"
    on profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id);
