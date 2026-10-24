import { useEffect, useRef } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { frameWindow, imageFit, nearestFrame, progressToFrame } from '@/lib/frame-sequence';

// The supplied sequence is contiguous: ezgif-frame-001.jpg through -300.jpg.
const FRAME_COUNT = 300;
const frameURL = (index: number) => `${import.meta.env.BASE_URL}frames/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`;
type DecodedFrame = { source: CanvasImageSource; width: number; height: number; release: () => void };

export default function ScrollSequenceHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current!, stage = stageRef.current!, canvas = canvasRef.current!;
    const context = canvas.getContext('2d', { alpha: false });
    // The eager poster and ordinary links remain useful without canvas support.
    if (!context) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 767px)');
    const controller = new AbortController();
    const compressed = new Map<number, Blob>();
    const decoded = new Map<number, DecodedFrame>();
    const fetching = new Set<number>(), decoding = new Set<number>();
    const failedFetches = new Set<number>(), failedDecodes = new Set<number>();
    // Low-cost overview frames support large scroll jumps while nearby full
    // sequences decode. Compressed assets total ~4 MB; decoded pixels are bounded.
    const anchors = new Set([0, 60, 120, 180, 240, FRAME_COUNT - 1]);
    let disposed = false, activeFetches = 0, activeDecodes = 0;
    let target = 0, direction = 1, painted = -1, raf = 0;
    let width = 1, height = 1, sectionTop = 0, scrollDistance = 1;
    let visible = true, needsResize = true, needsPaint = true, shown = false;

    function schedule() {
      if (!disposed && !raf && !document.hidden) raf = requestAnimationFrame(render);
    }
    function updateGeometry() {
      const box = stage.getBoundingClientRect();
      width = Math.max(1, box.width); height = Math.max(1, box.height);
      // No benefit in rendering these 848px source images at a huge DPR.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      context!.setTransform(dpr, 0, 0, dpr, 0, 0);
      context!.imageSmoothingEnabled = true;
      context!.imageSmoothingQuality = 'high';
      sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const sticky = section.querySelector<HTMLElement>('.sequence-sticky')!;
      scrollDistance = Math.max(1, section.offsetHeight - sticky.offsetHeight);
      needsResize = false; needsPaint = true;
    }
    function desiredFrames() {
      if (reduced.matches) return [0];
      return frameWindow(target, FRAME_COUNT, mobile.matches ? 10 : 18, direction);
    }
    function evict() {
      const keep = new Set([...desiredFrames(), ...anchors, target, painted]);
      for (const [index, image] of decoded) {
        if (!keep.has(index)) { image.release(); decoded.delete(index); }
      }
    }
    async function decode(index: number, blob: Blob): Promise<DecodedFrame> {
      if ('createImageBitmap' in window) {
        try {
          const bitmap = await createImageBitmap(blob);
          return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
        } catch { /* Safari/older browsers can use an asynchronously decoded image. */ }
      }
      const url = URL.createObjectURL(blob);
      try {
        const image = new Image(); image.decoding = 'async'; image.src = url;
        await image.decode();
        return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => { image.src = ''; } };
      } finally { URL.revokeObjectURL(url); }
    }
    function pumpDecode() {
      if (disposed || document.hidden || (!visible && shown)) return;
      const wanted = [...new Set([...desiredFrames(), ...(reduced.matches ? [] : anchors)])];
      for (const index of wanted) {
        if (activeDecodes >= 2) break;
        const blob = compressed.get(index);
        if (!blob || decoded.has(index) || decoding.has(index) || failedDecodes.has(index)) continue;
        decoding.add(index); activeDecodes++;
        void decode(index, blob).then(image => {
          if (disposed) { image.release(); return; }
          decoded.set(index, image); evict(); needsPaint = true; schedule();
        }).catch(() => { if (!disposed) failedDecodes.add(index); }).finally(() => {
          decoding.delete(index); activeDecodes--;
          if (!disposed) { pumpDecode(); updateLoading(); }
        });
      }
    }
    function pumpFetch() {
      if (disposed || document.hidden || (!visible && shown)) return;
      const ordered = [...new Set([...desiredFrames(), ...(reduced.matches ? [] : anchors),
        ...(reduced.matches ? [] : Array.from({ length: FRAME_COUNT }, (_, index) => index))])];
      for (const index of ordered) {
        if (activeFetches >= 6) break;
        if (compressed.has(index) || fetching.has(index) || failedFetches.has(index)) continue;
        fetching.add(index); activeFetches++;
        void fetch(frameURL(index), { signal: controller.signal, cache: 'force-cache' })
          .then(response => { if (!response.ok) throw new Error('Frame unavailable'); return response.blob(); })
          .then(blob => { if (!disposed) { compressed.set(index, blob); pumpDecode(); } })
          .catch(() => { if (!disposed) failedFetches.add(index); })
          .finally(() => {
            fetching.delete(index); activeFetches--;
            if (!disposed) { updateLoading(); pumpFetch(); }
          });
      }
    }
    function updateLoading() {
      if (disposed) return;
      canvas.dataset.loadedFrames = String(compressed.size);
      canvas.dataset.cachedFrames = String(decoded.size);
      if (shown) return;
      const status = statusRef.current;
      if (status && activeFetches === 0 && activeDecodes === 0 && decoded.size === 0 && failedFetches.size + failedDecodes.size > 0) {
        status.textContent = 'The still preview is available. You can continue exploring below.';
      }
    }
    function render() {
      raf = 0;
      if (disposed || document.hidden) return;
      if (needsResize) updateGeometry();
      const progress = reduced.matches ? 0 : Math.max(0, Math.min(1, (window.scrollY - sectionTop) / scrollDistance));
      const next = progressToFrame(progress, FRAME_COUNT);
      if (next !== target) { direction = next > target ? 1 : -1; target = next; needsPaint = true; evict(); }
      canvas.dataset.targetFrame = String(target + 1);
      section.style.setProperty('--sequence-intro-opacity', String(1 - Math.min(1, progress / .22)));
      section.style.setProperty('--sequence-outro-opacity', String(Math.max(0, (progress - .82) / .18)));
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
      const index = decoded.has(target) ? target : nearestFrame(target, decoded.keys());
      if (index !== undefined && (index !== painted || needsPaint)) {
        const image = decoded.get(index)!;
        const rect = imageFit(image.width, image.height, width, height, mobile.matches);
        context!.fillStyle = '#102a20'; context!.fillRect(0, 0, width, height);
        context!.drawImage(image.source, rect.x, rect.y, rect.width, rect.height);
        painted = index; needsPaint = false;
        canvas.dataset.frame = String(index + 1);
        if (!shown) {
          shown = true; canvas.style.opacity = '1';
          if (statusRef.current) statusRef.current.hidden = true;
        }
      }
      // Lenis already eases document scrolling. A second interpolation loop would
      // introduce lag. Paint the actual scroll position, at most once per RAF.
      pumpFetch(); pumpDecode();
    }
    const onScroll = () => { if (visible) schedule(); };
    const onResize = () => { needsResize = true; schedule(); };
    const onVisibility = () => { if (!document.hidden) { schedule(); pumpFetch(); pumpDecode(); } };
    const observer = new ResizeObserver(onResize);
    observer.observe(stage); observer.observe(section);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { needsResize = true; schedule(); pumpFetch(); pumpDecode(); }
    }, { rootMargin: '200px 0px' });
    intersection.observe(section);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', onResize);
    mobile.addEventListener('change', onResize);
    schedule(); pumpFetch();
    return () => {
      disposed = true; controller.abort(); cancelAnimationFrame(raf);
      observer.disconnect(); intersection.disconnect();
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', onResize); mobile.removeEventListener('change', onResize);
      decoded.forEach(image => image.release()); decoded.clear(); compressed.clear();
    };
  }, []);

  return (
    <section id="home" className="sequence-hero" ref={sectionRef} aria-labelledby="sequence-title">
      <div className="sequence-sticky">
        <div className="sequence-stage" ref={stageRef}>
          <img className="sequence-poster" src={frameURL(0)} alt="TWS interior design: a warm, light-filled living room with natural timber finishes" fetchPriority="high" decoding="async" />
          <canvas ref={canvasRef} className="sequence-canvas" aria-hidden="true" />
        </div>
        <div className="sequence-shade" />
        <div className="sequence-heading">
          <span className="eyebrow">TWS Infrasture · Architecture & interiors</span>
          <div className="sequence-intro">
            <h1 id="sequence-title">A vision.<br/><span>Brought to life.</span></h1>
            <p>Thoughtfully designed. Beautifully lived.</p>
          </div>
          <p className="sequence-outro" aria-hidden="true">Every detail.<br/>A new possibility.</p>
        </div>
        <div className="sequence-bottom">
          <span className="sequence-scroll"><ArrowDown size={16}/><span className="sequence-scroll-label">Scroll to explore</span><span className="sequence-static-label">Designed around you</span></span>
          <span ref={statusRef} className="sequence-loading" role="status">Preparing the experience…</span>
          <a className="sequence-next" href="#work">Explore our work <ArrowUpRight size={18}/></a>
        </div>
        <div className="sequence-progress" aria-hidden="true"><div ref={progressRef}/></div>
      </div>
    </section>
  );
}
