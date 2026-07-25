const sectionLinks = [...document.querySelectorAll(".ds-nav a")];
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const toast = document.querySelector(".copy-toast");
let toastTimer;

const navObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    sectionLinks.forEach((link) => {
      link.classList.toggle(
        "is-active",
        link.getAttribute("href") === `#${visible.target.id}`,
      );
    });
  },
  { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.25, 0.5] },
);

observedSections.forEach((section) => navObserver.observe(section));

document.querySelectorAll("[data-copy]").forEach((swatch) => {
  swatch.addEventListener("click", async () => {
    const value = swatch.dataset.copy;

    try {
      await navigator.clipboard.writeText(value);
      toast.textContent = `${value} copiado`;
    } catch {
      toast.textContent = `Cor: ${value}`;
    }

    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1800);
  });
});

