import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { PurchaseButtons } from "./ui/PurchaseButtons";

/* eslint-disable @next/next/no-img-element -- The admin inventory view keeps Cloudinary images as direct URLs. */

export type StoreProduct = {
  _id: string;
  productType?: string;
  category: string;
  name: string;
  price: number;
  stock: number;
  photo?: { url?: string };
};

type Props = {
  product: StoreProduct;
  variant?: "grid" | "featured" | "search" | "related" | "inventory";
  index?: number;
  total?: number;
  onBuy?: () => void;
  onAddToCart?: () => void;
  buying?: boolean;
  adding?: boolean;
  actionsDisabled?: boolean;
  addLabel?: string;
  buyLabel?: string;
  onNavigate?: () => void;
  headerAction?: ReactNode;
  inventoryFooter?: ReactNode;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

export default function ProductCard({
  product,
  variant = "grid",
  index,
  total,
  onBuy,
  onAddToCart,
  buying = false,
  adding = false,
  actionsDisabled = false,
  addLabel = "Add to cart",
  buyLabel = "Buy now",
  onNavigate,
  headerAction,
  inventoryFooter,
}: Props) {
  const isSoldOut = product.stock < 1;
  const href = `/products/${encodeURIComponent(product._id)}`;
  const hasActions = Boolean(onBuy || onAddToCart);
  const fullCardLink = !isSoldOut && !hasActions && (variant === "grid" || variant === "search");
  const soldOutClass = isSoldOut ? `store-product-card--sold-out${variant === "inventory" ? "" : " cursor-sold-out"}` : "";
  const imageSizes = variant === "search"
    ? "56px"
    : variant === "featured"
      ? "(max-width: 640px) 76vw, (max-width: 1024px) 31vw, 20vw"
      : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

  return (
    <article data-product-card className={`store-product-card store-product-card--${variant}${soldOutClass ? ` ${soldOutClass}` : ""}`}>
      {fullCardLink && <Link href={href} onClick={onNavigate} aria-label={`View ${product.name}`} className="store-product-card__full-link"><span className="sr-only">View {product.name}</span></Link>}
      <div className="store-product-card__image-wrap">
        {product.stock > 0 && !fullCardLink && variant !== "inventory" && <Link href={href} onClick={onNavigate} aria-label={`View ${product.name}`} className="store-product-card__image-link"><span className="sr-only">View {product.name}</span></Link>}
        {variant === "inventory" && product.photo?.url
          ? <img src={product.photo.url} alt={product.name} loading="lazy" className="store-product-card__image" />
          : product.photo?.url ? <Image src={product.photo.url} alt={product.name} fill unoptimized sizes={imageSizes} loading={variant === "featured" && typeof index === "number" && index < 5 ? "eager" : "lazy"} className="store-product-card__image" />
            : <div className="store-product-card__image-fallback">Image unavailable</div>}
        {variant !== "search" && <span className="store-product-card__category">{variant === "inventory" ? product.productType : product.category}</span>}
        {typeof index === "number" && <span className="store-product-card__index">{String(index + 1).padStart(2, "0")} / {String(total ?? 0).padStart(2, "0")}</span>}
        {headerAction && <div className="store-product-card__header-action">{headerAction}</div>}
        {isSoldOut && <span className="store-product-card__sold-out-label">SOLD OUT</span>}
      </div>

      <div className="store-product-card__body">
        {variant === "inventory" ? <>
          <h3 className="store-product-card__name">{product.name}</h3>
          <p className="store-product-card__inventory-category">{product.category}</p>
          <div className="store-product-card__price-row">
            <strong className="store-product-card__price">{formatPrice(product.price)}</strong>
            <span className={`store-product-card__inventory-quantity${isSoldOut ? " is-sold-out" : product.stock <= 5 ? " is-low-stock" : " is-in-stock"}`}>Qty {product.stock}</span>
          </div>
          {inventoryFooter}
        </> : <>
        {variant === "featured" && <span className={`store-product-card__stock${isSoldOut ? " is-sold-out" : ""}`}>{isSoldOut ? "Available soon" : `${product.stock} in stock`}</span>}
        <h3 className="store-product-card__name">
          {isSoldOut || fullCardLink ? product.name : <Link href={href} onClick={onNavigate}>{product.name}</Link>}
        </h3>
        <div className="store-product-card__price-row">
          <strong className="store-product-card__price">{formatPrice(product.price)}</strong>
          {(variant === "grid" || variant === "related") && <span className={`store-product-card__stock${isSoldOut ? " is-sold-out" : ""}`}>{isSoldOut ? "Available soon" : "In stock"}</span>}
        </div>
        {variant === "search" && <>
          <span className="store-product-card__meta">{product.productType} · {product.category}</span>
          {isSoldOut && <span className="store-product-card__stock is-sold-out">Available soon</span>}
        </>}
        {hasActions && <PurchaseButtons
          onBuy={onBuy}
          onAddToCart={onAddToCart}
          disabled={isSoldOut}
          buying={buying}
          adding={adding}
          actionsDisabled={actionsDisabled}
          addLabel={addLabel}
          buyLabel={buyLabel}
          size={variant === "related" ? "compact" : "card"}
        />}
        </>}
      </div>
    </article>
  );
}
