import type { Metadata } from "next";
import CategoryProducts from "../../CategoryProducts";

export const metadata: Metadata = {
  title: "Rajputi Poshak | Soni Saree Showroom",
  description: "Browse traditional Rajputi Poshak from Soni Saree Showroom.",
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

export default async function RajputiPoshakCategoryPage({ params }: Props) {
  const { category } = await params;
  return <CategoryProducts categoryName={formatCategory(category)} collectionName="Rajputi Poshak" productType="rajputi poshak" />;
}
