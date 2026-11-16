# Carbon credits: Supabase data spec

**Status:** proposal for the backend owner to review (CS385-36 / CS385-37).
**Reference implementation:** `src/lib/ledger.ts` and its tests. The database must follow the same rules.

## Rules agreed by the team

1. When an exchange is completed, **both** the giver and the receiver earn the **full** points.
2. Both see the exchange's kg CO₂e on their own Profile.
3. Campus totals count each exchange's kg CO₂e **once**, so the saving isn't doubled.
4. Credits are awarded **once only** per exchange and user. The database enforces this, not just the app.
5. The app never writes to the ledger directly. Only the `complete_exchange()` function can.

Column names below assume the data model in the README (`items`, `exchanges`, `profiles`). Rename to match your tables, but keep the constraints.

## Table: `carbon_factors`

One row per clothing sub-category. The app reads this; only the Edge Function (service role) writes it.

```sql
create table public.carbon_factors (
  subcategory          text primary key,              -- 'Tops', 'Bottoms', 'Outerwear', ...
  weight_kg            numeric not null check (weight_kg > 0),
  kg_co2e_per_kg       numeric not null check (kg_co2e_per_kg > 0),
  source               text not null,                 -- e.g. 'Climatiq', 'fallback'
  climatiq_activity_id text,                          -- null for fallback rows
  updated_at           timestamptz not null default now()
);

alter table public.carbon_factors enable row level security;

create policy "Anyone signed in can read factors"
  on public.carbon_factors for select
  to authenticated
  using (true);
-- No insert/update/delete policies: only the service role (Edge Function) can write.
```

Seed it with the values in `CARBON_FACTORS` in `src/lib/carbon.ts`, so the app and the database start from the same numbers.

Global constants (keep in sync with `src/lib/carbon.ts`):

| Constant           | Value |
| ------------------ | ----- |
| Displacement rate  | 0.646 |
| Points per kg CO₂e | 10    |

## Table: `credit_ledger`

Append-only. One row per user per completed exchange.

```sql
create table public.credit_ledger (
  id          uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.exchanges(id),
  user_id     uuid not null references public.profiles(id),
  role        text not null check (role in ('giver', 'receiver')),
  points      integer not null check (points > 0),
  kg_co2e     numeric not null check (kg_co2e >= 0),
  created_at  timestamptz not null default now(),
  unique (exchange_id, user_id)          -- awarded once only, even on a double tap
);

alter table public.credit_ledger enable row level security;

create policy "Users read their own ledger rows"
  on public.credit_ledger for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins read all ledger rows"
  on public.credit_ledger for select
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
-- No insert/update/delete policies: rows are only written by complete_exchange().
```

## Function: `complete_exchange(exchange_id)`

Called by the app when a user confirms the hand-over. Runs as one transaction.

What it must do:

1. Check the caller (`auth.uid()`) is the exchange's giver or receiver, otherwise raise an error.
2. Mark the caller's confirmation (`giver_confirmed` / `receiver_confirmed`).
3. If **both** have confirmed and the status is `accepted`:
   - set the exchange status to `completed` and the item status to `given`
   - look up the item's sub-category in `carbon_factors`
   - `kg = weight_kg × kg_co2e_per_kg × 0.646`, `points = round(kg × 10)`
   - insert two ledger rows (giver and receiver) with `on conflict (exchange_id, user_id) do nothing`
4. If the sub-category has no factor, complete the exchange but award nothing (matches `creditsForExchange` returning `[]`).

Sketch:

```sql
create or replace function public.complete_exchange(p_exchange_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ex  public.exchanges%rowtype;
  f   public.carbon_factors%rowtype;
  kg  numeric;
  pts integer;
begin
  select * into ex from public.exchanges where id = p_exchange_id for update;
  if ex.id is null or auth.uid() not in (ex.giver_id, ex.receiver_id) then
    raise exception 'Not allowed';
  end if;

  update public.exchanges
     set giver_confirmed    = giver_confirmed    or auth.uid() = ex.giver_id,
         receiver_confirmed = receiver_confirmed or auth.uid() = ex.receiver_id
   where id = p_exchange_id
   returning * into ex;

  if ex.giver_confirmed and ex.receiver_confirmed and ex.status = 'accepted' then
    update public.exchanges set status = 'completed' where id = p_exchange_id;
    update public.items     set status = 'given'     where id = ex.item_id;

    select cf.* into f
      from public.carbon_factors cf
      join public.items i on i.subcategory = cf.subcategory
     where i.id = ex.item_id;

    if f.subcategory is not null then
      kg  := f.weight_kg * f.kg_co2e_per_kg * 0.646;
      pts := round(kg * 10);
      insert into public.credit_ledger (exchange_id, user_id, role, points, kg_co2e)
      values (ex.id, ex.giver_id,    'giver',    pts, kg),
             (ex.id, ex.receiver_id, 'receiver', pts, kg)
      on conflict (exchange_id, user_id) do nothing;
    end if;
  end if;
end;
$$;

revoke all on function public.complete_exchange(uuid) from public;
grant execute on function public.complete_exchange(uuid) to authenticated;
```

## View: `campus_impact` (admin dashboard)

Because it runs with the caller's permissions, only admins see campus-wide totals; a student would only see their own rows.

kg CO₂e counted once per exchange (rule 3).

```sql
create view public.campus_impact
with (security_invoker = true) as
select
  count(distinct exchange_id)                         as exchanges,
  coalesce(sum(points), 0)                            as points_awarded,
  coalesce(sum(kg_co2e) filter (where role = 'giver'), 0) as kg_co2e
from public.credit_ledger;
```

## Tests the backend should have

| Test                                                           | Expected                                          |
| -------------------------------------------------------------- | ------------------------------------------------- |
| Both users confirm                                             | Exactly 2 ledger rows                             |
| A user confirms twice                                          | Still 2 rows                                      |
| Both confirm at the same moment                                | Still 2 rows                                      |
| Exchange cancelled                                             | 0 rows                                            |
| A student inserts into `credit_ledger` directly                | Blocked by RLS                                    |
| A student reads another student's rows                         | Returns nothing                                   |
| An admin reads `campus_impact`                                 | Totals match `summariseCampus()` on the same data |
| A student calls `complete_exchange` on someone else's exchange | Error                                             |

## How the app switches over

Only `src/api/carbon.ts` changes. `useCarbonSummary()` will select the user's rows from `credit_ledger`, and `useCampusCarbonSummary()` will read `campus_impact`. Both keep their current return shape, so screens and tests stay the same.
