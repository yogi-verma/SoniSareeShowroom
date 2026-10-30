import { Suspense } from "react";
import type { Metadata } from "next";
import CategoryComingSoon from "../../CategoryComingSoon";

export const metadata: Metadata = {
  title: "Rajputi Poshak | Soni Saree Showroom",
  description: "Our Rajputi Poshak collection is coming soon.",
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

async function RajputiPoshakCategoryContent({ params }: Props) {
  const { category } = await params;
  return <CategoryComingSoon categoryName={formatCategory(category)} collectionName="Rajputi Poshak" />;
}

export default function RajputiPoshakCategoryPage({ params }: Props) {
  return (
    <Suspense fallback={<CategoryComingSoon categoryName="Rajputi Poshak" collectionName="Rajputi Poshak" />}>
      <RajputiPoshakCategoryContent params={params} />
    </Suspense>
  );
}
