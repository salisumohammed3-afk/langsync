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
    <html lang="en" className="dark">
      <body className="bg-ls-dark text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
