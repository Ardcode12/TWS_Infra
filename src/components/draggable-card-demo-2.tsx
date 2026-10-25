import {useRef,useState,useEffect} from 'react';
import {motion,useScroll,useTransform,useReducedMotion} from 'motion/react';
import {DraggableCardBody,DraggableCardContainer} from '@/components/ui/draggable-card';
import {projects,type Project} from '@/data';
import {ArrowUpRight,MoveHorizontal,MoveVertical} from 'lucide-react';

function PortfolioCard({project,index,mobile,onOpen}:{project:Project;index:number;mobile:boolean;onOpen:(project:Project)=>void}) {
 const ref=useRef<HTMLDivElement>(null);
 const reduced=useReducedMotion();
 const {scrollYProgress}=useScroll({target:ref,offset:['start end','start 45%']});
 const y=useTransform(scrollYProgress,[0,1],[-45,0]);
 const opacity=useTransform(scrollYProgress,[0,.7],[.35,1]);
 return <div ref={ref} className="card-tilt" style={{rotate:`${(mobile?[-3,3,-2,3,-3,2,-2]:[-5,4,-3,5,-4,3,-2])[index]}deg`}}>
  <motion.div style={{y:mobile&&!reduced?y:0,opacity:mobile&&!reduced?opacity:1}}>
   <DraggableCardBody><img src={project.image} alt={`${project.name} architectural inspiration`} loading="lazy" draggable={false}/><div className="drag-caption"><div><span>{project.type}</span><h3>{project.name}</h3></div><button className="round-link" aria-label={`View ${project.name}`} onClick={()=>onOpen(project)}><ArrowUpRight size={21}/></button></div></DraggableCardBody>
  </motion.div>
 </div>;
}
export default function DraggableCardDemo({onOpen}:{onOpen:(project:Project)=>void}){
 const section=useRef<HTMLElement>(null),track=useRef<HTMLDivElement>(null);
 const [distance,setDistance]=useState(0);
 const [mobile,setMobile]=useState(()=>window.matchMedia('(max-width:768px)').matches);
 const reduced=useReducedMotion();
 const {scrollYProgress}=useScroll({target:section,offset:['start start','end end']});
 const x=useTransform(scrollYProgress,[0,1],[0,-distance]);
 useEffect(()=>{const query=window.matchMedia('(max-width:768px)');const update=()=>setMobile(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 useEffect(()=>{const measure=()=>{if(track.current)setDistance(Math.max(0,track.current.scrollWidth-window.innerWidth+100));};measure();const observer=new ResizeObserver(measure);if(track.current)observer.observe(track.current);window.addEventListener('resize',measure);return()=>{observer.disconnect();window.removeEventListener('resize',measure);};},[]);
 return <section ref={section} className={`work-scroll ${reduced?'reduced':''}`} id="work" aria-labelledby="work-heading"><div className="work-sticky"><div className="section-top"><span className="eyebrow">A collection of possibilities</span><span className="small-note">Concept portfolio / 2026</span></div><div className="work-heading" data-aos="fade-up" data-aos-offset="30"><h2 id="work-heading">Good spaces.<br/><em>Great possibilities.</em></h2><p>Explore the ideas that shape our approach.<br/><span>{mobile?<MoveVertical size={17}/>:<MoveHorizontal size={17}/>} Scroll to explore the collection.</span></p></div><DraggableCardContainer><motion.div ref={track} className="card-track" style={{x:reduced||mobile?0:x}}>{projects.map((project,index)=><PortfolioCard key={project.id} project={project} index={index} mobile={mobile} onOpen={onOpen}/>)}</motion.div></DraggableCardContainer><div className="work-bottom"><span>Architecture. Interiors. Everything in between.</span></div><motion.div className="work-progress" style={{scaleX:scrollYProgress}}/></div></section>;
}
