import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { marked } from "marked";
import { Icon, type IconName } from "@/components/pixel";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Fox Macro Recorder stores your macros in your browser only. Nothing is collected or sent anywhere.",
};

// The policy itself lives in the extension repo (PRIVACY_POLICY.md); rendered at build time
// minus its own "# Privacy Policy" line: the page head is the one h1
const policy = readFileSync(join(process.cwd(), "..", "PRIVACY_POLICY.md"), "utf8").replace(/^# .*\n/, "");

const TLDR: [IconName, string][] = [["close", "No account"], ["archive", "Stays in your browser"], ["check", "Nothing sent or sold"]];

export default function Privacy() {
  return (
    <main className="container">
      <div className="page-head">
                <h1>Privacy Policy</h1>
        <ul className="tldr">
          {TLDR.map(([icon, text]) => (
            <li key={text} className="raised">
              <Icon name={icon} /> {text}
            </li>
          ))}
        </ul>
      </div>
      <article className="prose raised" dangerouslySetInnerHTML={{ __html: marked.parse(policy, { async: false }) }} />
    </main>
  );
}
