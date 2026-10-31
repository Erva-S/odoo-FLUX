-- ==============================================================================
-- Brightloop Billing — Phase 3B: Customer Decoupling & Lifecycle History
-- ==============================================================================

-- 1. Decouple profiles from auth.users so business customer entities can exist prior to signup
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Ensure unique lookup for auth_user_id when set
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_profiles_auth_user_id'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT uq_profiles_auth_user_id UNIQUE (auth_user_id);
    END IF;
END $$;

-- 2. Subscription Stage Lifecycle History Table
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    from_status subscription_status NOT NULL,
    to_status subscription_status NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_email TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_sub_id ON subscription_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON subscription_history(created_at);

-- 3. Update get_user_role() to inspect both direct id and linked auth_user_id
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles 
  WHERE id = (select auth.uid()) OR auth_user_id = (select auth.uid())
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 4. Enable RLS on subscription_history
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and Staff full access to subscription history" ON subscription_history
    FOR ALL TO authenticated USING (get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Customers view own subscription history" ON subscription_history
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM subscriptions 
            WHERE subscriptions.id = subscription_history.subscription_id 
            AND (
                subscriptions.customer_id = (select auth.uid()) OR 
                subscriptions.customer_id IN (
                    SELECT id FROM profiles WHERE auth_user_id = (select auth.uid())
                )
            )
        )
    );

-- 5. Update profiles RLS policies to allow linked customers to view and update their own profile
DROP POLICY IF EXISTS "Customers view own profile" ON profiles;
CREATE POLICY "Customers view own profile" ON profiles
    FOR SELECT TO authenticated USING (
        id = (select auth.uid()) OR 
        auth_user_id = (select auth.uid()) OR 
        get_user_role() IN ('admin', 'staff')
    );

DROP POLICY IF EXISTS "Customers update own profile" ON profiles;
CREATE POLICY "Customers update own profile" ON profiles
    FOR UPDATE TO authenticated USING (
        id = (select auth.uid()) OR 
        auth_user_id = (select auth.uid())
    );

