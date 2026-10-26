import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { CloseIcon, MenuIcon } from "@/components/ui-icons";
import { assetUrl } from "@/lib/urls";

const navItems = [
  { href: "/", label: "프로젝트", glyph: "01" },
  { href: "/books", label: "책", glyph: "02" },
  { href: "/courses", label: "강의 기록", glyph: "03" },
  { href: "/notes", label: "학습 정리", glyph: "04" },
] as const;

function isActivePath(pathname: string, href: (typeof navItems)[number]["href"]) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/projects/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
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
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
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
                to={item.href}
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
          <Link to="/" className="mobile-brand">
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
        <footer className="site-footer">
          <a href={assetUrl("/notices/maplestory-font.txt")} target="_blank" rel="noreferrer">
            메이플스토리 서체 저작권 안내
          </a>
        </footer>
      </div>
    </div>
  );
}
