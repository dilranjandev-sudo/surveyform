import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diagnostic Workflow Field Study",
  description:
    "A short, confidential field study for practising clinicians on the real diagnostic problems of everyday practice and the value of reliable same-visit diagnostics.",
};

export const viewport: Viewport = {
  themeColor: "#0e1714",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
