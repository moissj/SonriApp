-- Pasar el odontograma a estado por superficie (cara) de cada pieza
alter table public.odontogramas drop constraint if exists odontogramas_paciente_id_pieza_key;
alter table public.odontogramas add column if not exists cara text not null default 'oclusal';
alter table public.odontogramas add constraint odontogramas_pieza_cara_key unique (paciente_id, pieza, cara);;
