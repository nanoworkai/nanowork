import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getBusiness } from "../data/businesses";
import LaminaDemo from "../demos/LaminaDemo";
import OvenlyDemo from "../demos/OvenlyDemo";
import ParcelDemo from "../demos/ParcelDemo";
import FieldnoteDemo from "../demos/FieldnoteDemo";
import BenchDemo from "../demos/BenchDemo";
import StackviewDemo from "../demos/StackviewDemo";
import NightkeyDemo from "../demos/NightkeyDemo";
import PressroomDemo from "../demos/PressroomDemo";

export default function DemoPage() {
  const { slug } = useParams<{ slug: string }>();
  const business = slug ? getBusiness(slug) : undefined;

  useEffect(() => {
    if (business) {
      const prev = document.title;
      document.title = `${business.name} · Demo · Nanowork`;
      return () => {
        document.title = prev;
      };
    }
  }, [business]);

  if (!business) {
    return (
      <main className="demo-missing">
        <div className="demo-missing__inner">
          <p className="eyebrow">Demo not found</p>
          <h1>We don't have a demo for that slug yet.</h1>
          <p>
            It might have already sold, been pulled from the gallery, or never
            existed. Head back and take a look at what's live.
          </p>
          <Link className="btn btn--primary" to="/gallery">
            ← Back to the gallery
          </Link>
        </div>
      </main>
    );
  }

  switch (business.slug) {
    case "lamina":
      return <LaminaDemo business={business} />;
    case "ovenly":
      return <OvenlyDemo business={business} />;
    case "parcel":
      return <ParcelDemo business={business} />;
    case "fieldnote":
      return <FieldnoteDemo business={business} />;
    case "bench":
      return <BenchDemo business={business} />;
    case "stackview":
      return <StackviewDemo business={business} />;
    case "nightkey":
      return <NightkeyDemo business={business} />;
    case "pressroom":
      return <PressroomDemo business={business} />;
    default:
      return (
        <main className="demo-missing">
          <div className="demo-missing__inner">
            <p className="eyebrow">Demo</p>
            <h1>{business.name} demo coming soon.</h1>
            <Link className="btn btn--primary" to="/gallery">
              ← Back to the gallery
            </Link>
          </div>
        </main>
      );
  }
}
