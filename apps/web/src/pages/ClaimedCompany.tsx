import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Package,
  Sparkles,
  Terminal,
  ArrowRight,
  Link as LinkIcon,
  Book,
  Palette,
  ImageIcon,
} from "lucide-react";

interface CompanyAsset {
  id: string;
  name: string;
  type: "logo" | "brand-guidelines" | "marketing" | "documentation" | "other";
  url: string;
  size?: string;
}

interface Company {
  id: string;
  name: string;
  tagline: string;
  domain?: string;
  landingPageUrl: string;
  claimedAt: string;
  assets: CompanyAsset[];
}

export default function ClaimedCompany() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadCompany();
  }, [companyId]);

  async function loadCompany() {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? ""}/api/claimed-company/${companyId}`
      );

      if (!response.ok) {
        throw new Error("Company not found");
      }

      const data = await response.json();
      setCompany(data);
    } catch (err) {
      // Mock data for development
      setCompany({
        id: companyId!,
        name: "Acme Corporation",
        tagline: "Building the future, one solution at a time",
        domain: "acme.com",
        landingPageUrl: `https://preview.nanowork.com/${companyId}`,
        claimedAt: new Date().toISOString(),
        assets: [
          {
            id: "1",
            name: "Primary Logo (SVG)",
            type: "logo",
            url: "/assets/logo.svg",
            size: "24 KB",
          },
          {
            id: "2",
            name: "Logo Pack (PNG, SVG, PDF)",
            type: "logo",
            url: "/assets/logo-pack.zip",
            size: "2.4 MB",
          },
          {
            id: "3",
            name: "Brand Guidelines",
            type: "brand-guidelines",
            url: "/assets/brand-guidelines.pdf",
            size: "1.8 MB",
          },
          {
            id: "4",
            name: "Color Palette & Typography",
            type: "brand-guidelines",
            url: "/assets/brand-colors.pdf",
            size: "450 KB",
          },
          {
            id: "5",
            name: "Social Media Templates",
            type: "marketing",
            url: "/assets/social-templates.zip",
            size: "5.2 MB",
          },
          {
            id: "6",
            name: "Email Signatures",
            type: "marketing",
            url: "/assets/email-signatures.zip",
            size: "180 KB",
          },
          {
            id: "7",
            name: "API Documentation",
            type: "documentation",
            url: "/docs/api",
            size: "View online",
          },
          {
            id: "8",
            name: "Setup Guide",
            type: "documentation",
            url: "/docs/setup",
            size: "View online",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  }

  function handleDownload(asset: CompanyAsset) {
    // Track download analytics
    console.log(`Downloading asset: ${asset.name}`);

    // Open download link
    window.open(asset.url, "_blank");
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "logo":
        return ImageIcon;
      case "brand-guidelines":
        return Palette;
      case "marketing":
        return Package;
      case "documentation":
        return Book;
      default:
        return FileText;
    }
  };

  const groupedAssets = company?.assets.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = [];
    }
    acc[asset.type].push(asset);
    return acc;
  }, {} as Record<string, CompanyAsset[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-border-DEFAULT border-t-accent-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-content-secondary">LOADING YOUR COMPANY...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-sm font-mono text-accent-danger mb-4">
            {error || "COMPANY NOT FOUND"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-xs font-mono text-content-secondary hover:text-content-primary transition-colors"
          >
            ← BACK TO HOME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-content-primary">
      {/* Header */}
      <div className="border-b border-border-DEFAULT bg-background-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 border-2 border-accent-primary flex items-center justify-center flex-shrink-0">
                <Terminal className="w-7 h-7 text-accent-primary stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-mono font-bold">
                    {company.name}
                  </h1>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-success/10 border border-accent-success/20 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-success" />
                    <span className="text-xs font-mono text-accent-success font-bold">
                      CLAIMED
                    </span>
                  </div>
                </div>
                <p className="text-sm font-mono text-content-secondary mb-2">
                  {company.tagline}
                </p>
                {company.domain && (
                  <div className="flex items-center gap-2 text-xs font-mono text-content-tertiary">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{company.domain}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-accent-primary text-white font-mono text-sm font-bold rounded-md hover:bg-accent-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              GO TO DASHBOARD
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 p-6 sm:p-8 border border-accent-success/20 bg-gradient-to-r from-accent-success/5 to-accent-success/10 rounded-xl">
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-accent-success flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-mono font-bold text-content-primary mb-2">
                Your Company is Ready!
              </h2>
              <p className="text-sm font-mono text-content-secondary mb-6 leading-relaxed">
                Congratulations on claiming {company.name}. All your assets and resources are
                ready to download below. We've also sent a confirmation email with next steps.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0" />
                  <span className="text-xs font-mono text-content-secondary">
                    Landing page live
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0" />
                  <span className="text-xs font-mono text-content-secondary">
                    Assets ready to download
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0" />
                  <span className="text-xs font-mono text-content-secondary">
                    Dashboard access granted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Preview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Landing Page Preview */}
            <div className="border border-border-DEFAULT bg-background-elevated rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-mono font-bold text-content-primary">
                  Live Landing Page
                </h3>
                <a
                  href={company.landingPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-accent-primary hover:text-accent-primary/80 transition-colors flex items-center gap-1.5 font-bold"
                >
                  OPEN IN NEW TAB
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="bg-background-subtle rounded-lg overflow-hidden border border-border-DEFAULT">
                <div className="bg-background-subtle border-b border-border-DEFAULT px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-danger/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-warning/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-success/40" />
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="text-xs font-mono text-content-tertiary bg-background rounded px-2 py-1 inline-block">
                      {company.landingPageUrl}
                    </div>
                  </div>
                </div>
                <div className="aspect-video bg-background-subtle relative">
                  <iframe
                    src={company.landingPageUrl}
                    className="w-full h-full"
                    title="Landing Page Preview"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-subtle/50 to-transparent pointer-events-none" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-content-tertiary" />
                <input
                  type="text"
                  value={company.landingPageUrl}
                  readOnly
                  className="flex-1 text-xs font-mono text-content-secondary bg-background-subtle border border-border-DEFAULT rounded px-3 py-2"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={() => copyToClipboard(company.landingPageUrl, "landing-url")}
                  className="px-4 py-2 text-xs font-mono font-bold text-content-primary bg-background-subtle hover:bg-background-subtle/80 border border-border-DEFAULT rounded transition-colors"
                >
                  {copiedId === "landing-url" ? "COPIED!" : "COPY"}
                </button>
              </div>
            </div>

            {/* Assets Grid */}
            <div className="border border-border-DEFAULT bg-background-elevated rounded-xl p-6">
              <h3 className="text-lg font-mono font-bold text-content-primary mb-6">
                Your Assets
              </h3>

              <div className="space-y-6">
                {groupedAssets &&
                  Object.entries(groupedAssets).map(([type, assets]) => {
                    const Icon = getAssetIcon(type);
                    const typeLabel = type
                      .split("-")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ");

                    return (
                      <div key={type}>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="w-4 h-4 text-content-tertiary" />
                          <h4 className="text-sm font-mono font-bold text-content-primary">
                            {typeLabel}
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {assets.map((asset) => (
                            <div
                              key={asset.id}
                              className="flex items-center justify-between p-3 bg-background-subtle hover:bg-background-subtle/80 border border-border-DEFAULT rounded-lg transition-colors group"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-mono text-content-primary font-medium truncate">
                                  {asset.name}
                                </p>
                                {asset.size && (
                                  <p className="text-xs font-mono text-content-tertiary mt-0.5">
                                    {asset.size}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDownload(asset)}
                                className="ml-4 px-3 py-1.5 text-xs font-mono font-bold text-accent-primary hover:text-accent-primary/80 transition-colors flex items-center gap-1.5 opacity-80 group-hover:opacity-100"
                              >
                                {asset.type === "documentation" ? (
                                  <>
                                    VIEW
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </>
                                ) : (
                                  <>
                                    DOWNLOAD
                                    <Download className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right Column - Setup & Info */}
          <div className="space-y-6">
            {/* Quick Setup */}
            <div className="border border-border-DEFAULT bg-background-elevated rounded-xl p-6">
              <h3 className="text-lg font-mono font-bold text-content-primary mb-4">
                Quick Setup
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-success/10 border border-accent-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-mono font-bold text-content-primary mb-1">
                      Company Claimed
                    </p>
                    <p className="text-xs font-mono text-content-secondary">
                      You've successfully claimed your company
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-background-subtle border border-border-DEFAULT flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-mono font-bold text-content-secondary">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-mono font-bold text-content-primary mb-1">
                      Connect Your Domain
                    </p>
                    <p className="text-xs font-mono text-content-secondary mb-2">
                      Point your custom domain to your landing page
                    </p>
                    <button
                      onClick={() => navigate("/dashboard/settings")}
                      className="text-xs font-mono text-accent-primary hover:text-accent-primary/80 transition-colors font-bold"
                    >
                      SETUP DOMAIN →
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-background-subtle border border-border-DEFAULT flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-mono font-bold text-content-secondary">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-mono font-bold text-content-primary mb-1">
                      Customize & Launch
                    </p>
                    <p className="text-xs font-mono text-content-secondary mb-2">
                      Personalize your assets and go live
                    </p>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="text-xs font-mono text-accent-primary hover:text-accent-primary/80 transition-colors font-bold"
                    >
                      OPEN DASHBOARD →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Domain Connection */}
            <div className="border border-border-DEFAULT bg-background-elevated rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-content-tertiary" />
                <h3 className="text-lg font-mono font-bold text-content-primary">
                  Domain Setup
                </h3>
              </div>
              <p className="text-xs font-mono text-content-secondary mb-4 leading-relaxed">
                Connect your custom domain to make your landing page accessible at your own URL.
              </p>
              <div className="space-y-3">
                <div className="bg-background-subtle rounded-lg p-3 border border-border-DEFAULT">
                  <p className="text-xs font-mono text-content-tertiary mb-1">DNS CNAME Record</p>
                  <code className="text-xs font-mono text-content-primary">
                    cname.nanowork.com
                  </code>
                </div>
                <button
                  onClick={() => navigate("/dashboard/settings")}
                  className="w-full px-4 py-2 text-xs font-mono font-bold text-accent-primary bg-accent-primary/5 hover:bg-accent-primary/10 border border-accent-primary/20 rounded-md transition-colors"
                >
                  VIEW SETUP INSTRUCTIONS
                </button>
              </div>
            </div>

            {/* Documentation */}
            <div className="border border-border-DEFAULT bg-background-elevated rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Book className="w-5 h-5 text-content-tertiary" />
                <h3 className="text-lg font-mono font-bold text-content-primary">
                  Documentation
                </h3>
              </div>
              <div className="space-y-2">
                <a
                  href="/docs/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-background-subtle hover:bg-background-subtle/80 border border-border-DEFAULT rounded-lg transition-colors group"
                >
                  <span className="text-sm font-mono text-content-primary">Getting Started</span>
                  <ExternalLink className="w-3.5 h-3.5 text-content-tertiary group-hover:text-content-secondary transition-colors" />
                </a>
                <a
                  href="/docs/brand-guidelines"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-background-subtle hover:bg-background-subtle/80 border border-border-DEFAULT rounded-lg transition-colors group"
                >
                  <span className="text-sm font-mono text-content-primary">Brand Usage</span>
                  <ExternalLink className="w-3.5 h-3.5 text-content-tertiary group-hover:text-content-secondary transition-colors" />
                </a>
                <a
                  href="/docs/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-background-subtle hover:bg-background-subtle/80 border border-border-DEFAULT rounded-lg transition-colors group"
                >
                  <span className="text-sm font-mono text-content-primary">Support</span>
                  <ExternalLink className="w-3.5 h-3.5 text-content-tertiary group-hover:text-content-secondary transition-colors" />
                </a>
              </div>
            </div>

            {/* Need Help? */}
            <div className="border border-accent-primary/20 bg-accent-primary/5 rounded-xl p-6">
              <h3 className="text-sm font-mono font-bold text-content-primary mb-2">
                Need Help?
              </h3>
              <p className="text-xs font-mono text-content-secondary mb-4 leading-relaxed">
                Our team is here to help you get started. Reach out anytime.
              </p>
              <button
                onClick={() => navigate("/dashboard/inbox")}
                className="w-full px-4 py-2 text-xs font-mono font-bold text-white bg-accent-primary hover:bg-accent-primary/90 rounded-md transition-colors"
              >
                CONTACT SUPPORT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
