import { useEffect, useRef, useState } from "react";

type HomeChapter = { id: string; label: string };

function chapterFromHash(items: readonly HomeChapter[]) {
  if (typeof window === "undefined") return undefined;
  try {
    const id = decodeURIComponent(window.location.hash.slice(1));
    return items.find((item) => item.id === id)?.id;
  } catch {
    return undefined;
  }
}

export function HomeChapterNav({ items }: { items: readonly HomeChapter[] }) {
  const [activeId, setActiveId] = useState(() => chapterFromHash(items) ?? items[0]?.id ?? "");
  const anchorTarget = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!items.length) return;
    const requestFrame = window.requestAnimationFrame?.bind(window)
      ?? ((callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 0));
    const cancelFrame = window.cancelAnimationFrame?.bind(window) ?? window.clearTimeout.bind(window);
    let scrollFrame: number | undefined;
    let hashFrame: number | undefined;

    function syncScrollPosition() {
      if (anchorTarget.current) {
        setActiveId(anchorTarget.current);
        return;
      }
      const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
      const firstSection = document.getElementById(items[0].id);
      const anchorOffset = firstSection ? Number.parseFloat(window.getComputedStyle(firstSection).scrollMarginTop) || 0 : 0;
      const activationLine = Math.max(headerBottom + 28, anchorOffset);
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        setActiveId(items[items.length - 1].id);
        return;
      }
      let current = items[0].id;
      for (const { id } of items) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= activationLine) current = id;
      }
      setActiveId(current);
    }

    function scheduleScrollSync() {
      if (scrollFrame !== undefined) return;
      scrollFrame = requestFrame(() => {
        scrollFrame = undefined;
        syncScrollPosition();
      });
    }

    function followHash() {
      const id = chapterFromHash(items);
      anchorTarget.current = id;
      if (hashFrame !== undefined) cancelFrame(hashFrame);
      if (!id) {
        scheduleScrollSync();
        return;
      }
      hashFrame = requestFrame(() => {
        hashFrame = undefined;
        const section = document.getElementById(id);
        if (!section) return;
        section.scrollIntoView?.({ block: "start" });
        section.focus({ preventScroll: true });
        setActiveId(id);
      });
    }

    function resumeScrollTracking() {
      anchorTarget.current = undefined;
      scheduleScrollSync();
    }

    function handleScrollKey(event: KeyboardEvent) {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) resumeScrollTracking();
    }

    followHash();
    window.addEventListener("scroll", scheduleScrollSync, { passive: true });
    window.addEventListener("resize", scheduleScrollSync);
    window.addEventListener("hashchange", followHash);
    window.addEventListener("wheel", resumeScrollTracking, { passive: true });
    window.addEventListener("touchstart", resumeScrollTracking, { passive: true });
    window.addEventListener("pointerdown", resumeScrollTracking, { passive: true });
    window.addEventListener("keydown", handleScrollKey);
    return () => {
      if (scrollFrame !== undefined) cancelFrame(scrollFrame);
      if (hashFrame !== undefined) cancelFrame(hashFrame);
      window.removeEventListener("scroll", scheduleScrollSync);
      window.removeEventListener("resize", scheduleScrollSync);
      window.removeEventListener("hashchange", followHash);
      window.removeEventListener("wheel", resumeScrollTracking);
      window.removeEventListener("touchstart", resumeScrollTracking);
      window.removeEventListener("pointerdown", resumeScrollTracking);
      window.removeEventListener("keydown", handleScrollKey);
    };
  }, [items]);

  return (
    <nav className="chapter-nav" aria-label="홈 목차">
      {items.map(({ id, label }, index) => (
        <a
          key={id}
          className="chapter-link"
          href={`#${id}`}
          aria-current={activeId === id ? "location" : undefined}
          onClick={(event) => {
            if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const section = document.getElementById(id);
            if (!section) return;
            anchorTarget.current = id;
            setActiveId(id);
            section.focus({ preventScroll: true });
          }}
        >
          <span className="chapter-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
