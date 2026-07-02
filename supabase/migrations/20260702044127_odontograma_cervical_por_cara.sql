-- Cervical por cara: nuevo enum con 4 valores cervicales
create type public.superficie_diente_enum_new as enum (
  'vestibular', 'lingual_palatina', 'mesial', 'distal', 'oclusal_incisal',
  'cervical_vestibular', 'cervical_lingual_palatina', 'cervical_mesial', 'cervical_distal'
);

-- Cambiar el tipo de la columna, mapeando el antiguo 'cervical' -> 'cervical_vestibular'
alter table public.odontogramas
  alter column superficie type public.superficie_diente_enum_new
  using (
    case superficie::text
      when 'cervical' then 'cervical_vestibular'
      else superficie::text
    end::public.superficie_diente_enum_new
  );

-- Reemplazar el enum antiguo por el nuevo (mismo nombre)
drop type public.superficie_diente_enum;
alter type public.superficie_diente_enum_new rename to superficie_diente_enum;;
