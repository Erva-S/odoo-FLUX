-- ==============================================================================
-- Brightloop Billing: Supabase PostgreSQL Schema & RLS Policies
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
CREATE TYPE subscription_status AS ENUM ('draft', 'quotation', 'confirmed', 'active', 'closed');
CREATE TYPE invoice_status AS ENUM ('draft', 'confirmed', 'paid', 'cancelled');
CREATE TYPE billing_period_type AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE discount_target AS ENUM ('whole_subscription', 'specific_products');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'credit_card', 'wire', 'ach');

-- 2. Profiles (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    company_name TEXT,
    phone TEXT,
    billing_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Taxes
CREATE TABLE IF NOT EXISTS taxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rate NUMERIC(5, 2) NOT NULL, -- e.g. 10.00 for 10%
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Products & Variants
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'service',
    sales_price NUMERIC(12, 2) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_name TEXT NOT NULL, -- e.g. "Brand"
    attribute_value TEXT NOT NULL, -- e.g. "Odoo"
    price_extra NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- e.g. 560.00
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Plans
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    billing_period billing_period_type NOT NULL DEFAULT 'monthly',
    minimum_quantity INT NOT NULL DEFAULT 1,
    available_from DATE,
    available_to DATE,
    auto_close BOOLEAN NOT NULL DEFAULT false,
    allow_early_close BOOLEAN NOT NULL DEFAULT true,
    allow_pause BOOLEAN NOT NULL DEFAULT true,
    allow_renew BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Discounts
CREATE TABLE IF NOT EXISTS discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type discount_type NOT NULL DEFAULT 'percentage',
    value NUMERIC(12, 2) NOT NULL,
    min_purchase NUMERIC(12, 2) DEFAULT 0.00,
    min_quantity INT DEFAULT 1,
    start_date DATE,
    end_date DATE,
    usage_limit INT,
    times_used INT NOT NULL DEFAULT 0,
    applies_to discount_target NOT NULL DEFAULT 'whole_subscription',
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Quotation Templates
CREATE TABLE IF NOT EXISTS quotation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    validity_days INT NOT NULL DEFAULT 30,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_template_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES quotation_templates(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1
);

-- 8. Subscriptions & Lines
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_number TEXT UNIQUE NOT NULL, -- e.g. SUB-0001
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status subscription_status NOT NULL DEFAULT 'draft',
    start_date DATE NOT NULL,
    expiry_date DATE,
    payment_terms TEXT NOT NULL DEFAULT 'Net 30',
    discount_id UUID REFERENCES discounts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_id UUID REFERENCES taxes(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL
);

-- 9. Invoices & Lines (WITH IDEMPOTENCY UNIQUE CONSTRAINT)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL, -- e.g. INV-0001
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    status invoice_status NOT NULL DEFAULT 'draft',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- IDEMPOTENCY: Guaranteed single invoice per subscription per billing cycle
    CONSTRAINT uq_subscription_period UNIQUE (subscription_id, billing_period_start)
);

CREATE TABLE IF NOT EXISTS invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    amount NUMERIC(12, 2) NOT NULL
);

-- 10. Discount Usages
CREATE TABLE IF NOT EXISTS discount_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL,
    method payment_method NOT NULL DEFAULT 'bank_transfer',
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Strategic Indexes for sub-second queries with 100k+ records
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan_id);

CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_period_start ON invoices(billing_period_start);
CREATE INDEX IF NOT EXISTS idx_invoices_sub_id ON invoices(subscription_id);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_template_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_usages ENABLE ROW LEVEL SECURITY;

-- Helper function: Check current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Profiles: Admin can see & manage all, Staff can view all, Customer can only view/edit their own
CREATE POLICY "Admins have full access to profiles" ON profiles
    FOR ALL TO authenticated USING (get_user_role() = 'admin');

CREATE POLICY "Staff can view all profiles" ON profiles
    FOR SELECT TO authenticated USING (get_user_role() = 'staff');

CREATE POLICY "Customers view own profile" ON profiles
    FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Customers update own profile" ON profiles
    FOR UPDATE TO authenticated USING (id = auth.uid());

-- Products & Plans: Visible to all authenticated users, editable only by Admin
CREATE POLICY "Everyone views active products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages products" ON products FOR ALL TO authenticated USING (get_user_role() = 'admin');

