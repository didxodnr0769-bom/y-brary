export async function openBookTransition(image: HTMLImageElement, navigate: () => void) {
  const rect = image.getBoundingClientRect();
  const initialPath = window.location.href;
  const overlay = document.createElement("div");
  overlay.className = "book-transition";
  overlay.setAttribute("aria-hidden", "true");
  const book = document.createElement("div");
  book.className = "book-transition-book";
  Object.assign(book.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
  const page = document.createElement("div");
  page.className = "book-transition-page";
  const cover = document.createElement("div");
  cover.className = "book-transition-cover";
  const front = image.cloneNode(false) as HTMLImageElement;
  front.removeAttribute("id");
  front.alt = "";
  front.className = "book-transition-front";
  front.removeAttribute("style");
  const inside = document.createElement("div");
  inside.className = "book-transition-inside";
  cover.append(front, inside);
  book.append(page, cover);
  overlay.append(book);
  document.body.append(overlay);
  const width = Math.min(window.innerWidth * 0.39, window.innerHeight * 0.55, 330);
  const scale = width / rect.width;
  const height = rect.height * scale;
  const x = (window.innerWidth - width) / 2 - rect.left;
  const y = (window.innerHeight - height) / 2 - rect.top;
  let navigated = false;
  try {
    overlay.animate([{ backgroundColor: "rgba(17, 23, 34, 0)" }, { backgroundColor: "rgba(17, 23, 34, .72)" }], { duration: 420, fill: "forwards" });
    await book.animate([{ transform: "translate(0, 0) scale(1)" }, { transform: `translate(${x}px, ${y}px) scale(${scale})` }], { duration: 520, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" }).finished;
    if (window.location.href !== initialPath) return;
    navigate();
    navigated = true;
    const opening = book.animate([{ transform: `translate(${x}px, ${y}px) scale(${scale})` }, { transform: `translate(${x + width / 2}px, ${y}px) scale(${scale})` }], { duration: 620, easing: "ease-in-out", fill: "forwards" });
    const turning = cover.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(-165deg)" }], { duration: 620, easing: "ease-in-out", fill: "forwards" });
    const fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 930, easing: "ease-in-out", fill: "forwards" });
    await Promise.all([opening.finished, turning.finished, fade.finished]);
  } catch {
    if (!navigated && window.location.href === initialPath) navigate();
  } finally {
    overlay.remove();
  }
}
