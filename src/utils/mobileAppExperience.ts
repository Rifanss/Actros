/**
 * Mobile App Experience & Zoom Prevention Utility
 * 
 * Ensures the web app acts as a rock-solid, fixed-viewport mobile app:
 * - Disables pinch-to-zoom (multi-touch & gesture events)
 * - Disables double-tap to zoom on both body elements and form inputs
 * - Disables auto-zoom when focusing on inputs, textareas, and select elements (iOS Safari & WebKit)
 * - Fixes viewport scale and prevents horizontal shift/drift when mobile keyboard opens
 * - Preserves 100% of existing visual design, element sizes, padding, and layout
 * - Allows natural vertical scrolling and responsive typing without any disruption
 */

export function initMobileAppExperience(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  // 1. Enforce Viewport Meta Configuration with interactive-widget support
  const requiredContent =
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover, interactive-widget=resizes-content';

  const ensureViewportMeta = () => {
    let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = requiredContent;
      document.head.appendChild(meta);
    } else if (meta.content !== requiredContent) {
      meta.content = requiredContent;
    }
  };

  ensureViewportMeta();

  // Helper to reset viewport scale if iOS Safari or mobile browser accidentally zooms
  const visualViewport = window.visualViewport;
  const resetScaleIfZoomed = () => {
    let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (meta) {
      // Toggle viewport content momentarily to force iOS WebKit to snap back to scale 1.0
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no';
      setTimeout(() => {
        ensureViewportMeta();
      }, 50);
    }
    // Also reset any horizontal drift
    window.scrollTo({ left: 0 });
    if (document.documentElement) document.documentElement.scrollLeft = 0;
    if (document.body) document.body.scrollLeft = 0;
  };

  // 2. Block Multi-touch Gestures (Pinch to zoom)
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  };

  window.addEventListener('touchstart', handleTouchStart, { passive: false });
  window.addEventListener('touchmove', handleTouchMove, { passive: false });

  // 3. Block Safari / WebKit Native Gesture Events
  const handleGesture = (e: Event) => {
    e.preventDefault();
  };

  // Cast window for Safari-specific gesture events
  const win = window as unknown as {
    addEventListener: (type: string, listener: (e: Event) => void, options?: boolean | AddEventListenerOptions) => void;
    removeEventListener: (type: string, listener: (e: Event) => void) => void;
  };

  win.addEventListener('gesturestart', handleGesture, { passive: false });
  win.addEventListener('gesturechange', handleGesture, { passive: false });
  win.addEventListener('gestureend', handleGesture, { passive: false });

  // 4. Block Double Tap to Zoom Across the entire page & inputs
  let lastTouchEndTime = 0;
  const handleTouchEnd = (e: TouchEvent) => {
    const now = Date.now();
    const target = e.target as HTMLElement | null;

    if (now - lastTouchEndTime <= 300) {
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isInput) {
        // Prevent double-tap zoom on inputs, but allow normal focus
        e.preventDefault();
        (target as HTMLElement).focus();
      } else {
        // Prevent browser double-tap zoom on links/buttons/containers
        e.preventDefault();
        if (target && typeof target.click === 'function') {
          target.click();
        }
      }
    }
    lastTouchEndTime = now;
  };

  window.addEventListener('touchend', handleTouchEnd, { passive: false });

  // 5. Block Wheel / Trackpad Zooming (Ctrl + Wheel)
  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  };

  window.addEventListener('wheel', handleWheel, { passive: false });

  // 6. Block Keyboard Zoom Shortcuts (Ctrl/Cmd + Plus/Minus/Zero)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0' || e.key === '_')
    ) {
      e.preventDefault();
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  // 7. Prevent Auto-Zoom & Horizontal Viewport Drift on Input Focus
  const handleFocusIn = (e: FocusEvent) => {
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT')
    ) {
      // Re-apply viewport lock
      ensureViewportMeta();

      // Prevent horizontal scroll shift when mobile virtual keyboard pops up
      window.scrollTo({ left: 0 });
      if (document.documentElement.scrollLeft !== 0) {
        document.documentElement.scrollLeft = 0;
      }
      if (document.body.scrollLeft !== 0) {
        document.body.scrollLeft = 0;
      }

      // Check visual viewport scale
      if (visualViewport && Math.abs(visualViewport.scale - 1) > 0.01) {
        resetScaleIfZoomed();
      }
    }
  };

  const handleFocusOut = () => {
    // Re-affirm viewport lock when keyboard hides and force reset scale
    ensureViewportMeta();
    window.scrollTo({ left: 0 });
    if (document.documentElement.scrollLeft !== 0) {
      document.documentElement.scrollLeft = 0;
    }
    if (document.body.scrollLeft !== 0) {
      document.body.scrollLeft = 0;
    }

    resetScaleIfZoomed();
    setTimeout(resetScaleIfZoomed, 100);
    setTimeout(resetScaleIfZoomed, 300);
  };

  document.addEventListener('focusin', handleFocusIn);
  document.addEventListener('focusout', handleFocusOut);

  // 8. Visual Viewport Scale Stabilization (iOS Safari 13+ & Android Chrome)
  const handleVisualViewportResize = () => {
    if (visualViewport && Math.abs(visualViewport.scale - 1) > 0.01) {
      resetScaleIfZoomed();
    }
    // Lock horizontal panning
    if (visualViewport && visualViewport.pageLeft !== 0) {
      window.scrollTo({ left: 0 });
    }
  };

  const handleVisualViewportScroll = () => {
    if (visualViewport && visualViewport.pageLeft !== 0) {
      window.scrollTo({ left: 0 });
    }
  };

  if (visualViewport) {
    visualViewport.addEventListener('resize', handleVisualViewportResize);
    visualViewport.addEventListener('scroll', handleVisualViewportScroll);
  }

  // Cleanup function
  return () => {
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchmove', handleTouchMove);
    win.removeEventListener('gesturestart', handleGesture);
    win.removeEventListener('gesturechange', handleGesture);
    win.removeEventListener('gestureend', handleGesture);
    window.removeEventListener('touchend', handleTouchEnd);
    window.removeEventListener('wheel', handleWheel);
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('focusin', handleFocusIn);
    document.removeEventListener('focusout', handleFocusOut);

    if (visualViewport) {
      visualViewport.removeEventListener('resize', handleVisualViewportResize);
      visualViewport.removeEventListener('scroll', handleVisualViewportScroll);
    }
  };
}
