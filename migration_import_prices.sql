create table public.drug_import_prices (
  id uuid primary key default uuid_generate_v4(),
  drug_id uuid references public.drugs(id) on delete cascade not null,
  supplier_name text not null,
  price numeric not null DEFAULT 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.drug_import_prices enable row level security;

-- Policies
create policy "Enable read access for all users" on public.drug_import_prices for select using (true);
create policy "Enable insert for authenticated users only" on public.drug_import_prices for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on public.drug_import_prices for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on public.drug_import_prices for delete using (auth.role() = 'authenticated');

-- Index for performance
create index idx_drug_import_prices_drug_id on public.drug_import_prices(drug_id);
