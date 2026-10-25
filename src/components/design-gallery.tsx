import {useEffect, useRef, useState} from 'react';
import {motion, useReducedMotion} from 'motion/react';
import {ArrowLeft, ArrowUpRight, Check, Plus, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '@/components/ui/dialog';
import {designs, roomCategories, type Design, type RoomCategory} from '@/designs';

type Props = {selectedIds: string[]; onToggle: (id: string) => void; onPreviewChange: (open: boolean) => void};
export default function DesignGallery({selectedIds, onToggle, onPreviewChange}: Props) {
  const [category, setCategory] = useState<RoomCategory | null>(null);
  const [preview, setPreview] = useState<Design | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const reduced = useReducedMotion();
  const categoryButtons = useRef<Partial<Record<RoomCategory, HTMLButtonElement | null>>>({});
  const lastCategory = useRef<RoomCategory | null>(null);
  const resultsHeading = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (category) resultsHeading.current?.focus({preventScroll:true});
    else if (lastCategory.current) categoryButtons.current[lastCategory.current]?.focus({preventScroll:true});
  }, [category]);
  const visible = designs.filter(d => d.category === category);
  return <section className="portfolio section-pad design-gallery" id="projects">
    <div data-aos="fade-up">
      <div className="section-top"><span className="eyebrow">Explore the collection</span><span className="small-note">Design inspiration</span></div>
      <div className="split-heading"><h2>A place for<br/><em>every possibility.</em></h2>
        <p className="category-introduction">Start with a space.<br/>Find a design that feels like you.</p>
      </div>
      <div className="gallery-intro"><p>{category ? `Explore our ${category.toLowerCase()} ideas. Click a design to see more.` : 'Choose a category below to explore its designs.'}</p><span role="status">{category ? `${visible.length} designs` : `${roomCategories.length} categories`} · {selectedIds.length} selected</span></div>
    </div>
    {!category ? <div className="room-category-grid">
      {roomCategories.map(room => {
        const samples = designs.filter(d => d.category === room);
        return <button key={room} ref={node => {categoryButtons.current[room] = node;}} className="room-category-card" aria-label={`Explore ${room} designs`} onClick={() => {lastCategory.current = room; setCategory(room);}}>
          <div className="room-category-image"><img src={samples[0].image} alt={`${room} design inspiration`} loading="lazy" width="900" height="1000"/></div>
          <div className="room-category-label"><div><h3>{room}</h3><span>{samples.length} designs to explore</span></div><span className="room-category-arrow"><ArrowUpRight size={23}/></span></div>
        </button>;
      })}
    </div> : <>
    <div className="category-results-heading"><Button variant="ghost" className="category-back" onClick={() => setCategory(null)}><ArrowLeft size={18}/> All categories</Button><h3 ref={resultsHeading} tabIndex={-1}>{category} designs</h3><span>Choose your favourites</span></div>
    <div className="project-grid">
      {visible.map(design => <motion.article key={design.id} className="design-option" initial={reduced ? false : {opacity:0, y:16}} animate={{opacity:1, y:0}} transition={{duration:.3}}>
        <button className="project-card design-preview" aria-label={`Preview ${design.name}`} onClick={event => {opener.current = event.currentTarget; setPreview(design); onPreviewChange(true);}}>
          <div className="project-image"><img src={design.image} alt={`${design.name} — ${design.category.toLowerCase()} inspiration`} loading="lazy" width="1200" height="1000"/><span className="project-open"><ArrowUpRight size={26}/></span>{selectedIds.includes(design.id) && <span className="design-saved"><Check size={14}/> Selected</span>}</div>
          <div className="project-info"><h3>{design.name}</h3><span>{design.category}</span></div>
        </button>
        <button className="design-select" aria-pressed={selectedIds.includes(design.id)} aria-label={`${selectedIds.includes(design.id) ? 'Remove' : 'Select'} ${design.name}`} onClick={() => onToggle(design.id)}>{selectedIds.includes(design.id) ? <Check size={17}/> : <Plus size={17}/>} {selectedIds.includes(design.id) ? 'Selected · remove' : 'Select this design'}</button>
      </motion.article>)}
    </div>
    </>}
    {selectedIds.length > 0 && <div className="design-shortlist"><div><span className="eyebrow">Your design shortlist</span><div className="design-chips">{designs.filter(d => selectedIds.includes(d.id)).map(d => <button key={d.id} onClick={() => onToggle(d.id)} aria-label={`Remove ${d.name} from shortlist`}>{d.name}<X size={14}/></button>)}</div></div><a href="#contact" className="text-link">Use these in my enquiry <ArrowUpRight size={20}/></a></div>}
    <p className="portfolio-note">Sample inspiration, not completed TWS projects. We’ll adapt your chosen direction to your space.</p>
    <Dialog open={!!preview} onOpenChange={open => {if (!open) {setPreview(null); onPreviewChange(false);}}}>
      <DialogContent className="project-dialog design-dialog" onCloseAutoFocus={event => {event.preventDefault(); opener.current?.focus({preventScroll:true});}}>
        {preview && <><img src={preview.image} alt={preview.name} className="dialog-image"/><DialogHeader><span className="eyebrow">{preview.category} · Sample inspiration</span><DialogTitle>{preview.name}</DialogTitle><DialogDescription>{preview.description}</DialogDescription></DialogHeader><Button className="dialog-cta" aria-pressed={selectedIds.includes(preview.id)} onClick={() => onToggle(preview.id)}>{selectedIds.includes(preview.id) ? <><Check size={18}/> Selected · remove from shortlist</> : <><Plus size={18}/> Select this design</>}</Button><p className="design-preview-hint" role="status">{selectedIds.length} {selectedIds.length === 1 ? 'design' : 'designs'} in your shortlist. Close to keep exploring.</p></>}
      </DialogContent>
    </Dialog>
  </section>;
}
