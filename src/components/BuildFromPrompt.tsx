import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBuiltAppState, saveBuiltApp } from "../built-app/derive";

const BUILD_STEPS = [
  "Parsing your spec and stack…",
  "Generating API routes and database schema…",
  "Wiring auth, env, and deploy config…",
  "Allocating a live workspace and opening your app…",
] as const;

export default function BuildFromPrompt() {
  const navigate = useNavigate();
  const didNavigate = useRef(false);
  const [phase, setPhase] = useState<"prompt" | "building">("prompt");
  const [prompt, setPrompt] = useState("");
  const [buildStep, setBuildStep] = useState(0);
  const [savedPrompt, setSavedPrompt] = useState("");

  const startBuild = useCallback(() => {
    if (!prompt.trim()) return;
    didNavigate.current = false;
    setSavedPrompt(prompt.trim());
    setPhase("building");
    setBuildStep(0);
  }, [prompt]);

  useEffect(() => {
    if (phase !== "building") return;
    if (buildStep >= BUILD_STEPS.length) {
      if (didNavigate.current) return;
      didNavigate.current = true;
      const state = createBuiltAppState(savedPrompt);
      saveBuiltApp(state);
      navigate("/app", { replace: true });
      return;
    }
    const t = setTimeout(
      () => setBuildStep((s) => s + 1),
      buildStep === 0 ? 500 : 750,
    );
    return () => clearTimeout(t);
  }, [phase, buildStep, savedPrompt, navigate]);

  return (
    <section className="app-studio" id="top" aria-labelledby="app-studio-heading">
      <div className="app-studio__inner">
        <div className="app-studio__head">
          <span className="app-studio__eyebrow">Full-stack from one prompt</span>
          <h1 className="app-studio__title" id="app-studio-heading">
            Describe the app. We open the real product on the next page.
          </h1>
          <p className="app-studio__lede">
            You’ll get a full client, a persisted data store, and an API contract — not a mock
            in the marketing site. When you are ready, redeem from the app to host it on
            Nanowork.
          </p>
        </div>

        <div className="app-studio__card">
          {phase === "prompt" && (
            <>
              <label className="app-studio__label" htmlFor="build-prompt">
                What are you building?
              </label>
              <textarea
                id="build-prompt"
                className="app-studio__textarea"
                rows={5}
                placeholder="Example: A waitlist for a coffee roastery with email capture, referral codes, and a simple admin CSV export…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="app-studio__actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={startBuild}
                  disabled={!prompt.trim()}
                >
                  Build and open app
                </button>
                <span className="app-studio__hint">Opens a new in-browser application</span>
              </div>
            </>
          )}

          {phase === "building" && (
            <div className="app-studio__building" role="status" aria-live="polite">
              <div className="app-studio__spinner" aria-hidden />
              <p className="app-studio__building-title">Building your app</p>
              <p className="app-studio__building-step">
                {buildStep < BUILD_STEPS.length
                  ? BUILD_STEPS[buildStep]
                  : "Handing off to your workspace…"}
              </p>
              <ol className="app-studio__progress">
                {BUILD_STEPS.map((_, i) => (
                  <li
                    key={i}
                    className={i < buildStep ? "is-done" : i === buildStep ? "is-active" : ""}
                  />
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
