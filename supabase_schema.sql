-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create drug_groups table
create table public.drug_groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create drugs table
create table public.drugs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  unit text not null,
  unit_price numeric not null DEFAULT 0,
  image_url text,
  group_id uuid references public.drug_groups(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create templates table
create table public.templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id)
);

-- Create template_items table
create table public.template_items (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references public.templates(id) on delete cascade not null,
  drug_id uuid references public.drugs(id) not null,
  quantity integer not null default 1,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.drug_groups enable row level security;
alter table public.drugs enable row level security;
alter table public.templates enable row level security;
alter table public.template_items enable row level security;

-- Policies for drug_groups (Read public, Write authenticated)
create policy "Enable read access for all users" on public.drug_groups for select using (true);
create policy "Enable insert for authenticated users only" on public.drug_groups for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on public.drug_groups for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on public.drug_groups for delete using (auth.role() = 'authenticated');

-- Policies for drugs (Read public, Write authenticated)
create policy "Enable read access for all users" on public.drugs for select using (true);
create policy "Enable insert for authenticated users only" on public.drugs for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on public.drugs for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on public.drugs for delete using (auth.role() = 'authenticated');

-- Policies for templates (CRUD for owner)
create policy "Users can view their own templates" on public.templates for select using (auth.uid() = user_id);
create policy "Users can create their own templates" on public.templates for insert with check (auth.uid() = user_id);
create policy "Users can update their own templates" on public.templates for update using (auth.uid() = user_id);
create policy "Users can delete their own templates" on public.templates for delete using (auth.uid() = user_id);

-- Policies for template_items (Access via template)
create policy "Users can view items of their templates" on public.template_items for select using (
  exists ( select 1 from public.templates where id = template_items.template_id and user_id = auth.uid() )
);
create policy "Users can insert items to their templates" on public.template_items for insert with check (
  exists ( select 1 from public.templates where id = template_items.template_id and user_id = auth.uid() )
);
create policy "Users can update items of their templates" on public.template_items for update using (
  exists ( select 1 from public.templates where id = template_items.template_id and user_id = auth.uid() )
);
create policy "Users can delete items of their templates" on public.template_items for delete using (
  exists ( select 1 from public.templates where id = template_items.template_id and user_id = auth.uid() )
);

-- Create Storage Bucket for drug images
insert into storage.buckets (id, name, public) values ('drug-images', 'drug-images', true);

-- Storage Policy
create policy "Public Access" on storage.objects for select using ( bucket_id = 'drug-images' );
create policy "Authenticated users can upload" on storage.objects for insert with check ( bucket_id = 'drug-images' and auth.role() = 'authenticated' );
