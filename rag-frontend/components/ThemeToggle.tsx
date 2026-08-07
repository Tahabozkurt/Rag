"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      title={isDark ? "Aydınlık tema" : "Karanlık tema"}
      className="relative h-8 w-8 rounded-lg border border-line text-muted
                 hover:text-gold hover:border-gold transition-all duration-300
                 flex items-center justify-center overflow-hidden group"
    >
      <span className="absolute inset-0 bg-gold-soft opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="relative transition-transform duration-500" style={{ transform: isDark ? "rotate(0deg)" : "rotate(180deg)" }}>
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </span>
    </button>
  );
}