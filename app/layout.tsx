import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soni Saree Showroom | The Art of Indian Elegance",
  description: "Discover beautiful sarees and Indian occasion wear, thoughtfully chosen for every story.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
