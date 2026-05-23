"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Briefcase, Calendar, FileText, Home, BrainCircuit } from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Applications", href: "/applications", icon: Briefcase },
    { name: "Interviews", href: "/interviews", icon: Calendar },
    { name: "Resumes", href: "/resumes", icon: FileText },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 border-r bg-muted/30 min-h-screen flex flex-col">
            <div className="h-14 flex items-center px-6 border-b">
                <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
                <span className="font-semibold tracking-tight">Job Search OS</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="mr-3 h-4 w-4" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}