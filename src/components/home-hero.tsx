import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

export default function HomeHero() {
  const reduced = useReducedMotion();
  return (
    <section className="hero" id="home" aria-labelledby="home-title">
      <div className="hero-top">
        <span className="eyebrow">Architecture · Construction · Interiors</span>
        <span className="hero-tag"><span /> Considered spaces. Lasting impact.</span>
      </div>
      <div className="hero-heading">
        <motion.h1 id="home-title" initial={reduced ? false : { opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, ease: [.22, 1, .36, 1] }}>
          Built around<br /><span>possibility.</span>
        </motion.h1>
        <motion.div className="hero-intro" initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .2 }}>
          <p>Thoughtful design. Purposeful construction.<br />Spaces that bring your vision to life.</p>
          <a className="text-link" href="#work">Explore our work <ArrowUpRight size={21} /></a>
        </motion.div>
      </div>
      <div className="hero-photo">
        <motion.img src="/images/hero.jpg" alt="Contemporary interior with a sculptural staircase, natural timber and garden views" fetchPriority="high" initial={reduced ? false : { scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: 'easeOut' }} />
        <div className="hero-photo-shade" />
        <div className="hero-photo-caption"><span>The Courtyard House</span><span>Residential design concept</span></div>
        <a href="#work" className="scroll-circle" aria-label="Scroll to projects"><ArrowDown size={24} /></a>
        <div className="hero-photo-label">A little closer<br />to your vision.</div>
      </div>
      <div className="hero-bottom"><span>Design with intention. Build with care.</span><span>Explore what comes next <ArrowDown size={14} /></span></div>
    </section>
  );
}
