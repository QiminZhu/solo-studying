"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const themes = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
] as const;

const subscribeToClient = () => () => {};

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const CurrentIcon = !mounted ? Monitor : resolvedTheme === "dark" ? Moon : resolvedTheme === "light" ? Sun : Monitor;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="surface-hover grid size-10 place-items-center rounded-xl text-slate-500 dark:text-[#b4b4b4]"
        aria-label="Choose color theme"
        aria-expanded={open}
      >
        <CurrentIcon className="size-[18px]" />
      </button>
      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close theme menu"
          />
          <div className="theme-menu absolute right-0 top-12 z-50 w-44 rounded-2xl p-1.5 shadow-2xl">
            <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Appearance
            </p>
            {themes.map((item) => {
              const Icon = item.icon;
              const active = theme === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setTheme(item.id); setOpen(false); }}
                  className="surface-hover flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm"
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                  {active && <Check className="ml-auto size-4 text-[#10a37f]" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
