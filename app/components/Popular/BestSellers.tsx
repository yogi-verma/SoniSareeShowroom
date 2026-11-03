"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../Auth/AuthProvider";
import { addCartItem } from "../../lib/cartApi";
import { openProductCheckout } from "../../lib/paymentApi";
import { useStockRefresh } from "../../lib/useStockRefresh";
import ProductCard from "../ProductCard";

type Product = {
  _id: string;
  productType: "saree";
  category: string;
  name: string;
  price: number;
  stock: number;
  photo: { url: string };
};

let sareesRequest: Promise<Product[]> | null = null;

function fetchSarees() {
  if (sareesRequest) return sareesRequest;

  const request = fetch("/api/catalog/products?productType=saree", {
    cache: "no-store",
  }).then(async (response) => {
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Could not load sarees.");
    return (result.products ?? []) as Product[];
  });

  sareesRequest = request;
  void request.then(
    () => {
      if (sareesRequest === request) sareesRequest = null;
    },
    () => {
      if (sareesRequest === request) sareesRequest = null;
    },
  );

  return request;
}

export default function BestSellers() {
  const { user, openSignIn } = useAuth();
  const rail = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [checkoutProductId, setCheckoutProductId] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    const result = await fetchSarees();
    setProducts(result);
  }, []);

  useStockRefresh(refreshProducts);

  useEffect(() => {
    if (!message) return;
    const timeoutId = window.setTimeout(() => setMessage(""), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  async function requestShoppingAction(product: Product) {
    if (!user) {
      openSignIn();
      return;
    }
    setCheckoutProductId(product._id);
    setMessage("");
    try {
      await openProductCheckout(product._id, { name: user.name, email: user.email }, {
        onVerified: (status) => setMessage(status === "paid" ? `Paid · ${product.name} should arrive within 10 days.` : "Payment authorized and awaiting confirmation."),
        onFailure: setMessage,
        onDismiss: () => setMessage("Checkout was closed. No payment was confirmed."),
      });
    } catch (checkoutError) {
      setMessage(checkoutError instanceof Error ? checkoutError.message : "Could not start checkout.");
    } finally {
      setCheckoutProductId(null);
    }
  }

  async function handleAddToCart(product: Product) {
    if (!user) {
      openSignIn();
      return;
    }
    setAddingProductId(product._id);
    try {
      const result = await addCartItem(product._id);
      setMessage(`${product.name} added to your cart · ${result.cart.totalItems} item${result.cart.totalItems === 1 ? "" : "s"} total`);
    } catch (addError) {
      setMessage(addError instanceof Error ? addError.message : "Could not add this item to your cart.");
    } finally {
      setAddingProductId(null);
    }
  }

  useEffect(() => {
    let isActive = true;

    fetchSarees()
      .then((result) => {
        if (isActive) setProducts(result);
      })
      .catch((loadError: unknown) => {
        if (!isActive) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load sarees.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const scrollCards = (direction: -1 | 1) => {
    const element = rail.current;
    const card = element?.querySelector<HTMLElement>("[data-product-card]");
    if (!element || !card) return;

    const gap = Number.parseFloat(window.getComputedStyle(element).columnGap) || 0;
    element.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: "smooth",
    });
  };

  return (
    <section id="shop" className="mx-auto max-w-6xl px-[5%] pb-3 pt-2 md:px-0 md:pb-3">
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-4">
        <div>
          <span className="text-[9px] font-bold tracking-[0.24em] text-[#986d8f]">
            BEST SELLERS
          </span>
          <h2 className="mt-2 font-serif text-2xl leading-tight sm:text-2xl">
            Loved by Many
          </h2>
        </div>
        <div className="mb-1 flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Scroll to previous sarees"
            onClick={() => scrollCards(-1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#d9cbd4] text-[#503b4f] transition hover:border-plum hover:bg-plum hover:text-white"
          >
            <FiArrowLeft aria-hidden="true" size={16} />
          </button>
          <button
            type="button"
            aria-label="Scroll to more sarees"
            onClick={() => scrollCards(1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#d9cbd4] text-[#503b4f] transition hover:border-plum hover:bg-plum hover:text-white"
          >
            <FiArrowRight aria-hidden="true" size={16} />
          </button>
        </div>
      </div>

      <div
        ref={rail}
        aria-label="Saree collection"
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
      >
        {isLoading ? (
          Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="w-[76%] min-w-[230px] shrink-0 overflow-hidden rounded-sm border border-[#eadfd8] bg-[#fffdfa] sm:w-[47%] md:w-[31%] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]">
              <div className="aspect-[4/4.8] animate-pulse bg-[#eee6e0]" />
              <div className="space-y-2 p-4"><div className="h-3 w-3/4 animate-pulse bg-[#eee6e0]" /><div className="h-3 w-1/2 animate-pulse bg-[#f3efeb]" /></div>
            </div>
          ))
        ) : error ? (
          <p role="alert" className="py-8 text-sm text-[#a13d39]">{error}</p>
        ) : products.length === 0 ? (
          <p className="py-8 text-sm text-muted">No sarees are available right now.</p>
        ) : products.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            variant="featured"
            index={index}
            total={products.length}
            onBuy={() => void requestShoppingAction(product)}
            onAddToCart={() => void handleAddToCart(product)}
            buying={checkoutProductId === product._id}
            adding={addingProductId === product._id}
            addLabel="Add to Cart"
            buyLabel="Buy Now"
          />
        ))}
      </div>
      <div aria-live="polite" className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#30172f] px-5 py-3 text-center text-[11px] text-white shadow-xl transition-all ${message ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>{message}</div>
    </section>
  );
}
