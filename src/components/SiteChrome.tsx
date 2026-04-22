import { Link } from "react-router-dom";
import { TextUsLink } from "./PhoneReveal";

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
        <a href={href("#how-it-works")}>Process</a>
        <a href={href("#build")}>Ideas</a>
        <a href={href("#agents")}>API</a>
        <a href={href("#philosophy")}>Why</a>
        <a href={href("#faq")}>FAQ</a>
        <Link to="/changelog">Changelog</Link>
      </nav>
      <TextUsLink className="site-nav__cta">
        <span className="status-dot" aria-hidden />
        Text us
      </TextUsLink>
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
            A new kind of company. Built inside your messages.
          </p>
        </div>
        <div className="footer__cols">
          <div className="footer__col">
            <p className="footer__heading">Company</p>
            <ul>
              <li>
                <a href={href("#how-it-works")}>How it works</a>
              </li>
              <li>
                <a href={href("#build")}>What you can build</a>
              </li>
              <li>
                <a href={href("#agents")}>API &amp; agents</a>
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
