import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

// Inter is a highly legible font perfect for dense data grids
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Job Search OS",
    description: "Personal job search and interview management system",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
        {/* We force 'dark' class here for that sleek IDE look, you can remove it if you prefer light mode */}
        <body className={`${inter.className} flex h-screen overflow-hidden antialiased bg-background text-foreground`}>

        {/* Persistent Left Navigation */}
        <Sidebar />

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 flex flex-col overflow-y-auto">
            {/* Header area could go here later if needed */}
            <div className="flex-1 p-8">
                {children}
            </div>
        </main>

        </body>
        </html>
    );
}