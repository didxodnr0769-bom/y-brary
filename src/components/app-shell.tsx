import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { CloseIcon, MenuIcon, SearchIcon } from "@/components/ui-icons";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/projects", label: "프로젝트" },
  { href: "/books", label: "책" },
  { href: "/courses", label: "강의 기록" },
  { href: "/notes", label: "학습 정리" },
] as const;

function isActivePath(pathname: string, href: (typeof navItems)[number]["href"]) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SiteHeader({ pathname, onSearch }: { pathname: string; onSearch?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    navigation.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButton.current?.focus();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      {menuOpen ? (
        <button
          className="mobile-scrim"
          type="button"
          aria-label="내비게이션 닫기"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="brand" aria-label="YBrary" onClick={() => setMenuOpen(false)}>
            <strong><span className="brand-accent">Y</span>Brary</strong>
          </Link>
          <nav className="primary-nav" id="primary-navigation" ref={navigation} aria-label="주요 메뉴" data-open={menuOpen}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="nav-link"
                aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            {onSearch ? <button
              className="header-search-button"
              type="button"
              aria-label="기록 검색"
              onClick={() => {
                setMenuOpen(false);
                onSearch?.();
              }}
            >
              <SearchIcon />
            </button> : null}
            <ThemeToggle />
            <button
              className="menu-button"
              type="button"
              ref={menuButton}
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

function focusSearchField() {
  const field = document.querySelector<HTMLInputElement>('main input[type="search"]');
  if (!field) return false;
  field.focus();
  field.scrollIntoView?.({ block: "center" });
  return true;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isGraphHome = location.pathname === "/";
  const navigate = useNavigate();
  const pendingSearchFocus = useRef(false);

  useEffect(() => {
    if (pendingSearchFocus.current && focusSearchField()) pendingSearchFocus.current = false;
  }, [location.key]);

  function searchRecords() {
    if (focusSearchField()) return;
    pendingSearchFocus.current = true;
    const collection = navItems.find((item) => item.href !== "/" && isActivePath(location.pathname, item.href));
    navigate(collection?.href ?? "/projects");
  }

  return (
    <div className={`app-layout${isGraphHome ? " app-layout-graph" : ""}`}>
      <SiteHeader key={location.key} pathname={location.pathname} onSearch={location.pathname === "/" ? undefined : searchRecords} />
      <div className="main-area">
        <main className="content-container">{children}</main>
        {isGraphHome ? null : <SiteFooter />}
      </div>
    </div>
  );
}
