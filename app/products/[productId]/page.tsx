import { Suspense } from "react";
import ProductDetail from "./ProductDetail";

type Props = {
  params: Promise<{ productId: string }>;
};

export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#faf7f2] text-sm text-[#684768]">Loading product…</main>}>
      {params.then(({ productId }) => <ProductDetail productId={productId} />)}
    </Suspense>
  );
}
