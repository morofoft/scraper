// Fade + slide on load
window.addEventListener("load", () => {
    document.querySelectorAll("[data-animate]").forEach((el, i) => {
      setTimeout(() => {
        el.classList.remove("opacity-0", "translate-y-6");
        el.classList.add("opacity-100", "translate-y-0");
      }, i * 120);
    });
  });
  
  // Dark mode: system + manual
  const html = document.documentElement;
  const toggle = document.getElementById("darkToggle");
  
  function applyTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return html.classList.add("dark");
    if (saved === "light") return html.classList.remove("dark");
  
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.classList.toggle("dark", prefers);
  }
  applyTheme();
  
  toggle?.addEventListener("click", () => {
    const isDark = html.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
  
  // Update on system change only if user didn't choose manual
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) html.classList.toggle("dark", e.matches);
  });
  
  // Parallax
  const layers = Array.from(document.querySelectorAll(".parallax-layer"));
  
  function onScroll() {
    const y = window.scrollY || 0;
    layers.forEach((layer) => {
      const depth = parseFloat(layer.getAttribute("data-depth") || "0.1");
      layer.style.transform = `translate3d(0, ${y * depth}px, 0)`;
    });
  }
  
  onScroll();
  window.addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
  