import { useEffect, useRef } from "react";

/** Decorative stars are separate from the interactive, semantically linked records. */
export function CosmicStars() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext("2d");
    if (!context) return;

    function draw() {
      if (!element || !context) return;
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      let seed = 24817;
      function random() {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
      }
      const count = Math.min(1500, Math.round(width * height / 1250));
      for (let index = 0; index < count; index++) {
        const x = random() * width;
        const y = random() * height;
        const brightness = random();
        const radius = brightness > 0.98 ? 1.05 : 0.25 + random() * 0.55;
        context.fillStyle = `rgba(224, 229, 223, ${0.1 + brightness * 0.45})`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        if (brightness > 0.989) {
          const glow = context.createRadialGradient(x, y, 0, x, y, 9);
          glow.addColorStop(0, "rgba(223, 233, 227, 0.2)");
          glow.addColorStop(1, "rgba(223, 233, 227, 0)");
          context.fillStyle = glow;
          context.fillRect(x - 9, y - 9, 18, 18);
        }
      }
    }

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(draw);
      observer.observe(element);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", draw);
    draw();
    return () => window.removeEventListener("resize", draw);
  }, []);

  return <canvas ref={canvas} className="cosmic-stars" aria-hidden="true" />;
}
