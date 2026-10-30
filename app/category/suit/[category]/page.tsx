import { Suspense } from "react";
import type { Metadata } from "next";
import CategoryComingSoon from "../../CategoryComingSoon";

export const metadata: Metadata = {
  title: "Suits | Soni Saree Showroom",
  description: "Our suit collection is coming soon.",
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
  return <CategoryComingSoon categoryName={formatCategory(category)} collectionName="suits" />;
}

export default function SuitCategoryPage({ params }: Props) {
  return (
    <Suspense fallback={<CategoryComingSoon categoryName="Suits" collectionName="suits" />}>
      <SuitCategoryContent params={params} />
    </Suspense>
  );
}
