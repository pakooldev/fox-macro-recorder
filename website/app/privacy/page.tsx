import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { marked } from "marked";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Fox Macro Recorder stores your macros in your browser only. Nothing is collected or sent anywhere.",
};

// The policy itself lives in the extension repo (PRIVACY_POLICY.md); rendered at build time
const policy = readFileSync(join(process.cwd(), "..", "PRIVACY_POLICY.md"), "utf8");

export default function Privacy() {
  return (
    <main className="container">
      <div className="page-head">
        <span className="label">Privacy</span>
        <h1>Privacy Policy</h1>
        <p>Short version: your macros stay in your browser. Nothing is collected, sent or sold.</p>
      </div>
      <article className="prose raised" dangerouslySetInnerHTML={{ __html: marked.parse(policy, { async: false }) }} />
    </main>
  );
}
