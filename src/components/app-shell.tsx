"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { CloseIcon, MenuIcon } from "@/components/ui-icons";

const navItems = [
  { href: "/", label: "프로젝트", glyph: "01" },
  { href: "/books", label: "책", glyph: "02" },
  { href: "/films", label: "영화", glyph: "03" },
] as const;

function isActivePath(pathname: string, href: (typeof navItems)[number]["href"]) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/projects/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      {menuOpen ? (
        <button
          className="mobile-scrim"
          type="button"
          aria-label="메뉴 닫기"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside className="sidebar" id="primary-navigation" data-open={menuOpen}>
        <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            YB
          </span>
          <span className="brand-copy">
            <strong>YBrary</strong>
          </span>
        </Link>

        <button
          className="mobile-close"
          type="button"
          aria-label="메뉴 닫기"
          onClick={() => setMenuOpen(false)}
        >
          <CloseIcon />
        </button>

        <nav className="primary-nav" aria-label="주요 메뉴">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
                aria-current={active ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-glyph" aria-hidden="true">
                  {item.glyph}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <ThemeToggle />
        </div>
      </aside>

      <div className="main-area">
        <header className="mobile-header">
          <Link href="/" className="mobile-brand">
            YBrary
          </Link>
          <div className="mobile-actions">
            <ThemeToggle />
            <button
              className="menu-button"
              type="button"
              aria-label="메뉴 열기"
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
        </header>
        <main className="content-container">{children}</main>
      </div>
    </div>
  );
}
