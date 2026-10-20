-- ════════════════════════════════════════════════════════════════
-- Édition inline : autorise aussi le lien des activités.
-- ════════════════════════════════════════════════════════════════

create or replace function apply_inline_edits(p_items jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  it jsonb;
  tbl text;
  rid uuid;
  col text;
  patch jsonb;
  sets text;
begin
  if not is_admin() then raise exception 'Accès refusé'; end if;
  if jsonb_typeof(p_items) <> 'array' then raise exception 'Payload invalide'; end if;

  for it in select * from jsonb_array_elements(p_items) loop
    tbl := it->>'table';
    rid := (it->>'id')::uuid;
    patch := coalesce(it->'patch', '{}'::jsonb);
    if tbl is null or rid is null then raise exception 'Élément invalide'; end if;

    if tbl not in ('destinations', 'accommodations', 'activities', 'days') then
      raise exception 'Table non autorisée : %', tbl;
    end if;

    for col in select key from jsonb_each(patch) loop
      if not (
        (tbl = 'destinations' and col in ('intro', 'image_url', 'guide_url')) or
        (tbl = 'accommodations' and col in ('name', 'url', 'alt_url', 'price_total')) or
        (tbl = 'activities' and col in ('title', 'link')) or
        (tbl = 'days' and col in ('visited_place'))
      ) then
        raise exception 'Colonne non autorisée : %.%', tbl, col;
      end if;
    end loop;

    select string_agg(format('%I = %L', key, value), ', ') into sets from jsonb_each_text(patch);
    if sets is null then continue; end if;

    execute format('update public.%I set %s where id = $1', tbl, sets) using rid;
  end loop;
end $$;

grant execute on function apply_inline_edits(jsonb) to authenticated;
