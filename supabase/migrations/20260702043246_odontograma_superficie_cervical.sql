-- Nuevo enum de superficie (incluye tercio cervical y oclusal/incisal unificado)
create type public.superficie_diente_enum as enum (
  'vestibular', 'lingual_palatina', 'mesial', 'distal', 'oclusal_incisal', 'cervical'
);

-- Nueva columna superficie, backfill desde 'cara'
alter table public.odontogramas add column superficie public.superficie_diente_enum;
update public.odontogramas set superficie = case cara
  when 'vestibular' then 'vestibular'::public.superficie_diente_enum
  when 'lingual' then 'lingual_palatina'::public.superficie_diente_enum
  when 'mesial' then 'mesial'::public.superficie_diente_enum
  when 'distal' then 'distal'::public.superficie_diente_enum
  when 'oclusal' then 'oclusal_incisal'::public.superficie_diente_enum
  else 'oclusal_incisal'::public.superficie_diente_enum end;
alter table public.odontogramas alter column superficie set not null;

-- Reemplazar restriccion unica (paciente,pieza,cara) -> (paciente,pieza,superficie)
alter table public.odontogramas drop constraint if exists odontogramas_pieza_cara_key;
alter table public.odontogramas drop column cara;
alter table public.odontogramas add constraint odontogramas_pieza_superficie_key unique (paciente_id, pieza, superficie);;
