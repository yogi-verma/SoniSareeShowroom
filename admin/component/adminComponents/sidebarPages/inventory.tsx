"use client";

/* eslint-disable @next/next/no-img-element -- Product images come from Cloudinary; local previews use blob URLs. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiImage,
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
  additionalPhotos: File[];
};

function emptyForm(): ProductForm {
  return { productType: "", category: "", name: "", price: "", stock: "", photo: null, additionalPhotos: [] };
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

type InventoryDropdownOption = { value: string; label: string };

function InventoryDropdown({
  id,
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  options: InventoryDropdownOption[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-[var(--admin-border-strong)] bg-white px-3 text-left text-sm shadow-sm transition hover:border-[#b99bb5] hover:bg-[#fdfbfd] focus-visible:border-[#9b7294] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#401d3c]/10 ${selectedOption ? "text-[var(--admin-charcoal)]" : "text-[#928a92]"}`}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <FiChevronDown size={16} aria-hidden="true" className={`shrink-0 text-[#817982] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div role="menu" aria-label={label} className="absolute left-0 top-full z-50 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-[var(--admin-border)] bg-white p-1.5 shadow-[0_12px_32px_rgba(41,35,43,0.18)]">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`flex min-h-9 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-xs transition ${isSelected ? "bg-[#f3ebf2] font-semibold text-plum" : "text-[#5f5661] hover:bg-[#faf8f5] hover:text-plum"}`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <FiCheck size={14} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  const additionalPhotoPreviews = useMemo(() => form.additionalPhotos.map((file) => URL.createObjectURL(file)), [form.additionalPhotos]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
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
    return () => additionalPhotoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [additionalPhotoPreviews]);

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

  function closeModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setFormError("");
  }

  function resetForm() {
    setForm(emptyForm());
    setPhotoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (additionalFileInputRef.current) additionalFileInputRef.current.value = "";
  }

  function handleAdditionalPhotosChange(files: FileList | null) {
    const selected = Array.from(files ?? []);
    if (form.additionalPhotos.length + selected.length > 4) {
      setFormError("Choose up to 4 additional photos in total.");
      if (additionalFileInputRef.current) additionalFileInputRef.current.value = "";
      return;
    }
    if (selected.some((file) => !file.type.startsWith("image/"))) {
      setFormError("All additional photos must be image files.");
      return;
    }
    if (selected.some((file) => file.size > 5 * 1024 * 1024)) {
      setFormError("Each additional photo must be 5 MB or smaller.");
      return;
    }
    setForm((current) => ({ ...current, additionalPhotos: [...current.additionalPhotos, ...selected] }));
    setFormError("");
    if (additionalFileInputRef.current) additionalFileInputRef.current.value = "";
  }

  function removeAdditionalPhoto(index: number) {
    setForm((current) => ({ ...current, additionalPhotos: current.additionalPhotos.filter((_, photoIndex) => photoIndex !== index) }));
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
        additionalPhotos: form.additionalPhotos,
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
      </div>

      {notice && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-[#cfe4dc] bg-[#eef7f3] px-4 py-3 text-sm text-[#356b57]">
          <FiCheck size={16} aria-hidden="true" /> {notice}
        </p>
      )}

      <div className="mb-3 flex min-w-0 items-center gap-2 sm:gap-3">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search products</span>
          <FiSearch size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-subtle)]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} style={{ paddingLeft: "2.5rem" }} className={`${fieldClass} text-xs sm:text-sm`} placeholder="Search products" />
        </label>
        <div className="w-[clamp(7.25rem,30vw,13rem)] shrink-0">
          <InventoryDropdown
            id="inventory-type-filter"
            label="Filter products by type"
            value={typeFilter}
            placeholder="All types"
            options={[{ value: "all", label: "All types" }, ...productTypes.map((type) => ({ value: type, label: titleCase(type) }))]}
            onChange={(value) => setTypeFilter(value as ProductType | "all")}
          />
        </div>
        <button type="button" onClick={() => { resetForm(); setFormError(""); setIsModalOpen(true); }} aria-label="Add product" title="Add product" className="admin-button-primary h-10 w-10 shrink-0 px-0 sm:w-auto sm:px-4">
          <FiPlus size={17} aria-hidden="true" /><span className="hidden sm:inline">Add product</span>
        </button>
      </div>

      <div className="mb-2 flex items-center justify-between gap-3 px-0.5">
        <p className="text-[11px] text-[var(--admin-muted)]">{isLoading ? "Loading products…" : `${visibleProducts.length} ${visibleProducts.length === 1 ? "product" : "products"}`}</p>
        <button type="button" onClick={() => void loadProducts()} disabled={isLoading} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium text-[var(--admin-muted)] transition hover:bg-white hover:text-plum disabled:opacity-50">
          {isLoading ? <FiLoader size={13} className="animate-spin" /> : <FiRefreshCw size={13} />} Refresh
        </button>
      </div>

        {loadError ? (
          <div className="admin-panel p-8 text-center">
            <p role="alert" className="text-sm text-[var(--admin-danger)]">{loadError}</p>
            <button type="button" onClick={() => void loadProducts()} className="admin-button-secondary mt-4"><FiRefreshCw size={14} /> Try again</button>
          </div>
        ) : isLoading ? (
          <div className="grid min-h-48 place-items-center rounded-xl border border-[var(--admin-border)] bg-white p-8 text-sm text-[var(--admin-muted)]"><span className="inline-flex items-center gap-2"><FiLoader className="animate-spin" /> Loading inventory…</span></div>
        ) : visibleProducts.length === 0 ? (
          <div className="admin-panel grid min-h-48 place-items-center p-8 text-center">
            <div><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f7f3f6] text-plum"><FiPackage size={21} /></span>
              <h3 className="mt-3 font-serif text-lg text-[var(--admin-charcoal)]">{products.length ? "No matching products" : "Your inventory is ready"}</h3>
              <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--admin-muted)]">{products.length ? "Try a different search or product type." : "Add your first design to start keeping track of stock."}</p>
              {!products.length && <button type="button" onClick={() => setIsModalOpen(true)} className="admin-button-primary mt-4"><FiPlus size={15} /> Add your first product</button>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {visibleProducts.map((product) => (
              <article key={product._id} className="group min-w-0 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-white transition hover:-translate-y-0.5 hover:shadow-[var(--admin-shadow-panel)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f6f2ed]">
                  <img src={product.photo.url} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                  <span className="absolute left-1.5 top-1.5 rounded-full border border-white/70 bg-white/90 px-2 py-0.5 text-[8px] font-semibold capitalize text-[#514852] shadow-sm sm:left-2 sm:top-2 sm:text-[9px]">{product.productType}</span>
                </div>
                <div className="pt-2 sm:pt-2.5 px-2 sm:px-2.5">
                  <h3 className="line-clamp-2 min-h-6 text-[11px] font-semibold leading-4 text-[var(--admin-charcoal)] sm:text-xs" title={product.name}>{product.name}</h3>
                  <p className="truncate text-[9px] mb-1 text-[var(--admin-subtle)]">{product.category}</p>
                  <div className=" flex items-center justify-between gap-1 py-1">
                    <span className="truncate font-serif text-xs text-plum sm:text-sm">{formatPrice(product.price)}</span>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${product.stock === 0 ? "bg-[#fff0ef] text-[#a13d39]" : product.stock <= 5 ? "bg-[#fbf3e3] text-[#8a682e]" : "bg-[#edf6f1] text-[#356b57]"}`}>
                      {product.stock === 0 ? "Out" : `Qty ${product.stock}`}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      {isModalOpen && (
        <div className="admin-modal-backdrop admin-centered-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="inventory-form-title" aria-describedby="inventory-form-description" className="admin-modal max-w-xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="admin-page-kicker mb-1">New arrival</p><h2 id="inventory-form-title" className="font-serif text-2xl text-[var(--admin-charcoal)]">Add a product</h2><p id="inventory-form-description" className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">Add the design details, stock count, and a clear product photo.</p></div>
              <button type="button" onClick={closeModal} disabled={isSaving} aria-label="Close add product form" className="admin-icon-button -mr-2 -mt-2 disabled:opacity-50"><FiX size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div><label htmlFor="inventory-product-type" className="admin-field-label">Product type <span className="text-[#a13d39]">*</span></label><InventoryDropdown id="inventory-product-type" label="Product type" value={form.productType} placeholder="Select type" options={productTypes.map((type) => ({ value: type, label: titleCase(type) }))} onChange={(value) => setForm((current) => ({ ...current, productType: value as ProductType }))} /></div>
                <div><label htmlFor="inventory-product-category" className="admin-field-label">Category <span className="text-[#a13d39]">*</span></label><InventoryDropdown id="inventory-product-category" label="Category" value={form.category} placeholder="Select category" options={productCategories.map((category) => ({ value: category, label: category }))} onChange={(value) => setForm((current) => ({ ...current, category: value as ProductCategory }))} /></div>
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
              <div>
                <span className="admin-field-label">Additional photos <span className="font-normal text-[var(--admin-subtle)]">(optional · up to 4)</span></span>
                <input ref={additionalFileInputRef} type="file" accept="image/*" multiple aria-label="Additional product photos" className="sr-only" onChange={(event) => handleAdditionalPhotosChange(event.target.files)} />
                <button type="button" disabled={form.additionalPhotos.length >= 4} onClick={() => additionalFileInputRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[var(--admin-border-strong)] bg-[#fcfbf9] p-3 text-left transition hover:border-[#b99bb5] hover:bg-[#fbf7fb] disabled:cursor-not-allowed disabled:opacity-60">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#f3ebf2] text-plum"><FiImage size={19} /></span>
                  <span><span className="block text-xs font-semibold text-[var(--admin-charcoal)]">Choose more photos</span><span className="mt-1 block text-[10px] text-[var(--admin-subtle)]">Select multiple images · {form.additionalPhotos.length}/4 · up to 5 MB each</span></span>
                  <FiUploadCloud className="ml-auto shrink-0 text-[var(--admin-subtle)]" size={17} />
                </button>
                {!!form.additionalPhotos.length && <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{form.additionalPhotos.map((file, index) => <li key={`${file.name}-${index}`} className="relative min-w-0 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-white"><img src={additionalPhotoPreviews[index]} alt={`Additional product photo ${index + 1}`} className="aspect-square w-full object-cover" /><button type="button" onClick={() => removeAdditionalPhoto(index)} aria-label={`Remove ${file.name}`} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[#6c536b] shadow"><FiX size={14} /></button><span className="block truncate px-2 py-1 text-[9px] text-[var(--admin-muted)]">{file.name}</span></li>)}</ul>}
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
