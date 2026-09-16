"use client";

import {useEffect, useRef, type ReactNode} from 'react';
import {usePathname} from 'next/navigation';

/** Progressive enhancement: content remains visible without JS or animation support. */
export function PageEntrance({children}: {children: ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const root = ref.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!root || pathname.startsWith('/studio') || reduced.matches || !('IntersectionObserver' in window)) return;
    const animations: Animation[] = [];
    const queued = new Set<HTMLElement>();
    const observed = new Set<Element>();
    let observer: IntersectionObserver;
    function reveal(element: HTMLElement, delay = 0) {
      if (document.documentElement.dataset.rimnaLoading === 'true') { queued.add(element); return; }
      if (reduced.matches || !element.animate) return;
      const animation = element.animate([
        {opacity: 0, transform: 'translate3d(0, 22px, 0)'},
        {opacity: 1, transform: 'none'},
      ], {duration: 700, delay, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards'});
      animations.push(animation);
    }
    const onReady = () => { Array.from(queued).forEach((el, i) => reveal(el, Math.min(i * 90, 270))); queued.clear(); };
    const onMotionChange = () => { if (reduced.matches) { animations.forEach(a => a.cancel()); queued.clear(); } };
    observer = new IntersectionObserver(entries => {
      let order = 0;
      for (const entry of entries) if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        reveal(entry.target as HTMLElement, Math.min(order++ * 90, 270));
      }
    }, {threshold: 0.04});
    const observe = () => {
      root.querySelectorAll('[data-page-reveal]').forEach(el => {
        if (!observed.has(el)) { observed.add(el); observer.observe(el); }
      });
    };
    observe();
    // Also covers sections that arrive later through Next.js streaming/navigation.
    const mutations = new MutationObserver(observe);
    mutations.observe(root, {childList: true, subtree: true});
    window.addEventListener('rimna:page-ready', onReady);
    reduced.addEventListener('change', onMotionChange);
    return () => {
      observer.disconnect(); mutations.disconnect(); animations.forEach(a => a.cancel());
      window.removeEventListener('rimna:page-ready', onReady);
      reduced.removeEventListener('change', onMotionChange);
    };
  }, [pathname]);
  return <div ref={ref}>{children}</div>;
}
