const tabs = [...document.querySelectorAll(".concept-tab")];
const panels = [...document.querySelectorAll(".concept-panel")];
const roleButtons = [...document.querySelectorAll("[data-role]")];
const toast = document.querySelector("#lab-toast");
const choiceStatus = document.querySelector("#choice-status");
let activeIndex = 0;

function showConcept(index) {
  activeIndex = (index + tabs.length) % tabs.length;
  tabs.forEach((tab, tabIndex) => {
    const active = tabIndex === activeIndex;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  panels.forEach((panel, panelIndex) => {
    const active = panelIndex === activeIndex;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });
  window.history.replaceState(null, "", `#${tabs[activeIndex].dataset.concept}`);
}

function setRole(role) {
  document.body.dataset.role = role;
  roleButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.role === role));
  document.querySelectorAll("[data-copy-company]").forEach((element) => {
    element.textContent = role === "carrier" ? element.dataset.copyCarrier : element.dataset.copyCompany;
  });
  document.querySelectorAll("[data-value-company]").forEach((element) => {
    element.textContent = role === "carrier" ? element.dataset.valueCarrier : element.dataset.valueCompany;
  });
}

tabs.forEach((tab, index) => tab.addEventListener("click", () => showConcept(index)));
roleButtons.forEach((button) => button.addEventListener("click", () => setRole(button.dataset.role)));

document.querySelectorAll(".choose-design").forEach((button) => {
  button.addEventListener("click", () => {
    const choice = button.dataset.choice;
    localStorage.setItem("transfluxo-design-choice", choice);
    choiceStatus.textContent = `Direcao favorita: ${choice}.`;
    toast.textContent = `${choice} foi salva como sua favorita.`;
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") showConcept(activeIndex + 1);
  if (event.key === "ArrowLeft") showConcept(activeIndex - 1);
});

const savedChoice = localStorage.getItem("transfluxo-design-choice");
if (savedChoice) choiceStatus.textContent = `Direcao favorita: ${savedChoice}.`;
const hashIndex = tabs.findIndex((tab) => `#${tab.dataset.concept}` === window.location.hash);
showConcept(hashIndex >= 0 ? hashIndex : 0);
setRole("company");
