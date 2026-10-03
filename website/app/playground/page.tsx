import type { Metadata } from "next";
import { Icon, Keys } from "@/components/pixel";
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
        <h1>Try Fox here</h1>
        <ol className="strip" aria-label="How to try it">
          <li>
            <Keys combo={SHORTCUT} />
          </li>
          <li>
            <Icon name="record" /> Record
          </li>
          <li>Click targets</li>
          <li>
            <Icon name="play" /> Play
          </li>
        </ol>
      </div>
      <Targets />
    </main>
  );
}
