"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "../lib/api";
import Navbar from "../components/Navbar";
import { useToast } from "../components/Toast";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  rating: number;
  stock: number;
  is_available: boolean;
  created_at: string;
}

interface LocalOrder {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
  created_at: string;
  items: { id: number; name: string; price: string; quantity: number; image: string }[];
}

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "arrived"];

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  arrived:    "bg-green-100 text-green-700",
  delivered:  "bg-green-100 text-green-700",
};

const EMPTY_FORM = {
  name: "", description: "", price: "", category: "living",
  image: "", rating: 0, stock: 0, is_available: true,
};

type Tab = "products" | "orders";

export default function DashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("products");

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availFilter, setAvailFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Orders
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LocalOrder | null>(null);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/signin"); return; }
    if (user?.role !== "admin") { router.push("/"); }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("all_orders") || "[]");
    setOrders(all);
  }, [activeTab]);

  const fetchProducts = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const data = await apiGet("/products/", user.token);
      const list = data.results ?? data;
      setProducts(list); setFiltered(list);
    } catch { setError("Failed to load products."); }
    finally { setLoading(false); }
  }, [user?.token]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    let list = [...products];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.includes(search.toLowerCase()));
    if (categoryFilter !== "all") list = list.filter(p => p.category === categoryFilter);
    if (availFilter === "available") list = list.filter(p => p.is_available);
    if (availFilter === "unavailable") list = list.filter(p => !p.is_available);
    setFiltered(list);
  }, [search, categoryFilter, availFilter, products]);

  function openAdd() { setEditProduct(null); setForm(EMPTY_FORM); setError(""); setModalOpen(true); }
  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, image: p.image, rating: p.rating, stock: p.stock, is_available: p.is_available });
    setError(""); setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.token) return;
    setSaving(true); setError("");
    try {
      if (editProduct) await apiPut(`/products/${editProduct.id}/`, form, user.token);
      else await apiPost("/products/", form, user.token);
      setModalOpen(false); fetchProducts();
      showToast(editProduct ? "Product updated" : "Product added");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Save failed."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!user?.token) return;
    try {
      await apiDelete(`/products/${id}/`, user.token);
      setDeleteId(null); fetchProducts(); showToast("Product deleted", "info");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Delete failed."); }
  }

  async function handleToggle(id: number) {
    if (!user?.token) return;
    try {
      await apiPatch(`/products/${id}/toggle_availability/`, {}, user.token);
      fetchProducts();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Toggle failed."); }
  }

  function handleOrderStatusChange(orderId: number, newStatus: string) {
    const all = JSON.parse(localStorage.getItem("all_orders") || "[]");
    const updated = all.map((o: LocalOrder) => o.id === orderId ? { ...o, status: newStatus } : o);
    localStorage.setItem("all_orders", JSON.stringify(updated));
    setOrders(updated);
    if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
    showToast(`Order status → "${newStatus}"`);
  }

  const stats = {
    total: products.length,
    available: products.filter(p => p.is_available).length,
    unavailable: products.filter(p => !p.is_available).length,
    living: products.filter(p => p.category === "living").length,
    bedroom: products.filter(p => p.category === "bedroom").length,
    dining: products.filter(p => p.category === "dining").length,
  };

  if (!isLoggedIn || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-normal text-[#1a1a1a]">Admin Dashboard</h1>
            <p className="text-sm text-[#5a5a5a] mt-1">Welcome back, {user?.full_name}</p>
          </div>
          {activeTab === "products" && (
            <button onClick={openAdd} className="bg-[#8b3a2a] text-white text-sm px-6 py-2.5 rounded-sm hover:bg-[#7a3225] transition-colors">
              + Add Product
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-[#d6cfc6]">
          {(["products", "orders"] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-[#8b3a2a] text-[#8b3a2a]" : "border-transparent text-[#5a5a5a] hover:text-[#1a1a1a]"}`}>
              {tab === "orders" ? `Orders${orders.length > 0 ? ` (${orders.length})` : ""}` : "Products"}
            </button>
          ))}
        </div>

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
              {[
                { label: "Total", value: stats.total }, { label: "Available", value: stats.available },
                { label: "Unavailable", value: stats.unavailable }, { label: "Living", value: stats.living },
                { label: "Bedroom", value: stats.bedroom }, { label: "Dining", value: stats.dining },
              ].map(s => (
                <div key={s.label} className="bg-white border border-[#d6cfc6] rounded-sm p-4 text-center">
                  <p className="text-2xl font-semibold text-[#1a1a1a]">{s.value}</p>
                  <p className="text-xs text-[#5a5a5a] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#8b3a2a] w-64" />
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#8b3a2a]">
                <option value="all">All Categories</option>
                <option value="living">Living</option>
                <option value="bedroom">Bedroom</option>
                <option value="dining">Dining</option>
              </select>
              <select value={availFilter} onChange={e => setAvailFilter(e.target.value)}
                className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#8b3a2a]">
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>}
            {loading ? (
              <div className="text-center py-20 text-[#5a5a5a]">Loading products...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-[#5a5a5a]">No products found.</div>
            ) : (
              <div className="bg-white border border-[#d6cfc6] rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f0ea] border-b border-[#d6cfc6]">
                    <tr>
                      {["Product","Category","Price","Stock","Status","Actions"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs text-[#5a5a5a] font-medium uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ebe4]">
                    {filtered.map(p => (
                      <tr key={p.id} className="hover:bg-[#faf7f3] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {p.image ? <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-sm bg-[#e8e0d5]" />
                              : <div className="w-12 h-12 bg-[#e8e0d5] rounded-sm flex items-center justify-center text-[#a89f96] text-xs">No img</div>}
                            <div>
                              <p className="font-medium text-[#1a1a1a]">{p.name}</p>
                              <p className="text-xs text-[#5a5a5a] truncate max-w-[200px]">{p.description || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize text-[#5a5a5a]">{p.category}</td>
                        <td className="px-4 py-3 text-[#1a1a1a]">${parseFloat(p.price).toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#5a5a5a]">{p.stock}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleToggle(p.id)}
                            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${p.is_available ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>
                            {p.is_available ? "Available" : "Unavailable"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(p)} className="text-xs border border-[#1a1a1a] text-[#1a1a1a] px-3 py-1 hover:bg-[#1a1a1a] hover:text-white transition-colors">Edit</button>
                            <button onClick={() => setDeleteId(p.id)} className="text-xs border border-red-400 text-red-600 px-3 py-1 hover:bg-red-600 hover:text-white transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <>
            {orders.length === 0 ? (
              <div className="text-center py-24 text-[#5a5a5a] text-sm">No orders yet.</div>
            ) : selectedOrder ? (
              <div>
                <button onClick={() => setSelectedOrder(null)} className="text-sm text-[#5a5a5a] hover:text-[#8b3a2a] mb-6 transition-colors">← Back to orders</button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 flex flex-col gap-4">
                    <div className="bg-white border border-[#d6cfc6] rounded-sm p-6">
                      <h2 className="font-[family-name:var(--font-playfair)] text-lg font-normal text-[#1a1a1a] mb-3">Update Order Status</h2>
                      <p className="text-xs text-[#5a5a5a] mb-4">
                        Current: <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLOR[selectedOrder.status] || "bg-gray-100 text-gray-600"}`}>{selectedOrder.status}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ORDER_STATUSES.map(s => (
                          <button key={s} onClick={() => handleOrderStatusChange(selectedOrder.id, s)}
                            className={`text-sm px-4 py-2 rounded-sm capitalize transition-colors border ${selectedOrder.status === s ? "bg-[#8b3a2a] text-white border-[#8b3a2a]" : "border-[#d6cfc6] text-[#1a1a1a] hover:bg-[#f5f0ea]"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white border border-[#d6cfc6] rounded-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-[#f0ebe4]">
                        <h2 className="font-[family-name:var(--font-playfair)] text-lg font-normal text-[#1a1a1a]">Items</h2>
                      </div>
                      <div className="divide-y divide-[#f0ebe4]">
                        {selectedOrder.items.map((item, i) => (
                          <div key={i} className="px-5 py-4 flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#e8e0d5] rounded-sm overflow-hidden flex-shrink-0">
                              {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#1a1a1a]">{item.name}</p>
                              <p className="text-xs text-[#5a5a5a]">{item.price} × {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium">${(parseFloat(item.price.replace(/[$,]/g,""))*item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                      <div className="px-5 py-4 bg-[#faf7f3] border-t border-[#f0ebe4] text-sm flex flex-col gap-1">
                        <div className="flex justify-between text-[#5a5a5a]"><span>Subtotal</span><span>${selectedOrder.subtotal.toLocaleString()}</span></div>
                        <div className="flex justify-between text-[#5a5a5a]"><span>Shipping</span><span>{selectedOrder.shippingFee===0?"Free":`₱${selectedOrder.shippingFee}`}</span></div>
                        <div className="flex justify-between font-medium text-[#1a1a1a] pt-2 border-t border-[#e8e0d5]"><span>Total</span><span>${selectedOrder.total.toLocaleString()}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-[#d6cfc6] rounded-sm p-5">
                    <h2 className="font-[family-name:var(--font-playfair)] text-lg font-normal text-[#1a1a1a] mb-4">Customer</h2>
                    <div className="flex flex-col gap-1.5 text-sm text-[#5a5a5a]">
                      <p className="font-medium text-[#1a1a1a]">{selectedOrder.full_name}</p>
                      <p>{selectedOrder.email}</p>
                      <p>{selectedOrder.phone}</p>
                      <p className="mt-1">{selectedOrder.address}</p>
                      <p>{selectedOrder.city}, {selectedOrder.postal_code}</p>
                      <p className="mt-2 text-xs text-[#a89f96]">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#d6cfc6] rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f0ea] border-b border-[#d6cfc6]">
                    <tr>
                      {["Order","Customer","Total","Status","Actions"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs text-[#5a5a5a] font-medium uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ebe4]">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-[#faf7f3] transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#1a1a1a]">#{o.id}</p>
                          <p className="text-xs text-[#a89f96]">{new Date(o.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[#1a1a1a]">{o.full_name}</p>
                          <p className="text-xs text-[#5a5a5a]">{o.email}</p>
                        </td>
                        <td className="px-4 py-3 font-medium">${o.total.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLOR[o.status]||"bg-gray-100 text-gray-600"}`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelectedOrder(o)} className="text-xs border border-[#1a1a1a] text-[#1a1a1a] px-3 py-1 hover:bg-[#1a1a1a] hover:text-white transition-colors">Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add/Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setModalOpen(false)}>
          <div className="bg-[#f5f0ea] w-full max-w-lg rounded-sm p-8 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-normal text-[#1a1a1a]">{editProduct ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#5a5a5a] hover:text-[#1a1a1a] text-xl">✕</button>
            </div>
            {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>}
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#1a1a1a]">Product name *</label>
                <input type="text" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required placeholder="e.g. Harlow Sofa"
                  className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#1a1a1a]">Description</label>
                <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={3} placeholder="Short product description..."
                  className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#1a1a1a]">Price ($) *</label>
                  <input type="number" step="0.01" min="0.01" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} required placeholder="1999.00"
                    className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#1a1a1a]">Category *</label>
                  <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}
                    className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]">
                    <option value="living">Living</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="dining">Dining</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#1a1a1a]">Image URL</label>
                <input type="url" value={form.image} onChange={e => setForm(f=>({...f,image:e.target.value}))} placeholder="https://..."
                  className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]" />
                {form.image && <img src={form.image} alt="Preview" className="mt-2 h-28 w-full object-cover rounded-sm bg-[#e8e0d5]" />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#1a1a1a]">Stock</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm(f=>({...f,stock:parseInt(e.target.value)||0}))}
                    className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#1a1a1a]">Rating (0–5)</label>
                  <input type="number" min="0" max="5" value={form.rating} onChange={e => setForm(f=>({...f,rating:parseInt(e.target.value)||0}))}
                    className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-[#1a1a1a]">Available for sale</label>
                <button type="button" onClick={() => setForm(f=>({...f,is_available:!f.is_available}))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.is_available?"bg-[#8b3a2a]":"bg-[#c9b9a8]"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_available?"translate-x-7":"translate-x-1"}`} />
                </button>
                <span className="text-sm text-[#5a5a5a]">{form.is_available?"Yes":"No"}</span>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 border border-[#d6cfc6] text-[#1a1a1a] text-sm py-2.5 rounded-sm hover:bg-[#e8e0d5] transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#8b3a2a] text-white text-sm py-2.5 rounded-sm hover:bg-[#7a3225] transition-colors disabled:opacity-60">
                  {saving ? "Saving..." : editProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-[#f5f0ea] w-full max-w-sm rounded-sm p-8 shadow-xl text-center">
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-normal text-[#1a1a1a] mb-3">Delete Product?</h3>
            <p className="text-sm text-[#5a5a5a] mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-[#d6cfc6] text-sm py-2.5 rounded-sm hover:bg-[#e8e0d5] transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 text-white text-sm py-2.5 rounded-sm hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
