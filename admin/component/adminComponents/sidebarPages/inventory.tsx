"use client";

/* eslint-disable @next/next/no-img-element -- Product images come from Cloudinary; local previews use blob URLs. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  FiCheck,
  FiImage,
  FiLayers,
  FiLoader,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import { createProduct, getProducts } from "../../../utils/adminApi";
import type { Product, ProductCategory, ProductType } from "../../../utils/adminApi";
import { useAccessibleDialog } from "../useAccessibleDialog";

const productTypes: ProductType[] = ["saree", "shut", "rajputi poshak"];
const productCategories: ProductCategory[] = [
  "Banarshi Silk",
  "Kanjiviram Silk",
  "Cotton and Handloom",
  "Georgette & Chiffron",
  "Bandhani",
];

type ProductForm = {
  productType: ProductType | "";
  category: ProductCategory | "";
  name: string;
  price: string;
  stock: string;
  photo: File | null;
};

function emptyForm(): ProductForm {
  return { productType: "", category: "", name: "", price: "", stock: "", photo: null };
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const fieldClass = "admin-field";

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "all">("all");
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useAccessibleDialog(isModalOpen, isSaving, closeModal);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const result = await getProducts();
      setProducts(result.products);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load inventory.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    getProducts()
      .then((result) => {
        if (isCurrent) setProducts(result.products);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setLoadError(error instanceof Error ? error.message : "Could not load inventory.");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    if (!photoPreview) return;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return products.filter((product) => {
      const matchesType = typeFilter === "all" || product.productType === typeFilter;
      const matchesSearch = !normalizedSearch
        || product.name.toLocaleLowerCase().includes(normalizedSearch)
        || product.category.toLocaleLowerCase().includes(normalizedSearch);
      return matchesType && matchesSearch;
    });
  }, [products, search, typeFilter]);

  const stockSummary = useMemo(() => ({
    designs: products.length,
    totalUnits: products.reduce((total, product) => total + product.stock, 0),
    lowStock: products.filter((product) => product.stock > 0 && product.stock <= 5).length,
  }), [products]);

  function closeModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setFormError("");
  }

  function resetForm() {
    setForm(emptyForm());
    setPhotoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handlePhotoChange(file: File | undefined) {
    if (file && !file.type.startsWith("image/")) {
      setFormError("Choose an image file for the product photo.");
      setForm((current) => ({ ...current, photo: null }));
      setPhotoPreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setFormError("Product photo must be 5 MB or smaller.");
      setForm((current) => ({ ...current, photo: null }));
      setPhotoPreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setForm((current) => ({ ...current, photo: file ?? null }));
    setPhotoPreview(file ? URL.createObjectURL(file) : "");
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!form.productType || !form.category || !form.photo) {
      setFormError("Choose a product type, a category, and a product photo.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createProduct({
        productType: form.productType,
        category: form.category,
        name: form.name.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        photo: form.photo,
      });
      setProducts((current) => [result.product, ...current]);
      setNotice("Product added to inventory.");
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not add this product.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section aria-labelledby="inventory-title">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Stockroom</p>
          <h1 id="inventory-title" className="admin-page-title">Inventory</h1>
          <p className="admin-page-description">Keep your sarees, suits, and poshak collections organized.</p>
        </div>
        <button type="button" onClick={() => { resetForm(); setFormError(""); setIsModalOpen(true); }} className="admin-button-primary w-full sm:w-auto">
          <FiPlus size={16} aria-hidden="true" /> Add product
        </button>
      </div>

      {notice && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-[#cfe4dc] bg-[#eef7f3] px-4 py-3 text-sm text-[#356b57]">
          <FiCheck size={16} aria-hidden="true" /> {notice}
        </p>
      )}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="admin-panel flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f3ebf2] text-plum"><FiLayers size={18} /></span>
          <div><p className="text-[11px] text-[var(--admin-muted)]">Product designs</p><p className="mt-0.5 text-lg font-semibold">{isLoading ? "—" : stockSummary.designs}</p></div>
        </div>
        <div className="admin-panel flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef7f3] text-[#356b57]"><FiPackage size={18} /></span>
          <div><p className="text-[11px] text-[var(--admin-muted)]">Units in stock</p><p className="mt-0.5 text-lg font-semibold">{isLoading ? "—" : stockSummary.totalUnits}</p></div>
        </div>
        <div className="admin-panel flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fbf5e8] text-[#8a682e]"><FiPackage size={18} aria-hidden="true" /></span>
          <div><p className="text-[11px] text-[var(--admin-muted)]">Low stock designs</p><p className="mt-0.5 text-lg font-semibold">{isLoading ? "—" : stockSummary.lowStock}</p></div>
        </div>
      </div>

      <div className="admin-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--admin-border)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="admin-panel-title">Products</h2>
            <p className="admin-panel-description">Your current collection and available stock</p>
          </div>
          <button type="button" onClick={() => void loadProducts()} disabled={isLoading} className="admin-button-secondary self-start sm:self-auto">
            {isLoading ? <FiLoader size={15} className="animate-spin" /> : <FiRefreshCw size={15} />} Refresh
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-[var(--admin-border)] p-4 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search products</span>
            <FiSearch size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-subtle)]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className={`${fieldClass} pl-9`} placeholder="Search by name or category" />
          </label>
          <label className="sm:w-52">
            <span className="sr-only">Filter by product type</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as ProductType | "all")} className={fieldClass}>
              <option value="all">All product types</option>
              {productTypes.map((type) => <option key={type} value={type}>{titleCase(type)}</option>)}
            </select>
          </label>
        </div>

        {loadError ? (
          <div className="p-10 text-center">
            <p role="alert" className="text-sm text-[var(--admin-danger)]">{loadError}</p>
            <button type="button" onClick={() => void loadProducts()} className="admin-button-secondary mt-4"><FiRefreshCw size={14} /> Try again</button>
          </div>
        ) : isLoading ? (
          <div className="grid min-h-64 place-items-center p-8 text-sm text-[var(--admin-muted)]"><span className="inline-flex items-center gap-2"><FiLoader className="animate-spin" /> Loading inventory…</span></div>
        ) : visibleProducts.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f7f3f6] text-plum"><FiPackage size={21} /></span>
              <h3 className="mt-3 font-serif text-lg text-[var(--admin-charcoal)]">{products.length ? "No matching products" : "Your inventory is ready"}</h3>
              <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--admin-muted)]">{products.length ? "Try a different search or product type." : "Add your first design to start keeping track of stock."}</p>
              {!products.length && <button type="button" onClick={() => setIsModalOpen(true)} className="admin-button-primary mt-4"><FiPlus size={15} /> Add your first product</button>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <article key={product._id} className="group overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white transition hover:-translate-y-0.5 hover:shadow-[var(--admin-shadow-panel)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f6f2ed]">
                  <img src={product.photo.url} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-semibold capitalize text-[#514852] shadow-sm">{product.productType}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-[var(--admin-charcoal)]" title={product.name}>{product.name}</h3><p className="mt-1 truncate text-xs text-[var(--admin-subtle)]">{product.category}</p></div>
                    <span className="shrink-0 font-serif text-base text-plum">{formatPrice(product.price)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#f0ece8] pt-3">
                    <span className="text-[11px] text-[var(--admin-muted)]">Available stock</span>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${product.stock === 0 ? "border-[#efd5d3] bg-[#fff7f6] text-[#a13d39]" : product.stock <= 5 ? "border-[#efdfbc] bg-[#fbf5e8] text-[#8a682e]" : "border-[#cfe4dc] bg-[#eef7f3] text-[#356b57]"}`}>
                      {product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-backdrop admin-centered-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="inventory-form-title" aria-describedby="inventory-form-description" className="admin-modal max-w-xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="admin-page-kicker mb-1">New arrival</p><h2 id="inventory-form-title" className="font-serif text-2xl text-[var(--admin-charcoal)]">Add a product</h2><p id="inventory-form-description" className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">Add the design details, stock count, and a clear product photo.</p></div>
              <button type="button" onClick={closeModal} disabled={isSaving} aria-label="Close add product form" className="admin-icon-button -mr-2 -mt-2 disabled:opacity-50"><FiX size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label><span className="admin-field-label">Product type <span className="text-[#a13d39]">*</span></span><select required value={form.productType} onChange={(event) => setForm((current) => ({ ...current, productType: event.target.value as ProductType | "" }))} className={fieldClass}><option value="" disabled>Select type</option>{productTypes.map((type) => <option key={type} value={type}>{titleCase(type)}</option>)}</select></label>
                <label><span className="admin-field-label">Category <span className="text-[#a13d39]">*</span></span><select required value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as ProductCategory | "" }))} className={fieldClass}><option value="" disabled>Select category</option>{productCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
              </div>
              <label className="block"><span className="admin-field-label">Product name <span className="text-[#a13d39]">*</span></span><input required maxLength={120} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={fieldClass} placeholder="e.g. Rose gold woven silk saree" /></label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label><span className="admin-field-label">Price (₹) <span className="text-[#a13d39]">*</span></span><input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} className={fieldClass} placeholder="0" /></label>
                <label><span className="admin-field-label">Stock quantity <span className="text-[#a13d39]">*</span></span><input required type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} className={fieldClass} placeholder="0" /></label>
              </div>
              <div>
                <span className="admin-field-label">Product photo <span className="text-[#a13d39]">*</span></span>
                <input ref={fileInputRef} type="file" accept="image/*" aria-label="Product photo" className="sr-only" onChange={(event) => handlePhotoChange(event.target.files?.[0])} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[var(--admin-border-strong)] bg-[#fcfbf9] p-3 text-left transition hover:border-[#b99bb5] hover:bg-[#fbf7fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/30">
                  {photoPreview ? <img src={photoPreview} alt="Selected product preview" className="h-14 w-14 rounded-lg object-cover" /> : <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-[#f3ebf2] text-plum"><FiUploadCloud size={20} /></span>}
                  <span className="min-w-0"><span className="block truncate text-xs font-semibold text-[var(--admin-charcoal)]">{form.photo?.name ?? "Choose a product image"}</span><span className="mt-1 block text-[10px] text-[var(--admin-subtle)]">JPG, PNG, or WebP · up to 5 MB</span></span>
                  <FiImage className="ml-auto shrink-0 text-[var(--admin-subtle)]" size={17} />
                </button>
              </div>

              {formError && <p role="alert" className="rounded-lg border border-[#f0d8d6] bg-[#fff6f5] px-3 py-2.5 text-xs leading-5 text-[#a13d39]">{formError}</p>}

              <div className="flex flex-col-reverse gap-2 border-t border-[var(--admin-border)] pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} disabled={isSaving} className="admin-button-secondary sm:min-w-28">Cancel</button>
                <button type="submit" disabled={isSaving} className="admin-button-primary sm:min-w-36">{isSaving ? <><FiLoader className="animate-spin" size={15} /> Saving product…</> : <><FiPlus size={15} /> Save product</>}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
