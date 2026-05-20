import { useParams, useNavigate } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";

export default function ClaimPreview() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  return (
    <div className="bg-background-DEFAULT min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent-blue mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-mono font-bold text-content-DEFAULT mb-4">
          Company Preview
        </h1>
        <p className="text-sm font-mono text-content-subtle mb-8">
          Review company details before claiming
        </p>
        <button
          onClick={() => navigate(`/claim/${companyId}/payment`)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent-blue text-white font-mono text-sm font-bold rounded-lg hover:bg-accent-blue/90 transition-colors"
        >
          Proceed to Payment
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
