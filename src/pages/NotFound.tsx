import { Link } from "react-router-dom";

const NANOWORK_SMS_E164 = "+16506740193";
const NANOWORK_SMS_DISPLAY = "(650) 674-0193";
const NANOWORK_SMS_HREF = `sms:${NANOWORK_SMS_E164}`;

function BrandMark() {
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

function TopNav() {
  return (
    <header className="site-nav">
      <Link to="/" className="site-nav__brand" aria-label="Nanowork home">
        <BrandMark />
      </Link>
      <nav className="site-nav__links" aria-label="Primary">
        <Link to="/#how-it-works">Process</Link>
        <Link to="/#build">Ideas</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/#agents">API</Link>
        <Link to="/changelog">Changelog</Link>
        <Link to="/#faq">FAQ</Link>
      </nav>
      <a className="site-nav__cta" href={NANOWORK_SMS_HREF}>
        <span className="status-dot" aria-hidden />
        Text us
      </a>
    </header>
  );
}

function SiteFooter() {
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
                <Link to="/#how-it-works">How it works</Link>
              </li>
              <li>
                <Link to="/#build">What you can build</Link>
              </li>
              <li>
                <Link to="/gallery">Gallery</Link>
              </li>
              <li>
                <Link to="/#agents">API &amp; agents</Link>
              </li>
              <li>
                <Link to="/changelog">Changelog</Link>
              </li>
              <li>
                <Link to="/#faq">FAQ</Link>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <p className="footer__heading">Contact</p>
            <ul>
              <li>
                <a href={NANOWORK_SMS_HREF}>Text {NANOWORK_SMS_DISPLAY}</a>
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

export default function NotFound() {
  return (
    <>
      <TopNav />
      <main className="page page--pro page--notfound">
        <section className="notfound">
          <div className="notfound__inner">
            <span className="platform-pill">
              <span className="status-dot" aria-hidden />
              404 · Page not found
            </span>
            <p className="notfound__code" aria-hidden>
              404
            </p>
            <h1 className="display-headline notfound__title">
              That page{" "}
              <span className="display-headline__accent">wandered off.</span>
            </h1>
            <p className="lede notfound__lede">
              The link you followed is broken, or the page has moved. No harm
              done — head home, browse what we&rsquo;ve shipped, or text us and
              we&rsquo;ll point you the right way.
            </p>
            <div className="notfound__cta-row">
              <Link className="btn btn--primary" to="/">
                <span aria-hidden className="btn__icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12l9-9 9 9" />
                    <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
                  </svg>
                </span>
                Take me home
              </Link>
              <a className="btn btn--ghost" href={NANOWORK_SMS_HREF}>
                Text {NANOWORK_SMS_DISPLAY}
              </a>
            </div>
            <ul className="notfound__links" aria-label="Popular destinations">
              <li>
                <Link to="/gallery">Gallery</Link>
                <span>See what we&rsquo;ve built with founders.</span>
              </li>
              <li>
                <Link to="/changelog">Changelog</Link>
                <span>A running list of everything new.</span>
              </li>
              <li>
                <Link to="/#agents">API &amp; agents</Link>
                <span>The models behind Nanowork, over HTTP.</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
