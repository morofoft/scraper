// Fade + slide on load
window.addEventListener("load", () => {
    document.querySelectorAll("[data-animate]").forEach((el, i) => {
        setTimeout(() => {
            el.classList.remove("opacity-0", "translate-y-6");
            el.classList.add("opacity-100", "translate-y-0");
        }, i * 120);
    });
});

// Dark mode auto + toggle
const html = document.documentElement;
const toggle = document.getElementById("darkToggle");

// Auto by system + localStorage
if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
    html.classList.add("dark");
    toggle?.classList.add("dark");
}

toggle?.addEventListener("click", () => {
    html.classList.toggle("dark");
    toggle.classList.toggle("dark");
    localStorage.theme = html.classList.contains("dark") ? "dark" : "light";
});

