-- ==============================================================================
-- Migration: 20261031140001_schema_enhancements.sql
-- Description: Add missing description to plans & tax_rate to subscription_lines
-- ==============================================================================

ALTER TABLE plans ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE subscription_lines ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 10.00;

-- Auto-sync profiles when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, company_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE((new.raw_app_meta_data->>'role')::user_role, 'customer'),
    new.raw_user_meta_data->>'company_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on auth.users (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

