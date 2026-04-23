import { useEffect, useRef, type ReactNode, type MouseEvent } from "react";
import { MASKED_DISPLAY, usePhone } from "../context/PhoneContext";

/**
 * A link-shaped trigger that either opens the reveal modal OR, if the
 * number has already been revealed this session, behaves like a normal
 * `sms:` link. This lets us drop it in wherever "Text us" used to live.
 */
export function TextUsLink({
  className,
  children,
  label,
  bodyTemplate,
}: {
  className?: string;
  children?: ReactNode;
  label?: string;
  /** Optional prefilled SMS body once the number is revealed. */
  bodyTemplate?: string;
}) {
  const { status, number, openReveal } = usePhone();
  const revealed = status === "revealed" && number;

  const href = revealed
    ? bodyTemplate
      ? `${number.href}&body=${encodeURIComponent(bodyTemplate)}`
      : number.href
    : "#text-us";

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (revealed) return;
    e.preventDefault();
    openReveal();
  };

  const visibleLabel =
    children ??
    label ??
    (revealed ? `Text ${number.display}` : "Text us");

  return (
    <a
      className={className}
      href={href}
      onClick={onClick}
      aria-haspopup={revealed ? undefined : "dialog"}
      data-phone-state={status}
    >
      {visibleLabel}
    </a>
  );
}

/**
 * A large display of the phone number — masked until reveal, then a live
 * `sms:` link. Used in hero / closing CTAs.
 */
export function PhoneDisplay({
  className,
  ariaLabel,
}: {
  className?: string;
  ariaLabel?: string;
}) {
  const { status, number, openReveal } = usePhone();
  const revealed = status === "revealed" && number;

  if (revealed) {
    return (
      <a
        className={className}
        href={number.href}
        aria-label={
          ariaLabel ?? `Text Nanowork at ${number.display}`
        }
      >
        {number.display}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={`${className ?? ""} phone-masked`.trim()}
      onClick={openReveal}
      aria-haspopup="dialog"
      aria-label="Choose your region to reveal the Nanowork phone number"
    >
      <span aria-hidden>{MASKED_DISPLAY}</span>
      <span className="phone-masked__hint">Tap to reveal</span>
    </button>
  );
}

/** The modal UI. Rendered once at the app root. */
export function PhoneRevealModal() {
  const {
    isModalOpen,
    closeReveal,
    regions,
    selectedRegion,
    selectRegion,
    reset,
    status,
    number,
    detectedCountry,
    message,
  } = usePhone();

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFocusable = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFocusable.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const loading = status === "loading_regions" || status === "resolving";

  return (
    <div
      className="phone-modal"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeReveal();
      }}
    >
      <div
        className="phone-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="phone-modal-title"
        ref={dialogRef}
      >
        <header className="phone-modal__head">
          <span className="platform-pill">
            <span className="status-dot" aria-hidden />
            Region-gated line
          </span>
          <h2 className="phone-modal__title" id="phone-modal-title">
            {status === "revealed" && number
              ? "Your Nanowork line is ready."
              : "Pick your region to text us."}
          </h2>
          <p className="phone-modal__lede">
            {status === "revealed" && number
              ? "We verified your region. This number is yours for this browser — we'll keep it revealed for the rest of this session."
              : "Nanowork runs regional lines. We verify your connection before handing out a number, so each region only ever sees its own."}
          </p>
          <button
            type="button"
            className="phone-modal__close"
            onClick={closeReveal}
            aria-label="Close"
            ref={firstFocusable}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="phone-modal__body">
          {status === "revealed" && number ? (
            <RevealedPane
              display={number.display}
              href={number.href}
              regionLabel={
                regions.find((r) => r.code === selectedRegion)?.label ?? null
              }
              onReset={reset}
            />
          ) : (
            <RegionPicker
              regions={regions}
              selectedRegion={selectedRegion}
              onSelect={(code) => {
                if (!loading) void selectRegion(code);
              }}
              loading={loading}
              status={status}
              message={message}
              detectedCountry={detectedCountry}
              onRetry={() => {
                if (selectedRegion) void selectRegion(selectedRegion);
              }}
            />
          )}
        </div>

        <footer className="phone-modal__foot">
          <span>
            We never expose the number in the page source — it only loads
            after your region is verified.
          </span>
        </footer>
      </div>
    </div>
  );
}

function RegionPicker({
  regions,
  selectedRegion,
  onSelect,
  loading,
  status,
  message,
  detectedCountry,
  onRetry,
}: {
  regions: { code: string; label: string; available: boolean }[];
  selectedRegion: string | null;
  onSelect: (code: string) => void;
  loading: boolean;
  status: string;
  message: string | null;
  detectedCountry: string | null;
  onRetry: () => void;
}) {
  if (status === "loading_regions" || (regions.length === 0 && loading)) {
    return <p className="phone-modal__muted">Loading regions…</p>;
  }

  if (regions.length === 0 && status === "regions_error") {
    return (
      <div className="phone-modal__error">
        <p>{message ?? "Couldn't load regions."}</p>
      </div>
    );
  }

  return (
    <>
      <ul className="phone-regions" aria-label="Select your region">
        {regions.map((r) => {
          const isSelected = selectedRegion === r.code;
          const disabled = loading;
          return (
            <li key={r.code}>
              <button
                type="button"
                className={`phone-region ${
                  isSelected ? "is-selected" : ""
                } ${r.available ? "" : "is-waitlist"}`}
                onClick={() => onSelect(r.code)}
                disabled={disabled}
                aria-pressed={isSelected}
              >
                <span className="phone-region__label">{r.label}</span>
                <span className="phone-region__state">
                  {r.available ? "Available" : "Coming soon"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {status === "resolving" && (
        <p className="phone-modal__muted">Verifying your connection…</p>
      )}

      {(status === "region_mismatch" ||
        status === "coming_soon" ||
        status === "error") &&
        message && (
          <div className="phone-modal__notice" role="status">
            <p>{message}</p>
            {status === "region_mismatch" && detectedCountry && (
              <p className="phone-modal__muted">
                Detected country: <code>{detectedCountry}</code>
              </p>
            )}
            {status !== "coming_soon" && selectedRegion && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={onRetry}
                disabled={loading}
              >
                Try again
              </button>
            )}
          </div>
        )}
    </>
  );
}

function RevealedPane({
  display,
  href,
  regionLabel,
  onReset,
}: {
  display: string;
  href: string;
  regionLabel: string | null;
  onReset: () => void;
}) {
  return (
    <div className="phone-revealed">
      {regionLabel && (
        <p className="phone-revealed__region">
          <span className="status-dot" aria-hidden /> {regionLabel} · verified
        </p>
      )}
      <a className="phone-revealed__number" href={href}>
        {display}
      </a>
      <p className="phone-revealed__hint">iMessage or SMS · tap to open</p>
      <div className="phone-revealed__row">
        <a className="btn btn--primary" href={href}>
          Text {display}
        </a>
        <button className="btn btn--ghost" type="button" onClick={onReset}>
          Change region
        </button>
      </div>
    </div>
  );
}
