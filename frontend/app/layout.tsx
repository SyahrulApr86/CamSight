import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CamSight - Real-time Object Tracking",
  description:
    "Web-based real-time object tracking system using YOLO 12 nano for live object detection from camera.",
  keywords: [
    "object tracking",
    "YOLO",
    "computer vision",
    "real-time",
    "camera",
  ],
  authors: [{ name: "CamSight Team" }],
};

export const viewport: Viewport = {
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
      <body className={inter.className} suppressHydrationWarning={true}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-950">
          {children}
        </div>
      </body>
    </html>
  );
}
