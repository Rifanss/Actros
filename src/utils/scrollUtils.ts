import { useEffect, useLayoutEffect } from 'react';

/**
 * Global Scroll Management & Scroll-to-Top Utility
 * 
 * Ensures that whenever the user navigates between pages, sections, sub-tabs,
 * or clicks back/forward/links, the page ALWAYS starts cleanly from top (0, 0)
 * rather than retaining the previous scroll offset.
 */

export function scrollToTop(instant: boolean = true): void {
  if (typeof window === 'undefined') return;

  const performScroll = () => {
    // 1. Primary window & viewport scrolling
    try {
      window.scrollTo(0, 0);
    } catch (_) {}

    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: instant ? 'instant' : 'auto',
      });
    } catch (_) {}

    // 2. Standard scrolling element (HTML or BODY depending on browser mode)
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
      document.scrollingElement.scrollLeft = 0;
    }

    // 3. Document & Body elements
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
    }

    // 4. Root container
    const root = document.getElementById('root');
    if (root) {
      root.scrollTop = 0;
      root.scrollLeft = 0;
    }

    // 5. Main container elements
    const mains = document.querySelectorAll('main, [role="main"]');
    mains.forEach((m) => {
      (m as HTMLElement).scrollTop = 0;
      (m as HTMLElement).scrollLeft = 0;
    });

    // 6. Reset any container or scroll wrapper that has active scroll
    const scrollables = document.querySelectorAll<HTMLElement>(
      '[data-scroll-container], section, article'
    );
    scrollables.forEach((el) => {
      if (el.scrollTop > 0) el.scrollTop = 0;
      if (el.scrollLeft > 0) el.scrollLeft = 0;
    });
  };

  // Immediate synchronous execution (pre-render / during click)
  performScroll();

  // Microtask execution
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(performScroll);
  } else {
    Promise.resolve().then(performScroll).catch(() => {});
  }

  // Animation frames to catch layout reflows and React DOM commits
  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => {
      performScroll();
      window.requestAnimationFrame(() => {
        performScroll();
        window.requestAnimationFrame(() => {
          performScroll();
        });
      });
    });
  }

  // Backup timers for delayed image decoding or dynamic component mounting
  setTimeout(performScroll, 0);
  setTimeout(performScroll, 20);
  setTimeout(performScroll, 50);
  setTimeout(performScroll, 100);
  setTimeout(performScroll, 200);
  setTimeout(performScroll, 350);
}

/**
 * React hook to guarantee that a component/page/subview starts at 0, 0
 * both BEFORE the browser paints (via useLayoutEffect) and AFTER (via useEffect).
 */
export function useScrollToTop(deps: any[] = []): void {
  useLayoutEffect(() => {
    scrollToTop(true);
  }, deps);

  useEffect(() => {
    scrollToTop(true);
  }, deps);
}

/**
 * Disables browser native scroll restoration and ensures manual 0,0 top positioning
 */
export function initGlobalScrollRestoration(): void {
  if (typeof window === 'undefined') return;

  const enforceManualRestoration = () => {
    if ('scrollRestoration' in window.history) {
      try {
        window.history.scrollRestoration = 'manual';
      } catch (_) {}
    }
  };

  // 1. Force manual scroll restoration immediately and on lifecycle events
  enforceManualRestoration();

  // 2. Clear any lingering session scroll markers
  try {
    sessionStorage.removeItem('scrollPosition');
    sessionStorage.removeItem('lastScrollTop');
  } catch (_) {}

  // 3. Handle browser back / forward / navigation events
  window.addEventListener('popstate', () => {
    enforceManualRestoration();
    scrollToTop(true);
  });

  window.addEventListener('hashchange', () => {
    scrollToTop(true);
  });

  window.addEventListener('pageshow', () => {
    enforceManualRestoration();
    scrollToTop(true);
  });

  window.addEventListener('beforeunload', () => {
    enforceManualRestoration();
  });

  // 4. Initial page load always starts at top
  window.addEventListener('load', () => {
    enforceManualRestoration();
    scrollToTop(true);
  });

  // 5. Global Navigation click listener:
  // Whenever user clicks any navigation button, drawer link, card button, or back button,
  // ensure scroll is reset to top.
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const navEl = target.closest(
        'button, a, [role="button"], [data-nav], [data-tab], .cursor-pointer'
      );
      if (!navEl) return;

      // Ignore pure form elements unless they are buttons
      if (
        navEl.tagName === 'INPUT' ||
        navEl.tagName === 'SELECT' ||
        navEl.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Schedule instant scroll to top on any navigation action
      setTimeout(() => {
        scrollToTop(true);
      }, 0);
    },
    { capture: true, passive: true }
  );

  // Also execute immediately
  scrollToTop(true);
}