CREATE POLICY "Everyone views active plans" ON plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages plans" ON plans FOR ALL TO authenticated USING (get_user_role() = 'admin');

CREATE POLICY "Everyone views product variants" ON product_variants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages product variants" ON product_variants FOR ALL TO authenticated USING (get_user_role() = 'admin');

CREATE POLICY "Everyone views taxes" ON taxes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages taxes" ON taxes FOR ALL TO authenticated USING (get_user_role() = 'admin');

CREATE POLICY "Everyone views discounts" ON discounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages discounts" ON discounts FOR ALL TO authenticated USING (get_user_role() = 'admin');

-- Subscriptions & Invoices:
-- Admin & Staff: Full read/write
-- Customer: View only their own subscriptions and invoices
CREATE POLICY "Admin and Staff full access to subscriptions" ON subscriptions
    FOR ALL TO authenticated USING (get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Customers view their own subscriptions" ON subscriptions
    FOR SELECT TO authenticated USING (customer_id = auth.uid());

CREATE POLICY "Admin and Staff full access to subscription lines" ON subscription_lines
    FOR ALL TO authenticated USING (get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Customers view their own subscription lines" ON subscription_lines
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM subscriptions WHERE subscriptions.id = subscription_lines.subscription_id AND subscriptions.customer_id = auth.uid())
    );

CREATE POLICY "Admin and Staff full access to invoices" ON invoices
    FOR ALL TO authenticated USING (get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Customers view their own invoices" ON invoices
    FOR SELECT TO authenticated USING (customer_id = auth.uid());

CREATE POLICY "Admin and Staff full access to invoice lines" ON invoice_lines
    FOR ALL TO authenticated USING (get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Customers view their own invoice lines" ON invoice_lines
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_lines.invoice_id AND invoices.customer_id = auth.uid())
    );

CREATE POLICY "Admin and Staff full access to payments" ON payments
    FOR ALL TO authenticated USING (get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Customers view their own payments" ON payments
    FOR SELECT TO authenticated USING (customer_id = auth.uid());

-- ==============================================================================
-- Idempotent Automated Billing Generation Function (pg_cron ready)
-- ==============================================================================
CREATE OR REPLACE FUNCTION generate_recurring_invoices()
RETURNS TABLE(created_count INT, skipped_count INT) AS $$
DECLARE
    sub RECORD;
    v_created INT := 0;
    v_skipped INT := 0;
    v_inv_id UUID;
    v_period_start DATE;
    v_period_end DATE;
    v_subtotal NUMERIC(12, 2);
    v_tax_total NUMERIC(12, 2);
    v_total NUMERIC(12, 2);
    v_inv_num TEXT;
BEGIN
    FOR sub IN 
        SELECT s.*, p.billing_period, p.price as plan_base_price
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        WHERE s.status = 'active'
    LOOP
        v_period_start := CURRENT_DATE;
        IF sub.billing_period = 'yearly' THEN
            v_period_end := CURRENT_DATE + INTERVAL '1 year';
        ELSE
            v_period_end := CURRENT_DATE + INTERVAL '1 month';
        END IF;

        -- Check if invoice already exists for this billing period (Idempotent guard)
        IF EXISTS (
            SELECT 1 FROM invoices 
            WHERE subscription_id = sub.id 
            AND billing_period_start = v_period_start
        ) THEN
            v_skipped := v_skipped + 1;
        ELSE
            v_inv_num := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::text, 1, 4);
            
            -- Calculate totals from subscription lines
            SELECT COALESCE(SUM(amount), 0) INTO v_subtotal
            FROM subscription_lines WHERE subscription_id = sub.id;

            v_tax_total := ROUND(v_subtotal * 0.10, 2);
            v_total := v_subtotal + v_tax_total;

            INSERT INTO invoices (
                invoice_number, subscription_id, customer_id, billing_period_start,
                billing_period_end, status, subtotal, discount_amount, tax_amount,
                total_amount, amount_paid, due_date
            ) VALUES (
                v_inv_num, sub.id, sub.customer_id, v_period_start,
                v_period_end, 'confirmed', v_subtotal, 0.00, v_tax_total,
                v_total, 0.00, CURRENT_DATE + INTERVAL '30 days'
            ) RETURNING id INTO v_inv_id;

            v_created := v_created + 1;
        END IF;
    END LOOP;

    RETURN QUERY SELECT v_created, v_skipped;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

