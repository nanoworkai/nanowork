/** Nanowork SMS / iMessage line — E.164 for sms: links; display for humans. */
const NANOWORK_SMS_E164 = "+16506740193";
const NANOWORK_SMS_DISPLAY = "(650) 674-0193";
const NANOWORK_SMS_HREF = `sms:${NANOWORK_SMS_E164}`;

export default function Home() {
  return (
    <>
      <div className="page page--simple">
        <main className="simple-main">
          <span className="platform-pill">
            <span className="status-dot" aria-hidden />
            In early beta
          </span>
          <h1 className="simple-headline">from idea to revenue</h1>
          <p className="simple-subhead">
            We’re the fastest way for people to build and explore ideas—without
            the capital cost of a typical startup. It all happens inside your
            phone.
          </p>
          <div className="text-us">
            <p className="text-us__lead">iMessage or SMS.</p>
            <a
              className="text-us__number"
              href={NANOWORK_SMS_HREF}
              aria-label={`Text Nanowork at ${NANOWORK_SMS_DISPLAY}`}
            >
              {NANOWORK_SMS_DISPLAY}
            </a>
            <p className="text-us__note">Tap to chat.</p>
          </div>
        </main>
      </div>

      <footer className="site-footer">
        <span className="site-footer__copy">Nanowork, Inc 2026</span>
        <span className="site-footer__sep" aria-hidden>
          ·
        </span>
        <a
          className="site-footer__link"
          href="https://x.com/nanoworkai"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twitter
        </a>
        <span className="site-footer__sep" aria-hidden>
          ·
        </span>
        <a
          className="site-footer__link"
          href="https://www.linkedin.com/company/nanowork/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <span className="site-footer__sep" aria-hidden>
          ·
        </span>
        <a
          className="site-footer__link"
          href={NANOWORK_SMS_HREF}
          aria-label={`Text Nanowork at ${NANOWORK_SMS_DISPLAY}`}
        >
          Text us
        </a>
      </footer>
    </>
  );
}

