"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { landingVariants, type LandingPrototypeView } from "./prototype-types";

export function LandingPrototypeSwitcher({
  current,
}: {
  current: LandingPrototypeView;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const currentIndex = landingVariants.findIndex(
    (variant) => variant.key === current,
  );
  const active = landingVariants.find((variant) => variant.key === current);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        (target instanceof Element &&
          target.closest(
            "input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='textbox'], dialog[open]",
          ))
      )
        return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const index =
        currentIndex < 0
          ? event.key === "ArrowRight"
            ? 0
            : 2
          : (currentIndex +
              (event.key === "ArrowRight" ? 1 : -1) +
              landingVariants.length) %
            landingVariants.length;
      const next = new URLSearchParams(search.toString());
      next.set("variant", landingVariants[index].key);
      router.replace(`${pathname}?${next}`, { scroll: false });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, pathname, router, search]);

  if (process.env.NODE_ENV === "production") return null;
  function move(direction: number) {
    const index =
      currentIndex < 0
        ? direction > 0
          ? 0
          : 2
        : (currentIndex + direction + landingVariants.length) %
          landingVariants.length;
    const next = new URLSearchParams(search.toString());
    next.set("variant", landingVariants[index].key);
    router.replace(`${pathname}?${next}`, { scroll: false });
  }
  function original() {
    const next = new URLSearchParams(search.toString());
    next.set("variant", "original");
    router.replace(`${pathname}?${next}`, { scroll: false });
  }
  return (
    <nav
      className="prototype-switcher"
      aria-label="Landing page prototype variants"
    >
      <button onClick={() => move(-1)} aria-label="Previous design variation">
        <ArrowLeftIcon size={19} weight="regular" aria-hidden="true" />
      </button>
      <div
        className="prototype-switcher-label"
        aria-live="polite"
        aria-atomic="true"
      >
        <span>
          UI PROTOTYPE <span>{active ? `${active.key} / 3` : "REFERENCE"}</span>
        </span>
        <strong>{active?.name ?? "Current site"}</strong>
        <small>{active?.focus ?? "The existing landing page"}</small>
      </div>
      <button onClick={() => move(1)} aria-label="Next design variation">
        <ArrowRightIcon size={19} weight="regular" aria-hidden="true" />
      </button>
      <button
        onClick={original}
        className="prototype-original-button"
        aria-pressed={current === "original"}
      >
        Current site
      </button>
    </nav>
  );
}
