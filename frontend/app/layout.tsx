import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CamSight - Real-time Object Tracking",
  description:
    "Sistem web real-time object tracking menggunakan YOLO 12 nano untuk deteksi objek secara langsung dari kamera.",
  keywords: [
    "object tracking",
    "YOLO",
    "computer vision",
    "real-time",
    "camera",
  ],
  authors: [{ name: "CamSight Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-950">
          {children}
        </div>
      </body>
    </html>
  );
}
