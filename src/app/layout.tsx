import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LangSync — 10-Star Experience Platform",
  description: "Three AI models. Three strategic lenses. Ideas from delightful to transformative.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-ls-text antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
