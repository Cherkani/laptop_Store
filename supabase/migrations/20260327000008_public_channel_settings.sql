-- Migration 8: expose safe channel settings to storefront + robust stock deduction

-- Allow public clients to read only channel settings required by storefront automation.
drop policy if exists "app_settings_select_public_channels" on public.app_settings;
create policy "app_settings_select_public_channels"
  on public.app_settings for select
  using (key in ('whatsapp_number', 'google_webhook_url', 'company_name'));

-- If a record is moved directly to paid, still deduct stock once.
create or replace function public.handle_sales_record_sold()
returns trigger as $$
begin
  if new.status in ('sold', 'paid')
     and coalesce(old.status, '') not in ('sold', 'paid')
     and new.stock_deducted = false then

    update public.products p
      set stock_quantity = greatest(0, p.stock_quantity - i.quantity),
          updated_at = now()
    from public.sales_record_items i
    where i.sales_record_id = new.id
      and i.product_id = p.id;

    new.stock_deducted = true;
    new.sold_at = coalesce(new.sold_at, now());
  end if;

  return new;
end;
$$ language plpgsql;
