"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "../lib/api";
import Navbar from "../components/Navbar";

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

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "living",
  image: "",
  rating: 0,
  stock: 0,
  is_available: true,
};

export default function DashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

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

  // Redirect non-admins
  useEffect(() => {
    if (!isLoggedIn) { router.push("/signin"); return; }
    if (user?.role !== "admin") { router.push("/"); }
  }, [isLoggedIn, user, router]);

  const fetchProducts = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const data = await apiGet("/products/", user.token);
      const list = data.results ?? data;
      setProducts(list);
      setFiltered(list);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Search + filter
  useEffect(() => {
    let list = [...products];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.includes(search.toLowerCase()));
    if (categoryFilter !== "all") list = list.filter(p => p.category === categoryFilter);
    if (availFilter === "available") list = list.filter(p => p.is_available);
    if (availFilter === "unavailable") list = list.filter(p => !p.is_available);
    setFiltered(list);
  }, [search, categoryFilter, availFilter, products]);

  function openAdd() {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      rating: p.rating,
      stock: p.stock,
      is_available: p.is_available,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.token) return;
    setSaving(true);
    setError("");
    try {
      if (editProduct) {
        await apiPut(`/products/${editProduct.id}/`, form, user.token);
      } else {
        await apiPost("/products/", form, user.token);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!user?.token) return;
    try {
      await apiDelete(`/products/${id}/`, user.token);
      setDeleteId(null);
      fetchProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  async function handleToggle(id: number) {
    if (!user?.token) return;
    try {
      await apiPatch(`/products/${id}/toggle_availability/`, {}, user.token);
      fetchProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Toggle failed.");
    }
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-normal text-[#1a1a1a]">
              Admin Dashboard
            </h1>
            <p className="text-sm text-[#5a5a5a] mt-1">Welcome back, {user?.full_name}</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-[#8b3a2a] text-white text-sm px-6 py-2.5 rounded-sm hover:bg-[#7a3225] transition-colors"
          >
            + Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total },
            { label: "Available", value: stats.available },
            { label: "Unavailable", value: stats.unavailable },
            { label: "Living", value: stats.living },
            { label: "Bedroom", value: stats.bedroom },
            { label: "Dining", value: stats.dining },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#d6cfc6] rounded-sm p-4 text-center">
              <p className="text-2xl font-semibold text-[#1a1a1a]">{s.value}</p>
              <p className="text-xs text-[#5a5a5a] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#8b3a2a] w-64"
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#8b3a2a]"
          >
            <option value="all">All Categories</option>
            <option value="living">Living</option>
            <option value="bedroom">Bedroom</option>
            <option value="dining">Dining</option>
          </select>
          <select
            value={availFilter}
            onChange={e => setAvailFilter(e.target.value)}
            className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#8b3a2a]"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Product Table */}
        {loading ? (
          <div className="text-center py-20 text-[#5a5a5a]">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#5a5a5a]">No products found.</div>
        ) : (
          <div className="bg-white border border-[#d6cfc6] rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#f5f0ea] border-b border-[#d6cfc6]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-[#5a5a5a] font-medium uppercase tracking-wide">Product</th>
                  <th className="text-left px-4 py-3 text-xs text-[#5a5a5a] font-medium uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 text-xs text-[#5a5a5a] font-medium uppercase tracking-wide">Price</th>
                  <th className="text-left px-4 py-3 text-xs text-[#5a5a5a] font-medium uppercase tracking-wide">Stock</th>
                  <th className="text-left px-4 py-3 text-xs text-[#5a5a5a] font-medium uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-[#5a5a5a] font-medium uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ebe4]">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-[#faf7f3] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-sm bg-[#e8e0d5]" />
                        ) : (
                          <div className="w-12 h-12 bg-[#e8e0d5] rounded-sm flex items-center justify-center text-[#a89f96] text-xs">No img</div>
                        )}
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
                      <button
                        onClick={() => handleToggle(p.id)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          p.is_available
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {p.is_available ? "Available" : "Unavailable"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-xs border border-[#1a1a1a] text-[#1a1a1a] px-3 py-1 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="text-xs border border-red-400 text-red-600 px-3 py-1 hover:bg-red-600 hover:text-white transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setModalOpen(false)}>
          <div className="bg-[#f5f0ea] w-full max-w-lg rounded-sm p-8 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-normal text-[#1a1a1a]">
                {editProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#5a5a5a] hover:text-[#1a1a1a] text-xl">✕</button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#1a1a1a]">Product name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]"
                  placeholder="e.g. Harlow Sofa"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#1a1a1a]">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a] resize-none"
                  placeholder="Short product description..."
                />
              </div>

              {/* Price + Category row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#1a1a1a]">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    required
                    className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]"
                    placeholder="1999.00"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#1a1a1a]">Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]"
                  >
                    <option value="living">Living</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="dining">Dining</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#1a1a1a]">Image URL</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]"
                  placeholder="https://images.unsplash.com/..."
                />
                {form.image && (
                  <img src={form.image} alt="Preview" className="mt-2 h-28 w-full object-cover rounded-sm bg-[#e8e0d5]" />
                )}
              </div>

              {/* Stock + Rating row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#1a1a1a]">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                    className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#1a1a1a]">Rating (0–5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={e => setForm(f => ({ ...f, rating: parseInt(e.target.value) || 0 }))}
                    className="bg-white border border-[#d6cfc6] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#8b3a2a]"
                  />
                </div>
              </div>

              {/* Availability toggle */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-[#1a1a1a]">Available for sale</label>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.is_available ? "bg-[#8b3a2a]" : "bg-[#c9b9a8]"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_available ? "translate-x-7" : "translate-x-1"}`} />
                </button>
                <span className="text-sm text-[#5a5a5a]">{form.is_available ? "Yes" : "No"}</span>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-[#d6cfc6] text-[#1a1a1a] text-sm py-2.5 rounded-sm hover:bg-[#e8e0d5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#8b3a2a] text-white text-sm py-2.5 rounded-sm hover:bg-[#7a3225] transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving..." : editProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-[#f5f0ea] w-full max-w-sm rounded-sm p-8 shadow-xl text-center">
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-normal text-[#1a1a1a] mb-3">Delete Product?</h3>
            <p className="text-sm text-[#5a5a5a] mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-[#d6cfc6] text-sm py-2.5 rounded-sm hover:bg-[#e8e0d5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 text-white text-sm py-2.5 rounded-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
