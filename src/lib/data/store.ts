import {
  Profile,
  Product,
  Plan,
  Tax,
  Discount,
  QuotationTemplate,
  Subscription,
  Invoice,
  Payment,
} from "./types";

// ==========================================
// 1. Core Reference Entities
// ==========================================

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Brightloop Core SaaS Platform",
    type: "service",
    salesPrice: 1200.0,
    costPrice: 320.0,
    notes: "Main multitenant SaaS subscription infrastructure with high-availability clustering.",
    variants: [
      {
        id: "var-odoo",
        productId: "prod-1",
        attributeName: "Brand",
        attributeValue: "Odoo",
        priceExtra: 560.0, // Base 1200 + 560 = 1760 final price
      },
      {
        id: "var-enterprise",
        productId: "prod-1",
        attributeName: "Brand",
        attributeValue: "Enterprise Custom",
        priceExtra: 850.0,
      },
    ],
  },
  {
    id: "prod-2",
    name: "FinOps AI Copilot & Automated Ledger",
    type: "service",
    salesPrice: 450.0,
    costPrice: 90.0,
    notes: "Machine learning driven invoice matching, anomaly detection, and cashflow forecast.",
    variants: [
      {
        id: "var-neural",
        productId: "prod-2",
        attributeName: "Intelligence Tier",
        attributeValue: "High-Throughput Neural",
        priceExtra: 200.0,
      },
    ],
  },
  {
    id: "prod-3",
    name: "Real-time Bank Statement Reconciliation Gateway",
    type: "service",
    salesPrice: 350.0,
    costPrice: 50.0,
    notes: "Automated webhook synchronization with Plaid, Stripe, and global SWIFT feeds.",
    variants: [],
  },
];

export const INITIAL_PLANS: Plan[] = [
  {
    id: "plan-starter-mo",
    name: "Starter Monthly",
    price: 299.0,
    billingPeriod: "monthly",
    minimumQuantity: 1,
    autoClose: false,
    allowEarlyClose: true,
    allowPause: true,
    allowRenew: true,
    description: "Ideal for boutique agencies and early-stage SaaS ventures.",
  },
  {
    id: "plan-growth-mo",
    name: "Growth Monthly",
    price: 799.0,
    billingPeriod: "monthly",
    minimumQuantity: 1,
    autoClose: false,
    allowEarlyClose: true,
    allowPause: true,
    allowRenew: true,
    description: "Expanded limits and priority billing synchronization for growing teams.",
  },
  {
    id: "plan-scale-yr",
    name: "Scale Yearly",
    price: 2999.0,
    billingPeriod: "yearly",
    minimumQuantity: 1,
    autoClose: false,
    allowEarlyClose: true,
    allowPause: true,
    allowRenew: true,
    description: "Full automation package billed annually with priority SLA.",
  },
  {
    id: "plan-enterprise-yr",
    name: "Enterprise Pro Yearly",
    price: 7999.0,
    billingPeriod: "yearly",
    minimumQuantity: 5,
    autoClose: false,
    allowEarlyClose: true,
    allowPause: true,
    allowRenew: true,
    description: "Dedicated account manager, customized Odoo bridge, and unlimited invoices.",
  },
];

export const INITIAL_TAXES: Tax[] = [
  { id: "tax-vat-10", name: "Standard VAT", rate: 10.0, isActive: true },
  { id: "tax-software-8", name: "Software Sales Tax", rate: 8.25, isActive: true },
];

export const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: "disc-welcome10",
    code: "WELCOME10",
    name: "Early Adopter 10% Discount",
    type: "percentage",
    value: 10.0,
    minPurchase: 500.0,
    minQuantity: 1,
    usageLimit: 500,
    timesUsed: 64,
    appliesTo: "whole_subscription",
    isActive: true,
  },
  {
    id: "disc-bright50",
    code: "BRIGHT50",
    name: "Direct Rep Courtesy Credit",
    type: "fixed",
    value: 50.0,
    minPurchase: 200.0,
    minQuantity: 1,
    usageLimit: 100,
    timesUsed: 28,
    appliesTo: "whole_subscription",
    isActive: true,
  },
];

export const INITIAL_TEMPLATES: QuotationTemplate[] = [
  {
    id: "tmpl-quick-saas",
    name: "Standard Odoo SaaS Onboarding",
    planId: "plan-scale-yr",
    validityDays: 30,
    notes: "Preset bundle includes Cloud Platform with Odoo brand variant and automated gateway.",
    lines: [
      { productId: "prod-1", variantId: "var-odoo", quantity: 1 },
      { productId: "prod-3", quantity: 1 },
    ],
  },
  {
    id: "tmpl-starter-pack",
    name: "Starter Growth Bundle",
    planId: "plan-growth-mo",
    validityDays: 14,
    notes: "Recommended template for high-growth startups migrating off manual spreadsheets.",
    lines: [
      { productId: "prod-1", quantity: 1 },
      { productId: "prod-2", quantity: 1 },
    ],
  },
];

