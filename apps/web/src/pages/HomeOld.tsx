import { useEffect, useRef, useState, memo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Home.module.css";

// ── Data ──────────────────────────────────────────────────────────────────────

const TYPING_EXAMPLES = [
  "Premium leather goods DTC brand",
  "B2B software for construction teams",
  "Meal prep delivery service",
  "Digital marketing agency",
  "Online education platform",
  "Fitness coaching business",
];

// ── Real-time Metrics ─────────────────────────────────────────────────────────

function useCounter(initial: number, increment: number, interval: number = 2000) {
  const [value, setValue] = useState(initial);
  const incrementRef = useRef(increment);
  const intervalRef = useRef(interval);

  useEffect(() => {
    incrementRef.current = increment;
    intervalRef.current = interval;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setValue(v => v + Math.floor(Math.random() * incrementRef.current));
    }, intervalRef.current);
    return () => clearInterval(id);
  }, []);

  return value;
}

const MetricCard = memo(function MetricCard({
  label,
  value,
  suffix = "",
  prefix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{
        fontSize: '10px',
        fontWeight: 600,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '10px'
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: 600,
        color: '#0f172a',
        letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums'
      }}>
        {prefix}{value.toLocaleString()}{suffix}
      </div>
    </div>
  );
});

// @ts-expect-error - MetricsDashboard will be used in future
function MetricsDashboard() {
  const agentsWorking = useCounter(47328, 12, 2000);
  const cardsIssued = useCounter(34567, 8, 2200);
  const emailsSent = useCounter(1847293, 95, 1800);
  const revenue = useCounter(8234156, 6200, 2200);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '48px 48px',
      padding: '64px 0',
      borderTop: '1px solid #e2e8f0',
      borderBottom: '1px solid #e2e8f0'
    }}>
      <MetricCard label="Active Agents" value={agentsWorking} />
      <MetricCard label="Cards Issued" value={cardsIssued} />
      <MetricCard label="Emails Sent" value={emailsSent} />
      <MetricCard label="Revenue" value={revenue} prefix="$" />
    </div>
  );
}

// ── Prompt Input with Auto-typing ─────────────────────────────────────────────

