import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// AOS owns page-level listeners and has no destroy API. Initialise once, including
// under React StrictMode; dispose only the observers/listeners this hook owns.
let initialized = false;
export function useAOS() {
  useEffect(() => {
    if (!initialized) {
      AOS.init({
        duration: 850,
        easing: 'ease-out-cubic',
        offset: 65,
        delay: 0,
        once: true,
        mirror: false,
        anchorPlacement: 'top-bottom',
        throttleDelay: 32,
        debounceDelay: 80,
      });
      initialized = true;
    }
    AOS.refreshHard();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const refresh = () => {
      if (disposed) return;
      clearTimeout(timer);
      timer = setTimeout(() => AOS.refresh(), 100);
    };
    // Filtered projects, expanding services, image loads and fonts change the
    // document height. Keep scroll triggers aligned with those changes.
    const observer = new ResizeObserver(refresh);
    const main = document.querySelector('main');
    if (main) observer.observe(main);
    document.addEventListener('load', refresh, true);
    document.fonts.ready.then(refresh);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    preference.addEventListener('change', refresh);
    return () => {
      disposed = true;
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener('load', refresh, true);
      preference.removeEventListener('change', refresh);
    };
  }, []);
}
