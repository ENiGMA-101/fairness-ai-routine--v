
"use client";

import { useEffect, useState } from "react";

const phrases = [
  "Fairer opportunities.",
  "Smarter routines.",
  "Balanced workloads.",
  "Happier campuses.",
  "Better learning experiences.",
];

export default function RotatingHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % phrases.length);
    }, 2500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <h1 id="research-heading">
      Better schedules.
      <br className="mobile-break" />{" "}
      <span key={phrases[index]} className="rotating-phrase">
        {phrases[index]}
      </span>
    </h1>
  );
}