function PromptInput() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-typing effect
  useEffect(() => {
    if (focused || value) return;

    const currentExample = TYPING_EXAMPLES[exampleIndex];

    if (!isDeleting && charIndex < currentExample.length) {
      const timeout = setTimeout(() => {
        setPlaceholder(currentExample.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 60);
      return () => clearTimeout(timeout);
    } else if (!isDeleting && charIndex === currentExample.length) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    } else if (isDeleting && charIndex > 0) {
      const timeout = setTimeout(() => {
        setPlaceholder(currentExample.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setExampleIndex((exampleIndex + 1) % TYPING_EXAMPLES.length);
    }
  }, [charIndex, isDeleting, exampleIndex, focused, value]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  function submit() {
    const text = value.trim();
    if (!text) return;
    setLoading(true);
    setTimeout(() => {
      if (isAuthenticated) navigate(`/dashboard?p=${encodeURIComponent(text)}`);
      else navigate(`/login?redirect=/dashboard&p=${encodeURIComponent(text)}`);
    }, 200);
  }

  // @ts-expect-error - samplePrompts will be used in future
  const samplePrompts = [
    "Premium leather goods DTC brand with Shopify store and email marketing",
    "B2B software for construction teams with demo videos and sales automation",
    "Meal prep delivery service with subscription model and local SEO",
    "Digital marketing agency specializing in e-commerce brands"
  ];

  return (
    <div className={styles.promptWrapper}>
      <div className={styles.promptContainer} style={{
        borderColor: focused ? '#0f172a' : '#e2e8f0'
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={loading}
          className={styles.promptTextarea}
        />
        {!value && !focused && (
          <div className={styles.promptPlaceholder}>
            {placeholder}
            <span className={styles.cursor} />
          </div>
        )}
        <button
          onClick={submit}
          disabled={loading || !value.trim()}
          className={styles.submitBtn}
        >
          {loading ? (
            <svg className={styles.spinner} width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          )}
        </button>
      </div>

      <div className={styles.trustIndicators}>
        <div className={styles.trustItem}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Bank-grade security
        </div>
        <div className={styles.divider} />
        <div className={styles.trustItem}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          FDIC insured
        </div>
        <div className={styles.divider} />
        <div className={styles.trustItem}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          Enterprise security
        </div>
      </div>
    </div>
  );
}

// ── Infrastructure Cards ──────────────────────────────────────────────────────

const InfrastructureCard = memo(function InfrastructureCard({
  type,
  title,
  description,
  visualComponent
}: {
  type: string;
  title: string;
  description: string;
  visualComponent: React.ReactNode;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardVisual}>
        {visualComponent}
      </div>
      <div className={styles.cardType}>{type}</div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDescription}>{description}</p>
    </div>
  );
});

// Visual component for payment card
const CardVisual = () => (
  <div className={styles.cardMockup}>
    <div className={styles.cardChip}>
      <div className={styles.chipGold} />
      <div className={styles.cardBrandInfo}>
        <h4>NANOWORK</h4>
        <p>AGENT CARD</p>
      </div>
    </div>
    <div className={styles.cardNumber}>
      •••• •••• •••• 4892
    </div>
    <div className={styles.cardFooter}>
      <div className={styles.cardDept}>
        <h5>DEPT</h5>
        <p>FINANCE</p>
      </div>
      <div className={styles.cardLogos}>
        <div className={styles.cardLogo} />
        <div className={styles.cardLogo} />
      </div>
    </div>
  </div>
);

// Visual component for email
const EmailVisual = () => (
  <div className={styles.emailMockup}>
    <div className={styles.emailHeader}>
      <div className={styles.emailAvatar}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <div className={styles.emailInfo}>
        <h4>finance@nanowork.ai</h4>
        <p>Department agent</p>
      </div>
    </div>

    <div className={styles.emailList}>
      <div className={styles.emailItem}>
        <div className={styles.emailDot} />
        <div className={styles.emailItemContent}>
          <h5>Vendor Payment Processed</h5>
          <p>Payment to Shopify confirmed...</p>
        </div>
      </div>
      <div className={`${styles.emailItem} ${styles.read}`}>
        <div className={styles.emailDot} />
        <div className={styles.emailItemContent}>
          <h5>Customer Invoice #1847</h5>
          <p>Invoice sent to customer...</p>
        </div>
      </div>
      <div className={`${styles.emailItem} ${styles.read}`}>
        <div className={styles.emailDot} />
        <div className={styles.emailItemContent}>
          <h5>Monthly Report Ready</h5>
          <p>Financial summary prepared...</p>
        </div>
      </div>
    </div>
  </div>
);

// Visual component for bank account
const BankAccountVisual = () => (
  <div className={styles.bankMockup}>
    <div className={styles.bankHeader}>
      <div className={styles.bankInfo}>
        <h4>NANOWORK FINANCE</h4>
        <p>Operating Account</p>
      </div>
      <div className={styles.bankIcon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      </div>
    </div>

    <div className={styles.bankBalance}>
      <h5>AVAILABLE BALANCE</h5>
      <p>$234,567</p>
    </div>

    <div className={styles.bankDetails}>
      <div className={styles.bankDetail}>
        <h6>ROUTING</h6>
        <p>021000021</p>
      </div>
      <div className={styles.bankDetail}>
        <h6>ACCOUNT</h6>
        <p>•••• 4892</p>
      </div>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.home}>

      {/* Nav */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="5" y="14" width="4" height="2" rx="0.5" fill="currentColor"/>
            </svg>
            Nanowork
          </Link>
          <nav className={styles.nav}>
            {isAuthenticated ? (
              <Link to="/dashboard" className={styles.btnPrimary}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className={styles.navLink}>
                  Sign in
                </Link>
                <Link to="/login" className={styles.btnPrimary}>
                  Start
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className={styles.main}>

        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Your AI company
          </h1>

          <p className={styles.heroSubtitle}>
            Not bots. Real agents with their own cards, emails, and bank accounts. Building your business 24/7.
          </p>

          <PromptInput />

          {/* Social Proof */}
          <div className={styles.socialProof}>
            <p className={styles.socialProofText}>Trusted by founders and enterprise teams building the future</p>
            <div className={styles.socialProofLogos}>
              <div className={styles.socialProofLogo}>Y Combinator</div>
              <div className={styles.socialProofLogo}>Sequoia</div>
              <div className={styles.socialProofLogo}>a16z</div>
              <div className={styles.socialProofLogo}>Stripe</div>
            </div>
          </div>
        </section>

        {/* What Makes This Real */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>
              Enterprise-Grade Infrastructure
            </div>
            <h2 className={styles.sectionTitle}>
              Real agents.<br />Real infrastructure.
            </h2>
            <p className={styles.sectionDescription}>
              Bank-grade security meets autonomous execution. Every agent operates with dedicated financial instruments, complete audit trails, and full regulatory compliance.
            </p>
          </div>

          <div className={styles.cardsGrid}>
            <InfrastructureCard
              type="Financial Infrastructure"
              title="Virtual payment cards"
              description="FDIC-insured virtual cards with granular spending controls, real-time transaction monitoring, and complete audit trails. Full PCI DSS compliance."
              visualComponent={<CardVisual />}
            />

            <InfrastructureCard
              type="Communication Layer"
              title="Dedicated email addresses"
              description="Professional email addresses with enterprise-grade security, automated inbox management, and encrypted storage. Full GDPR compliance."
              visualComponent={<EmailVisual />}
            />

            <InfrastructureCard
              type="Banking Operations"
              title="Department bank accounts"
              description="Separate FDIC-insured accounts with real-time balance tracking, automated reconciliation, and enterprise-grade security."
              visualComponent={<BankAccountVisual />}
            />
          </div>

        </section>

        {/* Trust & Security Section */}
        <section className={styles.trustSection}>
          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <h3 className={styles.trustTitle}>Bank-Grade Security</h3>
              <p className={styles.trustDescription}>
                256-bit encryption, enterprise-grade security, and continuous security monitoring protect your business 24/7.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h3 className={styles.trustTitle}>FDIC Insured</h3>
              <p className={styles.trustDescription}>
                All funds are held in FDIC-insured accounts up to $250,000 through our banking partners.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3 className={styles.trustTitle}>Full Compliance</h3>
              <p className={styles.trustDescription}>
                GDPR, PCI DSS, and SOX compliant with complete audit trails and automated reporting.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 className={styles.trustTitle}>24/7 Monitoring</h3>
              <p className={styles.trustDescription}>
                Real-time fraud detection, transaction monitoring, and instant alerts keep your business protected.
              </p>
            </div>
          </div>
        </section>

        {/* Journey: Idea → Revenue → Unicorn */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>
              Your path
            </div>
            <h2 className={styles.sectionTitle}>
              From idea to unicorn
            </h2>
            <p className={styles.sectionDescription}>
              We handle the entire journey. Not just the build. Not just the launch. Everything it takes to go from zero to billion-dollar valuation.
            </p>
          </div>

          <div className={styles.journeyList}>
            {/* Phase 1: Idea → Revenue */}
            <div className={`${styles.journeyItem} ${styles.featured}`}>
              <div className={styles.journeyNumber}>1</div>
              <div className={styles.journeyContent}>
                <h3 className={styles.journeyTitle}>Idea → Revenue</h3>
                <p className={styles.journeyDescription}>
                  The hardest part. Most founders spend 18+ months here. We do it in days. Legal entity, brand identity, production website, go-to-market strategy, first customers, and revenue flowing.
                </p>
                <div className={styles.journeyMilestones}>
                  <span>Day 1: Entity formed</span>
                  <span>Day 3: Website live</span>
                  <span>Week 1: First revenue</span>
                </div>
              </div>
            </div>

            {/* Phase 2: Revenue → Scale */}
            <div className={styles.journeyItem}>
              <div className={styles.journeyNumber}>2</div>
              <div className={styles.journeyContent}>
                <h3 className={styles.journeyTitle}>Revenue → Scale</h3>
                <p className={styles.journeyDescription}>
                  Agents optimize every channel. Email, paid acquisition, partnerships, sales outreach. They test, iterate, and scale what works. While you sleep, they're acquiring customers and generating revenue.
                </p>
                <div className={styles.journeyMilestones}>
                  <span>Month 3: $50K MRR</span>
                  <span>Month 6: $200K MRR</span>
                  <span>Month 12: $1M+ MRR</span>
                </div>
              </div>
            </div>

            {/* Phase 3: Scale → Unicorn */}
            <div className={styles.journeyItem}>
              <div className={styles.journeyNumber}>3</div>
              <div className={styles.journeyContent}>
                <h3 className={styles.journeyTitle}>Scale → Unicorn</h3>
                <p className={styles.journeyDescription}>
                  Your agents manage fundraising materials, investor relations, financial modeling, and operational excellence. They handle the complexity of hypergrowth while you focus on vision and strategy.
                </p>
                <div className={styles.journeyMilestones}>
                  <span>Year 2: Series A ready</span>
                  <span>Year 3: $50M ARR</span>
                  <span>Year 5: Unicorn trajectory</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supporting text */}
          <div className={styles.ownershipNote}>
            <p>
              <strong>You own everything.</strong> The entity, the brand, the customers, the revenue, the equity. Agents work for you, not the other way around. This is your company. They just run it better than humans could.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>
            Start your journey
          </h2>
          <p className={styles.ctaDescription}>
            From zero to revenue in days. From revenue to unicorn with agents that never stop working.
          </p>
          <Link to="/login" className={styles.ctaButton}>
            Get started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            {/* Brand Column */}
            <div className={styles.footerBrand}>
              <Link to="/" className={styles.footerLogo}>
                <svg className={styles.footerLogoIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="5" y="14" width="4" height="2" rx="0.5" fill="currentColor"/>
                </svg>
                Nanowork
              </Link>
              <p className={styles.footerTagline}>
                AI agents that build and run your entire business. From idea to revenue in days, not months.
              </p>
            </div>

            {/* Product Column */}
            <div className={styles.footerSection}>
              <h3 className={styles.footerHeading}>Product</h3>
              <ul className={styles.footerLinks}>
                <li><Link to="/revenue">Revenue</Link></li>
                <li><Link to="/swipe">Swipe</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><a href="#how-it-works">How it Works</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className={styles.footerSection}>
              <h3 className={styles.footerHeading}>Company</h3>
              <ul className={styles.footerLinks}>
                <li><a href="#about">About</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className={styles.footerSection}>
              <h3 className={styles.footerHeading}>Legal</h3>
              <ul className={styles.footerLinks}>
                <li><a href="#privacy">Privacy</a></li>
                <li><a href="#terms">Terms</a></li>
                <li><a href="#security">Security</a></li>
                <li><a href="#docs">Docs</a></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className={styles.footerBottom}>
            <div className={styles.footerCopyright}>
              <span>© {new Date().getFullYear()} Nanowork, Inc.</span>
              <span>All rights reserved.</span>
            </div>
            <div className={styles.footerSocial}>
              <a href="https://twitter.com/nanowork" target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink} aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://linkedin.com/company/nanowork" target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink} aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://github.com/nanowork" target="_blank" rel="noopener noreferrer" className={styles.footerSocialLink} aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
