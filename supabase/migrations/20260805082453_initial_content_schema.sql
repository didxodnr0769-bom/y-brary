create extension if not exists pgcrypto with schema extensions;

create table public.projects (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 120),
  summary text not null check (char_length(summary) between 1 and 300),
  description text not null check (char_length(description) between 1 and 2000),
  thumbnail_path text not null,
  thumbnail_alt text not null check (char_length(thumbnail_alt) between 1 and 200),
  github_url text,
  live_url text,
  published_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_images (
  id uuid primary key default extensions.gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null,
  alt_text text not null check (char_length(alt_text) between 1 and 200),
  caption text check (caption is null or char_length(caption) <= 300),
  sort_order integer not null check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (project_id, sort_order)
);

create table public.reviews (
  id uuid primary key default extensions.gen_random_uuid(),
  kind text not null check (kind in ('book', 'film')),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 200),
  creator text not null check (char_length(creator) between 1 and 200),
  consumed_on date not null,
  rating numeric(2, 1) not null check (
    rating between 0.5 and 5.0
    and mod(rating * 2, 1) = 0
  ),
  summary text not null check (char_length(summary) between 1 and 300),
  body text not null check (char_length(body) between 1 and 2000),
  cover_path text not null,
  cover_alt text not null check (char_length(cover_alt) between 1 and 200),
  published_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_published_at_idx on public.projects (published_at desc);
create index project_images_project_id_idx on public.project_images (project_id, sort_order);
create index reviews_kind_published_at_idx on public.reviews (kind, published_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.reviews enable row level security;

revoke all on table public.projects, public.project_images, public.reviews
from public, anon, authenticated;

grant select on table public.projects, public.project_images, public.reviews
to anon, authenticated;

grant select, insert, update, delete on table public.projects, public.project_images, public.reviews
to service_role;

create policy "published projects are publicly readable"
on public.projects
for select
to anon, authenticated
using (published_at <= now());

create policy "published project images are publicly readable"
on public.project_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = project_images.project_id
      and projects.published_at <= now()
  )
);

create policy "published reviews are publicly readable"
on public.reviews
for select
to anon, authenticated
using (published_at <= now());

create function public.publish_project(p_payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_project_id uuid;
begin
  insert into public.projects (
    slug,
    title,
    summary,
    description,
    thumbnail_path,
    thumbnail_alt,
    github_url,
    live_url,
    published_at
  ) values (
    p_payload ->> 'slug',
    p_payload ->> 'title',
    p_payload ->> 'summary',
    p_payload ->> 'description',
    p_payload ->> 'thumbnailPath',
    p_payload ->> 'thumbnailAlt',
    nullif(p_payload ->> 'githubUrl', ''),
    nullif(p_payload ->> 'liveUrl', ''),
    (p_payload ->> 'publishedAt')::timestamptz
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    description = excluded.description,
    thumbnail_path = excluded.thumbnail_path,
    thumbnail_alt = excluded.thumbnail_alt,
    github_url = excluded.github_url,
    live_url = excluded.live_url,
    published_at = excluded.published_at
  returning id into v_project_id;

  delete from public.project_images where project_id = v_project_id;

  insert into public.project_images (
    project_id,
    storage_path,
    alt_text,
    caption,
    sort_order
  )
  select
    v_project_id,
    screenshot.value ->> 'storagePath',
    screenshot.value ->> 'alt',
    nullif(screenshot.value ->> 'caption', ''),
    screenshot.ordinal - 1
  from jsonb_array_elements(
    coalesce(p_payload -> 'screenshots', '[]'::jsonb)
  ) with ordinality as screenshot(value, ordinal);

  return v_project_id;
end;
$$;

create function public.publish_review(p_payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_review_id uuid;
begin
  insert into public.reviews (
    kind,
    slug,
    title,
    creator,
    consumed_on,
    rating,
    summary,
    body,
    cover_path,
    cover_alt,
    published_at
  ) values (
    p_payload ->> 'kind',
    p_payload ->> 'slug',
    p_payload ->> 'title',
    p_payload ->> 'creator',
    (p_payload ->> 'consumedOn')::date,
    (p_payload ->> 'rating')::numeric,
    p_payload ->> 'summary',
    p_payload ->> 'body',
    p_payload ->> 'coverPath',
    p_payload ->> 'coverAlt',
    (p_payload ->> 'publishedAt')::timestamptz
  )
  on conflict (slug) do update set
    kind = excluded.kind,
    title = excluded.title,
    creator = excluded.creator,
    consumed_on = excluded.consumed_on,
    rating = excluded.rating,
    summary = excluded.summary,
    body = excluded.body,
    cover_path = excluded.cover_path,
    cover_alt = excluded.cover_alt,
    published_at = excluded.published_at
  returning id into v_review_id;

  return v_review_id;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.publish_project(jsonb) from public, anon, authenticated;
revoke all on function public.publish_review(jsonb) from public, anon, authenticated;

grant execute on function public.publish_project(jsonb) to service_role;
grant execute on function public.publish_review(jsonb) to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'media',
  'media',
  true,
  5242880,
  array['image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
