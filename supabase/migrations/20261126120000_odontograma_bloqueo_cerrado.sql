-- Plan 26 F5b: enforcement en BD — odontograma 'cerrado' no admite INSERT/UPDATE/DELETE
-- en odontogramas ni odontograma_marcas. Aditivo e idempotente.
--
-- REVERT (manual):
--   drop trigger if exists odontograma_marcas_bloqueo_cerrado on public.odontograma_marcas;
--   drop trigger if exists odontogramas_bloqueo_cerrado on public.odontogramas;
--   drop function if exists public.odontograma_no_cerrado();
--
-- Notas:
-- * NO se dispara en odontograma_meta: cerrar/reabrir siguen funcionando.
-- * Reabrir pone 'borrador' ANTES de editar, asi que la edicion posterior es permitida.
-- * crearFinal: meta final 'borrador' (o sin meta) + copia de filas tipo='final' => permitido.
-- * Sin meta o 'borrador' => permitido. El mensaje no incluye datos de paciente.

create or replace function public.odontograma_no_cerrado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_paciente uuid;
  v_tipo public.odontograma_tipo_enum;
begin
  if tg_op = 'DELETE' then
    v_paciente := old.paciente_id;
    v_tipo := old.tipo;
    -- Cascada por borrado del paciente: el padre ya no existe, no bloquear.
    if not exists (select 1 from public.pacientes where id = v_paciente) then
      return old;
    end if;
  else
    v_paciente := new.paciente_id;
    v_tipo := new.tipo;
  end if;

  if exists (
    select 1 from public.odontograma_meta m
    where m.paciente_id = v_paciente
      and m.tipo = v_tipo
      and m.estado = 'cerrado'
  ) then
    raise exception 'Odontograma % cerrado: no editable (reabrir con motivo).', v_tipo
      using errcode = 'P0001';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

-- Solo se invoca como trigger; no exponer como RPC.
revoke all on function public.odontograma_no_cerrado() from public, anon, authenticated;

drop trigger if exists odontogramas_bloqueo_cerrado on public.odontogramas;
create trigger odontogramas_bloqueo_cerrado
  before insert or update or delete on public.odontogramas
  for each row execute function public.odontograma_no_cerrado();

drop trigger if exists odontograma_marcas_bloqueo_cerrado on public.odontograma_marcas;
create trigger odontograma_marcas_bloqueo_cerrado
  before insert or update or delete on public.odontograma_marcas
  for each row execute function public.odontograma_no_cerrado();
