-- Refuerzo a nivel de datos: una cuenta suspendida o con plan vencido no puede
-- LEER datos aunque obtenga un token valido directamente de Supabase Auth.
create or replace function public.is_cuenta_activa()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and estado_cuenta = 'activo'
      and (fecha_vencimiento_plan is null or fecha_vencimiento_plan >= current_date)
  );
$$;

-- Recrear politicas SELECT incluyendo el chequeo de cuenta activa
drop policy "pacientes: ver propios" on public.pacientes;
create policy "pacientes: ver propios" on public.pacientes for select using (odontologo_id = auth.uid() and public.is_cuenta_activa());

drop policy "citas: ver propias" on public.citas;
create policy "citas: ver propias" on public.citas for select using (odontologo_id = auth.uid() and public.is_cuenta_activa());

drop policy "historias: ver propias" on public.historias_clinicas;
create policy "historias: ver propias" on public.historias_clinicas for select using (odontologo_id = auth.uid() and public.is_cuenta_activa());

drop policy "odontogramas: ver propios" on public.odontogramas;
create policy "odontogramas: ver propios" on public.odontogramas for select using (odontologo_id = auth.uid() and public.is_cuenta_activa());

drop policy "mensajes: ver propios" on public.mensajes_enviados;
create policy "mensajes: ver propios" on public.mensajes_enviados for select using (odontologo_id = auth.uid() and public.is_cuenta_activa());

drop policy "presupuestos: ver propios" on public.presupuestos;
create policy "presupuestos: ver propios" on public.presupuestos for select using (odontologo_id = auth.uid() and public.is_cuenta_activa());

drop policy "pagos: ver propios" on public.pagos;
create policy "pagos: ver propios" on public.pagos for select using (odontologo_id = auth.uid() and public.is_cuenta_activa());

drop policy "tratamientos: ver propios" on public.tratamientos_catalogo;
create policy "tratamientos: ver propios" on public.tratamientos_catalogo for select using (odontologo_id = auth.uid() and public.is_cuenta_activa());

drop policy "plantillas: ver propias" on public.plantillas_mensajes;
create policy "plantillas: ver propias" on public.plantillas_mensajes for select using (odontologo_id = auth.uid() and public.is_cuenta_activa());

drop policy "items: ver propios" on public.presupuesto_items;
create policy "items: ver propios" on public.presupuesto_items for select using (exists (select 1 from public.presupuestos p where p.id = presupuesto_items.presupuesto_id and p.odontologo_id = auth.uid()) and public.is_cuenta_activa());;
