import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keora - Where Families Connect",
  description: "Build verified family trees, connect with relatives through mutual approval, and share your heritage seamlessly.",
  keywords: ["family tree", "genealogy", "family connections", "family history"],
  authors: [{ name: "Keora Team" }],
  openGraph: {
    title: "Keora - Where Families Connect",
    description: "Build verified family trees, connect with relatives through mutual approval, and share your heritage seamlessly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
