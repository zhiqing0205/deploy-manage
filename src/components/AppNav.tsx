"use client";

import { Boxes, Globe, LayoutDashboard, Server, Settings } from "lucide-react";

import { NavLink } from "@/components/NavLink";

const navItems = [
  { href: "/", label: "概览", icon: LayoutDashboard },
  { href: "/services", label: "应用", icon: Boxes },
  { href: "/servers", label: "服务器", icon: Server },
  { href: "/domains", label: "域名", icon: Globe },
  { href: "/settings", label: "设置", icon: Settings },
];

export function AppNav() {
  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => (
        <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
      ))}
    </nav>
  );
}

