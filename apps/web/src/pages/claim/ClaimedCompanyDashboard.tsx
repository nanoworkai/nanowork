import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Building2, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function ClaimedCompanyDashboard() {
  const { companyId } = useParams<{ companyId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const paymentSuccess = searchParams.get("payment") === "success";

  useEffect(() => {
    if (paymentSuccess) {
      setShowSuccess(true);
      // Clear success message after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess]);

  return (
    <div className="bg-background-DEFAULT min-h-screen p-6">
      {showSuccess && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-accent-green/10 border border-accent-green/20 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0" />
            <div>
              <p className="text-sm font-mono font-bold text-accent-green">
                Payment Successful!
              </p>
              <p className="text-xs font-mono text-content-subtle mt-1">
                Your company has been successfully claimed. Welcome to your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent-blue">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-mono font-bold text-content-DEFAULT">
              Company Dashboard
            </h1>
            <p className="text-sm font-mono text-content-subtle">
              Company ID: {companyId}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="border border-border-DEFAULT bg-background-elevated rounded-lg p-6">
            <h2 className="text-lg font-mono font-bold text-content-DEFAULT mb-4">
              Getting Started
            </h2>
            <p className="text-sm font-mono text-content-subtle mb-4">
              Welcome to your newly claimed company! Here are some next steps:
            </p>
            <ul className="space-y-2 text-sm font-mono text-content-DEFAULT">
              <li>• Complete your company profile</li>
              <li>• Set up your team members</li>
              <li>• Configure integrations</li>
              <li>• Explore analytics and reports</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-accent-blue text-white font-mono text-sm font-bold rounded-lg hover:bg-accent-blue/90 transition-colors"
            >
              Go to Main Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
