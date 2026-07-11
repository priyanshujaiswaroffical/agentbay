import { createClient } from "@supabase/supabase-js";
import type { UserProfile, UserRole } from "../components/LoginScreen";
import type { Product, Transaction } from "../types/os";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper: hash password simply for local-compat if needed
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

// ── AUTHENTICATION ─────────────────────────────────────────────────

export async function supabaseSignUp(name: string, role: UserRole, avatar: string, pw: string): Promise<UserProfile> {
  const email = `${name.toLowerCase().replace(/\s+/g, "")}@agentbay.com`;
  
  // Create user in Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: pw,
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error("Sign up failed");

  const balance = role === "seller" ? 0 : role === "admin" ? 99999999 : 250000;
  const profile: UserProfile = {
    id: authData.user.id,
    name,
    role,
    avatar,
    createdAt: new Date().toISOString(),
    balance,
    pwHash: simpleHash(pw), // kept for backwards compatibility in typescript types
  };

  // Save profile to database
  const { error: dbError } = await supabase
    .from("ab_profiles")
    .insert([{
      id: profile.id,
      name: profile.name,
      role: profile.role,
      avatar: profile.avatar,
      balance: profile.balance,
      created_at: profile.createdAt
    }]);

  if (dbError) throw new Error(dbError.message);
  return profile;
}

// Internal password for admin (Supabase requires 6+ chars; user just types "admin")
const ADMIN_INTERNAL_PW = "AgentBay_Admin!";

export async function supabaseSignIn(name: string, pw: string): Promise<UserProfile> {
  const isAdmin = name.toLowerCase() === "admin" && pw === "admin";
  const email = `${name.toLowerCase().replace(/\s+/g, "")}@agentbay.com`;
  const password = isAdmin ? ADMIN_INTERNAL_PW : pw;

  // Sign in using Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    // If admin doesn't exist yet, auto-create it on first login
    if (isAdmin) {
      try {
        const seededAdmin = await supabaseSignUp("admin", "admin", "🧠", ADMIN_INTERNAL_PW);
        return seededAdmin;
      } catch (seedErr) {
        throw new Error("Failed to create admin account. Check Supabase settings.");
      }
    }
    throw new Error("Invalid login credentials");
  }

  if (!authData.user) throw new Error("Sign in failed");

  // Fetch profile from database
  const { data: profileData, error: dbError } = await supabase
    .from("ab_profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (dbError || !profileData) {
    throw new Error(dbError?.message || "Profile not found in database.");
  }

  return {
    id: profileData.id,
    name: profileData.name,
    role: profileData.role as UserRole,
    avatar: profileData.avatar || "👤",
    createdAt: profileData.created_at,
    balance: Number(profileData.balance),
    pwHash: "",
  };
}

export async function supabaseSignOut() {
  await supabase.auth.signOut();
}

// ── PRODUCTS (MARKETPLACE) ────────────────────────────────────────

export async function supabaseGetProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("ab_products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    originalPrice: Number(p.original_price),
    specs: p.specs || "",
    condition: p.condition || "New",
    sellerAgent: p.seller_agent || "SellerAgent.exe",
    sellerName: p.seller_name || "Merchant",
    sellerTrust: p.seller_trust || 95,
    description: p.description || "",
    image: p.image || "",
    minAcceptablePrice: p.min_acceptable_price ? Number(p.min_acceptable_price) : undefined,
  }));
}

export async function supabaseAddProduct(p: Product, sellerId: string) {
  const { error } = await supabase
    .from("ab_products")
    .insert([{
      name: p.name,
      category: p.category,
      price: p.price,
      original_price: p.originalPrice,
      specs: p.specs,
      condition: p.condition,
      seller_id: sellerId,
      seller_name: p.sellerName,
      seller_agent: p.sellerAgent,
      seller_trust: p.sellerTrust,
      description: p.description,
      image: p.image,
      min_acceptable_price: p.minAcceptablePrice
    }]);

  if (error) throw error;
}

export async function supabaseDeleteProduct(id: string) {
  const { error } = await supabase
    .from("ab_products")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ── TRANSACTIONS ──────────────────────────────────────────────────

export async function supabaseGetTransactions(userId: string, role: UserRole): Promise<Transaction[]> {
  let query = supabase.from("ab_transactions").select("*");
  
  // Non-admins only see transactions they participated in
  if (role !== "admin") {
    query = query.eq("buyer_id", userId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;

  return (data || []).map(t => ({
    id: t.id,
    timestamp: t.created_at,
    productName: t.product_name,
    originalPrice: Number(t.original_price),
    finalPrice: Number(t.final_price),
    savings: Number(t.savings),
    buyerAgent: t.buyer_agent,
    sellerAgent: t.seller_agent,
    receiptId: t.receipt_id,
    negotiationTimeline: t.negotiation_timeline || [],
  }));
}

export async function supabaseAddTransaction(t: Transaction, buyerId: string) {
  const { error } = await supabase
    .from("ab_transactions")
    .insert([{
      buyer_id: buyerId,
      buyer_agent: t.buyerAgent,
      seller_agent: t.sellerAgent,
      product_name: t.productName,
      original_price: t.originalPrice,
      final_price: t.finalPrice,
      savings: t.savings,
      receipt_id: t.receiptId,
      negotiation_timeline: t.negotiationTimeline
    }]);

  if (error) throw error;
}

// ── CATEGORIES ────────────────────────────────────────────────────

export async function supabaseGetCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("ab_categories")
    .select("name")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map(c => c.name);
}

export async function supabaseAddCategory(name: string) {
  const { error } = await supabase
    .from("ab_categories")
    .insert([{ name }]);

  if (error) throw error;
}

export async function supabaseDeleteCategory(name: string) {
  const { error } = await supabase
    .from("ab_categories")
    .delete()
    .eq("name", name);

  if (error) throw error;
}
