alter table public.presupuestos enable row level security;
create policy "presupuestos: ver propios" on public.presupuestos for select using (odontologo_id = auth.uid());
create policy "presupuestos: insertar propios" on public.presupuestos for insert with check (odontologo_id = auth.uid());
create policy "presupuestos: actualizar propios" on public.presupuestos for update using (odontologo_id = auth.uid()) with check (odontologo_id = auth.uid());
create policy "presupuestos: eliminar propios" on public.presupuestos for delete using (odontologo_id = auth.uid());

alter table public.pagos enable row level security;
create policy "pagos: ver propios" on public.pagos for select using (odontologo_id = auth.uid());
create policy "pagos: insertar propios" on public.pagos for insert with check (odontologo_id = auth.uid());
create policy "pagos: actualizar propios" on public.pagos for update using (odontologo_id = auth.uid()) with check (odontologo_id = auth.uid());
create policy "pagos: eliminar propios" on public.pagos for delete using (odontologo_id = auth.uid());

alter table public.presupuesto_items enable row level security;
create policy "items: ver propios" on public.presupuesto_items for select using (exists (select 1 from public.presupuestos p where p.id = presupuesto_id and p.odontologo_id = auth.uid()));
create policy "items: insertar propios" on public.presupuesto_items for insert with check (exists (select 1 from public.presupuestos p where p.id = presupuesto_id and p.odontologo_id = auth.uid()));
create policy "items: actualizar propios" on public.presupuesto_items for update using (exists (select 1 from public.presupuestos p where p.id = presupuesto_id and p.odontologo_id = auth.uid()));
create policy "items: eliminar propios" on public.presupuesto_items for delete using (exists (select 1 from public.presupuestos p where p.id = presupuesto_id and p.odontologo_id = auth.uid()));;
