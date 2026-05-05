import { Link } from "react-router-dom";
import { TextUsLink } from "./PhoneReveal";
import { useAuth } from "../context/AuthContext";

export function BrandMark() {
  return (
    <span className="brand" aria-label="Nanowork">
      <img
        className="brand__logo"
        src="/logo.png"
        alt=""
        width={28}
        height={28}
        aria-hidden
      />
      <span className="brand__word">Nanowork</span>
    </span>
  );
}

type TopNavProps = {
  /**
   * When true, renders anchor-style hash links (for the home page).
   * When false, prefixes hash links with "/" so they navigate home first.
   */
  onHome?: boolean;
};

export function TopNav({ onHome = false }: TopNavProps) {
  const href = (hash: string) => (onHome ? hash : `/${hash}`);
  const { isAuthenticated } = useAuth();
  return (
    <header className="site-nav">
      <Link
        to={onHome ? "/#top" : "/"}
        className="site-nav__brand"
        aria-label="Nanowork home"
      >
        <BrandMark />
      </Link>
      <nav className="site-nav__links" aria-label="Primary">
        <a href={href("#not-a-tool")}>Not this</a>
        <a href={href("#company")}>Company</a>
        <a href={href("#pricing")}>Pricing</a>
        <a href={href("#faq")}>FAQ</a>
        <Link to="/changelog">Changelog</Link>
      </nav>
      <div className="site-nav__right">
        {!isAuthenticated && (
          <Link to="/login" className="site-nav__login">
            Log in
          </Link>
        )}
        {isAuthenticated ? (
          <Link to="/dashboard" className="site-nav__cta">
            <span className="status-dot" aria-hidden />
            Dashboard
          </Link>
        ) : (
          <TextUsLink className="site-nav__cta">
            <span className="status-dot" aria-hidden />
            Text us
          </TextUsLink>
        )}
      </div>
    </header>
  );
}

export function SiteFooter({ onHome = false }: TopNavProps) {
  const href = (hash: string) => (onHome ? hash : `/${hash}`);
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <BrandMark />
          <p className="footer__tag">
            One prompt spawns a revenue-ready company — legal, brand, web, GTM, sales, finance, and
            ops, run in parallel by AI agents.
          </p>
        </div>
        <div className="footer__cols">
          <div className="footer__col">
            <p className="footer__heading">Company</p>
            <ul>
              <li>
                <a href={href("#not-a-tool")}>What it&apos;s not</a>
              </li>
              <li>
                <a href={href("#company")}>Full company</a>
              </li>
              <li>
                <a href={href("#how-it-works")}>How it works</a>
              </li>
              <li>
                <a href={href("#pricing")}>Pricing</a>
              </li>
              <li>
                <a href={href("#philosophy")}>Why Nanowork</a>
              </li>
              <li>
                <Link to="/changelog">Changelog</Link>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <p className="footer__heading">Contact</p>
            <ul>
              <li>
                <TextUsLink>Text us</TextUsLink>
              </li>
              <li>
                <a
                  href="https://x.com/nanoworkai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/nanowork/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© {year} Nanowork, Inc. All rights reserved.</span>
        <span className="footer__made">Made with care in California.</span>
      </div>
    </footer>
  );
}
