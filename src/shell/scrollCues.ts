/**
 * Mobile-only scroll cues for the diagram stage.
 *
 * On a phone several diagrams sit in containers that scroll downwards (lists,
 * stacked cards, the mechanism side-notes). Nothing tells the reader they
 * move; the sideways strips already have their own slider. This attaches, next to each
 * overflowing `[data-scrolls]` container, a thin slider that mirrors the
 * scroll position and a one-line label that fades after the first scroll.
 * It is a DOM overlay: the diagrams themselves are untouched, and above
 * 1080px it does nothing at all.
 */

const MOBILE = "(max-width: 1080px)";

type Cue = { node: HTMLElement; update: () => void; dispose: () => void };

const cues = new WeakMap<HTMLElement, Cue>();

function build(el: HTMLElement): Cue {
  const horizontal = el.scrollWidth - el.clientWidth > el.scrollHeight - el.clientHeight;
  const node = document.createElement("div");
  node.className = `scroll-cue scroll-cue--${horizontal ? "x" : "y"}`;
  node.setAttribute("aria-hidden", "true");
  node.innerHTML =
    `<span class="scroll-cue__label">${horizontal ? "Swipe sideways for the rest →" : "Scroll for the rest ↓"}</span>` +
    `<span class="scroll-cue__track"><span class="scroll-cue__thumb"></span></span>`;
  const thumb = node.querySelector<HTMLElement>(".scroll-cue__thumb")!;
  const label = node.querySelector<HTMLElement>(".scroll-cue__label")!;

  const update = () => {
    const range = horizontal ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
    if (range <= 8) { node.style.display = "none"; return; }
    node.style.display = "";
    const visible = horizontal ? el.clientWidth / el.scrollWidth : el.clientHeight / el.scrollHeight;
    const size = Math.max(14, visible * 100);
    const offset = horizontal ? el.scrollLeft : el.scrollTop;
    const pos = (offset / range) * (100 - size);
    if (horizontal) { thumb.style.width = `${size}%`; thumb.style.left = `${pos}%`; }
    else { thumb.style.height = `${size}%`; thumb.style.top = `${pos}%`; }
    if (offset > 12) label.classList.add("is-done");
  };

  el.insertAdjacentElement("afterend", node);
  el.addEventListener("scroll", update, { passive: true });
  const dispose = () => { el.removeEventListener("scroll", update); node.remove(); };
  return { node, update, dispose };
}

/** Attach cues to every overflowing scroll container under `root`. Returns a cleanup. */
export function attachScrollCues(root: HTMLElement | null): () => void {
  if (!root || !window.matchMedia(MOBILE).matches) return () => {};
  // Sideways strips already carry their own range slider in the diagram, so
  // cues are only added where content scrolls downwards.
  const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-scrolls], .clean-readiness, .clean-list-board, .clean-summary, .clean-mech__aside")).filter(
    (el) => el.scrollHeight - el.clientHeight > 8 && el.scrollWidth - el.clientWidth <= 8,
  );
  // Only the outermost overflowing container in any nested pair gets a cue.
  const outer = targets.filter((el) => !targets.some((other) => other !== el && other.contains(el)));
  for (const el of outer) cues.set(el, build(el));
  const onResize = () => outer.forEach((el) => cues.get(el)?.update());
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    for (const el of outer) { cues.get(el)?.dispose(); cues.delete(el); }
  };
}
