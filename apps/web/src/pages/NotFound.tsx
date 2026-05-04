import { Link } from "react-router-dom";
import { SiteFooter, TopNav } from "../components/SiteChrome";
import { TextUsLink } from "../components/PhoneReveal";

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
              <TextUsLink className="btn btn--ghost">Text us</TextUsLink>
            </div>
            <ul className="notfound__links" aria-label="Popular destinations">
              <li>
                <Link to="/changelog">Changelog</Link>
                <span>A running list of everything new.</span>
              </li>
              <li>
                <Link to="/#pricing">Pricing</Link>
                <span>$99/mo — ship your idea with Nanowork.</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