// Demo Profiles
export const DEMO_PROFILES: Profile[] = [
  {
    id: "user-admin",
    email: "admin@brightloop.io",
    name: "Sarah Jenkins (Admin)",
    role: "admin",
    companyName: "Brightloop Software HQ",
    phone: "+1 (555) 019-2834",
    billingAddress: "100 Innovation Way, Suite 400, San Francisco, CA",
    createdAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "user-staff",
    email: "staff@brightloop.io",
    name: "Marcus Vance (Staff)",
    role: "staff",
    companyName: "Brightloop Operations",
    phone: "+1 (555) 019-5821",
    billingAddress: "100 Innovation Way, Suite 400, San Francisco, CA",
    createdAt: "2026-02-01T09:30:00Z",
  },
  {
    id: "user-customer-acme",
    email: "customer@acme.corp",
    name: "Jane Doe (Acme Corp)",
    role: "customer",
    companyName: "Acme Industrial Technologies",
    phone: "+1 (555) 839-2041",
    billingAddress: "450 Industrial Parkway, Austin, TX 78701",
    createdAt: "2026-03-10T14:20:00Z",
  },
];

// Helper to generate 40 realistic customers
const COMPANY_NAMES = [
  "Acme Corporation", "Wayne Enterprises", "Stark Industries", "Cyberdyne Systems",
  "Pied Piper", "Hooli Tech", "Initech Solutions", "Massive Dynamic", "Umbrella Corp",
  "Globex Corporation", "Soylent Industries", "Oscorp Technologies", "Aperture Science",
  "Black Mesa Labs", "Tyrell Corporation", "Weyland-Yutani", "Dunder Mifflin Tech",
  "Gekko & Co", "Oceanic Global", "Nakatomi Trading", "Bluth Software", "Prestige Worldwide",
  "Vandelay Industries", "Sterling Cooper", "Monsters Inc Media", "E-Corp Digital",
  "Wonka Confections Tech", "Buy More Systems", "Krusty Enterprises", "Strickland Propane",
  "Brobdingnag Cloud", "Lilliput Micro", "Gargantua AI", "Pantagruel Analytics",
  "Omni Consumer Products", "Dharma Initiative", "Wonka Labs", "Ankh-Morpork Post",
  "Sirius Cybernetics", "Virtucon Global"
];

export const INITIAL_CUSTOMERS: Profile[] = COMPANY_NAMES.map((company, index) => {
  const firstName = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Riley"][index % 8];
  const lastName = ["Smith", "Johnson", "Miller", "Davis", "Wilson", "Anderson", "Taylor", "Thomas"][index % 8];
  const cleanComp = company.toLowerCase().replace(/[^a-z0-9]/g, "");

  return {
    id: index === 0 ? "user-customer-acme" : `cust-${index + 1}`,
    email: index === 0 ? "customer@acme.corp" : `${firstName.toLowerCase()}@${cleanComp}.com`,
    name: index === 0 ? "Jane Doe (Acme Corp)" : `${firstName} ${lastName}`,
    role: "customer",
    companyName: company,
    phone: `+1 (555) ${100 + index}-${2000 + index * 11}`,
    billingAddress: `${100 + index * 14} Commercial Ave, Floor ${1 + (index % 12)}, New York, NY`,
    createdAt: new Date(Date.now() - (365 - index * 7) * 86400000).toISOString(),
  };
});

