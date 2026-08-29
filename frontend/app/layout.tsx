import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Plateful — Good food, second chance",
  description: "Discover great surplus food from local shops for less.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        {" "}
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
