import type { Metadata } from "next";
import { Keys } from "@/components/pixel";
import { SHORTCUT } from "@/components/site";
import { Targets } from "./targets";

export const metadata: Metadata = {
  title: "Playground",
  description: "Click targets to try recording and replaying a macro with Fox Macro Recorder.",
};

export default function Playground() {
  return (
    <main className="container">
      <div className="page-head">
        <span className="label">Playground</span>
        <h1>Try Fox here</h1>
        <p>
          Open Fox on this page (toolbar icon or <Keys combo={SHORTCUT} />), press Record, click some targets below, then
          Stop, save and Play. The counters show what the replay clicked.
        </p>
      </div>
      <Targets />
    </main>
  );
}
