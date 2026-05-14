"use client";

import { useMemo } from "react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

function formatDate() {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DashboardGreeting() {
  const greeting = useMemo(getGreeting, []);
  const date = useMemo(formatDate, []);

  return (
    <div className="mb-2">
      <h1
        className="text-3xl font-bold tracking-tight"
        style={{ color: "var(--text-1)" }}
      >
        {greeting}, Avancia
      </h1>
      <p className="mt-1 text-sm capitalize" style={{ color: "var(--text-3)" }}>
        {date}
      </p>
    </div>
  );
}
