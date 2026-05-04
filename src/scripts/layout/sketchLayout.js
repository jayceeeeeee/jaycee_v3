const DESKTOP_PANEL_MEDIA_QUERY = "(min-width: 901px)";
const VIEWPORT_MARGIN = 20;
const PANEL_CLEARANCE = 24;

export function getSketchLayoutMetrics(canvasWidth = window.innerWidth, canvasHeight = window.innerHeight) {
  // Start from a simple "safe area" around the viewport.
  // These insets describe the space we want to keep free on each side.
  const metrics = {
    leftInset: VIEWPORT_MARGIN,
    rightInset: VIEWPORT_MARGIN,
    topInset: VIEWPORT_MARGIN,
    bottomInset: VIEWPORT_MARGIN
  };

  if (window.matchMedia(DESKTOP_PANEL_MEDIA_QUERY).matches) {
    const panel = document.getElementById("info-panel");

    if (panel) {
      const panelBounds = panel.getBoundingClientRect();
      // On desktop, reserve enough space so the sketch visually centers in the
      // area that remains visible to the right of the floating panel.
      metrics.leftInset = Math.min(
        canvasWidth - VIEWPORT_MARGIN,
        Math.max(VIEWPORT_MARGIN, panelBounds.right + PANEL_CLEARANCE)
      );
    }
  }

  // Compute the drawable rectangle that remains after subtracting the insets.
  const availableWidth = Math.max(120, canvasWidth - metrics.leftInset - metrics.rightInset);
  const availableHeight = Math.max(120, canvasHeight - metrics.topInset - metrics.bottomInset);

  return {
    // Copy every property from metrics into the returned object so callers can
    // use both the raw insets and the derived center values.
    ...metrics,
    availableWidth,
    availableHeight,
    centerX: metrics.leftInset + availableWidth / 2,
    centerY: metrics.topInset + availableHeight / 2
  };
}