// Seed 300 Subscriptions across all statuses
export function generateSeedSubscriptions(): {
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
} {
  const subs: Subscription[] = [];
  const invoices: Invoice[] = [];
  const payments: Payment[] = [];

  const statuses: ("draft" | "quotation" | "confirmed" | "active" | "closed")[] = [
    ...Array(180).fill("active"),
    ...Array(45).fill("confirmed"),
    ...Array(35).fill("quotation"),
    ...Array(20).fill("draft"),
    ...Array(20).fill("closed"),
  ];

  for (let i = 0; i < 300; i++) {
    const subNum = `SUB-${String(i + 1).padStart(4, "0")}`;
    const cust = INITIAL_CUSTOMERS[i % INITIAL_CUSTOMERS.length];
    const plan = INITIAL_PLANS[i % INITIAL_PLANS.length];
    const status = statuses[i];

    // Dates
    const daysAgo = Math.floor(Math.random() * 240) + 10;
    const startDateObj = new Date(Date.now() - daysAgo * 86400000);
    const startDate = startDateObj.toISOString().split("T")[0];
    
    const expiryDateObj = new Date(startDateObj);
    if (plan.billingPeriod === "yearly") {
      expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);
    } else {
      expiryDateObj.setMonth(expiryDateObj.getMonth() + 1);
    }
    const expiryDate = expiryDateObj.toISOString().split("T")[0];

    // Lines
    const hasOdoo = i % 3 === 0;
    const baseProd = INITIAL_PRODUCTS[0];
    const unitPrice = hasOdoo ? 1760.0 : baseProd.salesPrice;

    const lineAmount = unitPrice * 1;
    const subtotal = lineAmount;
    const taxAmount = Math.round(subtotal * 0.1 * 100) / 100;
    const totalAmount = subtotal + taxAmount;

    const sub: Subscription = {
      id: `sub-${i + 1}`,
      subscriptionNumber: subNum,
      customerId: cust.id,
      customerName: cust.companyName || cust.name,
      customerEmail: cust.email,
      planId: plan.id,
      planName: plan.name,
      status,
      startDate,
      expiryDate,
      paymentTerms: "Net 30",
      subtotal,
      discountAmount: 0,
      taxAmount,
      totalAmount,
      lines: [
        {
          id: `sline-${i + 1}-1`,
          subscriptionId: `sub-${i + 1}`,
          productId: baseProd.id,
          variantId: hasOdoo ? "var-odoo" : undefined,
          quantity: 1,
          unitPrice,
          taxRate: 10.0,
          amount: lineAmount,
        },
      ],
      createdAt: startDateObj.toISOString(),
      updatedAt: new Date().toISOString(),
    };
    subs.push(sub);

    // If subscription is confirmed, active or closed, generate invoices
    if (status === "active" || status === "confirmed" || status === "closed") {
      const invNum = `INV-2026-${String(i + 1).padStart(4, "0")}`;
      
      // Determine invoice status & overdue scenario
      let invStatus: "draft" | "confirmed" | "paid" | "cancelled" = "paid";
      let amountPaid = totalAmount;
      let dueDate = new Date(startDateObj.getTime() + 30 * 86400000).toISOString().split("T")[0];

      if (i % 6 === 0) {
        // OVERDUE: Due date in the past, zero or partial payment
        invStatus = "confirmed";
        amountPaid = i % 12 === 0 ? Math.round(totalAmount * 0.4) : 0; // Some partial, some zero
        const pastDueDays = 4 + (i % 25);
        dueDate = new Date(Date.now() - pastDueDays * 86400000).toISOString().split("T")[0];
      } else if (i % 7 === 1) {
        // OUTSTANDING (Due soon in future)
        invStatus = "confirmed";
        amountPaid = 0;
        dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
      }

      const invoice: Invoice = {
        id: `inv-${i + 1}`,
        invoiceNumber: invNum,
        subscriptionId: sub.id,
        subscriptionNumber: sub.subscriptionNumber,
        customerId: cust.id,
        customerName: cust.companyName || cust.name,
        customerEmail: cust.email,
        customerCompany: cust.companyName,
        customerAddress: cust.billingAddress,
        billingPeriodStart: startDate,
        billingPeriodEnd: expiryDate,
        status: invStatus,
        subtotal,
        discountAmount: 0,
        taxAmount,
        totalAmount,
        amountPaid,
        dueDate,
        isOverdue: invStatus === "confirmed" && new Date(dueDate) < new Date(),
        lines: [
          {
            id: `iline-${i + 1}-1`,
            productId: baseProd.id,
            description: `${baseProd.name}${hasOdoo ? " (Brand: Odoo +$560)" : ""}`,
            quantity: 1,
            unitPrice,
            taxRate: 10.0,
            amount: lineAmount,
          },
        ],
        createdAt: startDateObj.toISOString(),
        updatedAt: new Date().toISOString(),
      };
      invoices.push(invoice);

      // If partial or full payment was made, add payment records
      if (amountPaid > 0) {
        payments.push({
          id: `pay-${i + 1}`,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerId: cust.id,
          customerName: cust.companyName || cust.name,
          amount: amountPaid,
          method: i % 2 === 0 ? "bank_transfer" : "credit_card",
          paymentDate: new Date(startDateObj.getTime() + 10 * 86400000).toISOString().split("T")[0],
          note: amountPaid === totalAmount ? "Full settlement" : "Partial installment (reconciliation matched)",
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return { subscriptions: subs, invoices, payments };
}

// Global In-Memory Store Singleton
class BrightloopDataStore {
  private static instance: BrightloopDataStore;

  public products: Product[] = [...INITIAL_PRODUCTS];
  public plans: Plan[] = [...INITIAL_PLANS];
  public taxes: Tax[] = [...INITIAL_TAXES];
  public discounts: Discount[] = [...INITIAL_DISCOUNTS];
  public templates: QuotationTemplate[] = [...INITIAL_TEMPLATES];
  public customers: Profile[] = [...INITIAL_CUSTOMERS];
  public subscriptions: Subscription[] = [];
  public invoices: Invoice[] = [];
  public payments: Payment[] = [];

  private initialized: boolean = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): BrightloopDataStore {
    if (!BrightloopDataStore.instance) {
      BrightloopDataStore.instance = new BrightloopDataStore();
    }
    return BrightloopDataStore.instance;
  }

  private init() {
    if (this.initialized) return;
    const seed = generateSeedSubscriptions();
    this.subscriptions = seed.subscriptions;
    this.invoices = seed.invoices;
    this.payments = seed.payments;
    this.initialized = true;
  }

  // --- Products & Variants ---
  public addProduct(product: Omit<Product, "id">): Product {
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    this.products.push(newProd);
    return newProd;
  }

  // --- Plans ---
  public addPlan(plan: Omit<Plan, "id">): Plan {
    const newPlan: Plan = {
      ...plan,
      id: `plan-${Date.now()}`,
    };
    this.plans.push(newPlan);
    return newPlan;
  }

  // --- Subscriptions ---
  public getSubscriptionById(id: string): Subscription | undefined {
    return this.subscriptions.find((s) => s.id === id || s.subscriptionNumber === id);
  }

  public updateSubscriptionStage(
    subId: string,
    nextStage: Subscription["status"]
  ): Subscription | null {
    const sub = this.subscriptions.find((s) => s.id === subId || s.subscriptionNumber === subId);
    if (!sub) return null;

    sub.status = nextStage;
    sub.updatedAt = new Date().toISOString();

    // When transitioning to Confirmed or Active, generate invoice if not yet exists
    if ((nextStage === "confirmed" || nextStage === "active") && !this.invoices.some((i) => i.subscriptionId === sub.id)) {
      this.generateInvoiceForSubscription(sub);
    }

    return sub;
  }

  public createSubscription(data: {
    customerId: string;
    planId: string;
    paymentTerms?: string;
    discountId?: string;
    lines: { productId: string; variantId?: string; quantity: number }[];
  }): Subscription {
    const cust = this.customers.find((c) => c.id === data.customerId) || this.customers[0];
    const plan = this.plans.find((p) => p.id === data.planId) || this.plans[0];
    const subNum = `SUB-${String(this.subscriptions.length + 1).padStart(4, "0")}`;

    let subtotal = 0;
    const mappedLines = data.lines.map((l, idx) => {
      const prod = this.products.find((p) => p.id === l.productId) || this.products[0];
      let unitPrice = prod.salesPrice;
      if (l.variantId) {
        const variant = prod.variants.find((v) => v.id === l.variantId);
        if (variant) unitPrice += variant.priceExtra;
      }
      const amount = unitPrice * l.quantity;
      subtotal += amount;

      return {
        id: `sline-${Date.now()}-${idx}`,
        subscriptionId: `sub-${this.subscriptions.length + 1}`,
        productId: prod.id,
        variantId: l.variantId,
        quantity: l.quantity,
        unitPrice,
        taxRate: 10.0,
        amount,
      };
    });

    let discountAmount = 0;
    let discountCode: string | undefined;
    if (data.discountId) {
      const disc = this.discounts.find((d) => d.id === data.discountId);
      if (disc && disc.isActive) {
        discountCode = disc.code;
        if (disc.type === "percentage") {
          discountAmount = Math.round(subtotal * (disc.value / 100) * 100) / 100;
        } else {
          discountAmount = disc.value;
        }
      }
    }

    const taxableBase = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(taxableBase * 0.1 * 100) / 100;
    const totalAmount = taxableBase + taxAmount;

    const startDate = new Date().toISOString().split("T")[0];
    const expiryDateObj = new Date();
    if (plan.billingPeriod === "yearly") {
      expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);
    } else {
      expiryDateObj.setMonth(expiryDateObj.getMonth() + 1);
    }
    const expiryDate = expiryDateObj.toISOString().split("T")[0];

    const newSub: Subscription = {
      id: `sub-${this.subscriptions.length + 1}`,
      subscriptionNumber: subNum,
      customerId: cust.id,
      customerName: cust.companyName || cust.name,
      customerEmail: cust.email,
      planId: plan.id,
      planName: plan.name,
      status: "draft",
      startDate,
      expiryDate,
      paymentTerms: data.paymentTerms || "Net 30",
      discountId: data.discountId,
      discountCode,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      lines: mappedLines,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.subscriptions.unshift(newSub);
    return newSub;
  }

  // --- Invoicing & Idempotent Run ---
  public generateInvoiceForSubscription(sub: Subscription): Invoice {
    const invNum = `INV-2026-${String(this.invoices.length + 1).padStart(4, "0")}`;
    const cust = this.customers.find((c) => c.id === sub.customerId);
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

    const invLines = sub.lines.map((l, idx) => {
      const prod = this.products.find((p) => p.id === l.productId);
      return {
        id: `iline-${Date.now()}-${idx}`,
        productId: l.productId,
        description: prod ? prod.name : "Subscription service line",
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate,
        amount: l.amount,
      };
    });

    const newInvoice: Invoice = {
      id: `inv-${this.invoices.length + 1}`,
      invoiceNumber: invNum,
      subscriptionId: sub.id,
      subscriptionNumber: sub.subscriptionNumber,
      customerId: sub.customerId,
      customerName: sub.customerName,
      customerEmail: sub.customerEmail,
      customerCompany: cust?.companyName,
      customerAddress: cust?.billingAddress,
      billingPeriodStart: sub.startDate,
      billingPeriodEnd: sub.expiryDate || sub.startDate,
      status: "confirmed",
      subtotal: sub.subtotal,
      discountAmount: sub.discountAmount,
      taxAmount: sub.taxAmount,
      totalAmount: sub.totalAmount,
      amountPaid: 0,
      dueDate,
      lines: invLines,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.invoices.unshift(newInvoice);
    return newInvoice;
  }

  public runAutomatedBillingJob(): { created: number; skipped: number; invoices: Invoice[] } {
    let created = 0;
    let skipped = 0;
    const generated: Invoice[] = [];

    // Loop over all active subscriptions
    const activeSubs = this.subscriptions.filter((s) => s.status === "active");

    for (const sub of activeSubs) {
      // Idempotency: check if invoice already generated for sub with current period start
      const existing = this.invoices.find(
        (inv) => inv.subscriptionId === sub.id && inv.billingPeriodStart === sub.startDate
      );

      if (existing) {
        skipped++;
      } else {
        const inv = this.generateInvoiceForSubscription(sub);
        generated.push(inv);
        created++;
      }
    }

    return { created, skipped, invoices: generated };
  }

  // --- Payments ---
  public recordPayment(params: {
    invoiceId: string;
    amount: number;
    method: Payment["method"];
    note?: string;
  }): { invoice: Invoice; payment: Payment } {
    const inv = this.invoices.find((i) => i.id === params.invoiceId || i.invoiceNumber === params.invoiceId);
    if (!inv) throw new Error("Invoice not found");

    const newAmountPaid = Math.min(inv.totalAmount, inv.amountPaid + params.amount);
    inv.amountPaid = newAmountPaid;
    if (inv.amountPaid >= inv.totalAmount) {
      inv.status = "paid";
    }
    inv.updatedAt = new Date().toISOString();

    const payment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      amount: params.amount,
      method: params.method,
      paymentDate: new Date().toISOString().split("T")[0],
      note: params.note || "Recorded via billing console",
      createdAt: new Date().toISOString(),
    };

    this.payments.unshift(payment);
    return { invoice: inv, payment };
  }

  // --- Aggregates for Finance Dashboard & Reports ---
  public getFinanceMetrics() {
    let revenueCollected = 0;
    let totalBilled = 0;
    let overdueAmount = 0;
    let overdueCount = 0;
    const now = new Date();

    for (const inv of this.invoices) {
      totalBilled += inv.totalAmount;
      revenueCollected += inv.amountPaid;

      const owed = Math.max(0, inv.totalAmount - inv.amountPaid);
      const isPastDue = new Date(inv.dueDate) < now && inv.status !== "paid";
      if (isPastDue && owed > 0) {
        overdueAmount += owed;
        overdueCount++;
      }
    }

    const stillOwed = Math.max(0, totalBilled - revenueCollected);
    const activeSubscriptions = this.subscriptions.filter((s) => s.status === "active").length;

    return {
      revenueCollected,
      stillOwed,
      overdueAmount,
      overdueCount,
      activeSubscriptions,
      totalBilled,
    };
  }
}

export const dataStore = BrightloopDataStore.getInstance();

