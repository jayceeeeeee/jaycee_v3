const mobileQuery = window.matchMedia("(max-width: 900px)");

export function initializePanelToggle() {
  const panel = document.getElementById("info-panel");
  const toggleButton = document.getElementById("panel-toggle");
  const backdrop = document.getElementById("panel-backdrop");

  function syncPanelState(isOpen) {
    if (!mobileQuery.matches) {
      document.body.classList.remove("panel-open");
      toggleButton.setAttribute("aria-expanded", "true");
      backdrop.hidden = true;
      return;
    }

    document.body.classList.toggle("panel-open", isOpen);
    toggleButton.setAttribute("aria-expanded", String(isOpen));
    backdrop.hidden = !isOpen;
  }

  toggleButton.addEventListener("click", () => {
    const shouldOpen = !document.body.classList.contains("panel-open");
    syncPanelState(shouldOpen);
  });

  backdrop.addEventListener("click", () => {
    syncPanelState(false);
  });

  mobileQuery.addEventListener("change", () => {
    syncPanelState(false);
  });

  panel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  syncPanelState(false);
}
