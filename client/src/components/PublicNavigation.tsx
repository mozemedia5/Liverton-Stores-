import React from "react";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";

export const PUBLIC_NAV_LINKS = [
  ["/", "Home"],
  ["/products", "Products"],
  ["/new-arrivals", "New Arrivals"],
  ["/innovation", "Innovation"],
  ["/support", "Support"],
  ["/about", "About"],
  ["/solutions", "Solutions"],
  ["/contact", "Contact"],
  ["/status", "Status"],
  ["/shop", "Shop"],
] as const;

function navigateToTop(onNavigate?: () => void) {
  onNavigate?.();
  window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

export function PublicNavigationMarkup({ mobile = false, location = "/", onNavigate }: { mobile?: boolean; location?: string; onNavigate?: () => void }) {
  return (
    <nav className={mobile ? "mobile-nav" : "desktop-nav"} aria-label={mobile ? "Mobile primary navigation" : "Primary navigation"}>
      {PUBLIC_NAV_LINKS.map(([href, label]) => {
        const active = href === "/" ? location === "/" : location.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={mobile ? undefined : active ? "nav-link active" : "nav-link"}
            aria-current={active ? "page" : undefined}
            onClick={() => navigateToTop(onNavigate)}
          >
            {label}
            {mobile && <ArrowRight size={16} />}
          </Link>
        );
      })}
    </nav>
  );
}

export function PublicNavigation({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [location] = useLocation();
  return <PublicNavigationMarkup mobile={mobile} location={location} onNavigate={onNavigate} />;
}
