-- Plan 26 F2 (1/2): solo ampliacion de enums. Archivo aparte porque un valor
-- nuevo de enum no puede usarse en la misma transaccion que lo agrega.
alter type public.estado_diente_enum add value if not exists 'obt_desadaptada';
alter type public.estado_diente_enum add value if not exists 'resina';
alter type public.estado_diente_enum add value if not exists 'amalgama';

alter type public.marca_diente_enum add value if not exists 'sano';
alter type public.marca_diente_enum add value if not exists 'endo_realizada';
alter type public.marca_diente_enum add value if not exists 'endo_indicada';
alter type public.marca_diente_enum add value if not exists 'sin_erupcionar';
alter type public.marca_diente_enum add value if not exists 'ausente';
alter type public.marca_diente_enum add value if not exists 'resto_radicular';
alter type public.marca_diente_enum add value if not exists 'exodoncia_indicada';
alter type public.marca_diente_enum add value if not exists 'sellante_indicado';
alter type public.marca_diente_enum add value if not exists 'pontico';
alter type public.marca_diente_enum add value if not exists 'protesis_removible';
alter type public.marca_diente_enum add value if not exists 'erosion';
