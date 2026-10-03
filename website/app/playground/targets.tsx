"use client";

import { useState } from "react";
import { Mascot } from "@/components/pixel";

const BUTTONS = [
  { id: "red", label: "Red", cls: "btn-red" },
  { id: "blue", label: "Blue", cls: "btn-blue" },
  { id: "orange", label: "Orange", cls: "btn-primary" },
  { id: "grey", label: "Grey", cls: "" },
];
const ORDER = [1, 2, 3, 4, 5];

export function Targets() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [next, setNext] = useState(1); // next tile to hit in the sequence
  const [solved, setSolved] = useState(0);
  const [fed, setFed] = useState(0);
  const [happy, setHappy] = useState(false);

  const hitTile = (n: number) => {
    if (n !== next) return setNext(1); // wrong order starts over
    if (n === ORDER.length) {
      setSolved((s) => s + 1);
      setNext(1);
    } else setNext(n + 1);
  };
  const feed = () => {
    setFed((f) => f + 1);
    setHappy(true);
    setTimeout(() => setHappy(false), 400);
  };
  const reset = () => {
    setCounts({});
    setNext(1);
    setSolved(0);
    setFed(0);
  };

  return (
    <div className="grid playground">
      <section className="card raised">
        <h2 className="card-title">Counters</h2>
        <div className="pg-buttons">
          {BUTTONS.map((b) => (
            <button key={b.id} id={`pg-${b.id}`} className={`btn ${b.cls}`} onClick={() => setCounts((c) => ({ ...c, [b.id]: (c[b.id] ?? 0) + 1 }))}>
              {b.label} <span className="pg-count">{counts[b.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card raised">
        <h2 className="card-title">1 to 5 in order</h2>
        <p>Solved: <strong className="pixel">{solved}</strong></p>
        <div className="pg-tiles">
          {ORDER.map((n) => (
            <button key={n} id={`pg-tile-${n}`} className={`pg-tile${n < next ? " is-done" : ""}`} onClick={() => hitTile(n)}>
              {n}
            </button>
          ))}
        </div>
      </section>

      <section className="card raised pg-feed">
        <h2 className="card-title">Feed the fox</h2>
        <p>
          Snacks: <strong className="pixel">{fed}</strong>
        </p>
        <button id="pg-feed" className="pg-fox inset" onClick={feed} aria-label="Feed the fox">
          <Mascot state={happy ? "success" : "idle"} big />
        </button>
      </section>

      <div className="pg-reset">
        <button className="btn btn-small" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
