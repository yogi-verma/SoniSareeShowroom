import type { Metadata } from "next";
import { Suspense } from "react";
import CategoryProducts from "../../CategoryProducts";

export const metadata: Metadata = {
  title: "Suits | Soni Saree Showroom",
  description: "Browse suits and sets from Soni Saree Showroom.",
};

type Props = {
  params: Promise<{ category: string }>;
};

function formatCategory(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function SuitCategoryContent({ params }: Props) {
  const { category } = await params;
  return <CategoryProducts categoryName={formatCategory(category)} collectionName="suits" productType="shut" />;
}

export default function SuitCategoryPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf7f2]" aria-busy="true" />}>
      <SuitCategoryContent params={params} />
    </Suspense>
  );
}
