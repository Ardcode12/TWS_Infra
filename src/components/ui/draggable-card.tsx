'use client';
// Adapted from Aceternity UI draggable-card, by Manu Arora.
// Source: https://ui.aceternity.com/registry/draggable-card.json
// Local additions: bounded drag, accessible move controls, touch scrolling,
// reduced-motion support, and reset state. Removed disconnected inertia animations.
import {useRef, useState, type ReactNode, type RefObject} from 'react';
import {motion, useMotionValue, useSpring, useTransform, useReducedMotion, animate} from 'motion/react';
import {cn} from '@/lib/utils';
import {ArrowLeft, ArrowRight, RotateCcw} from 'lucide-react';
export function DraggableCardBody({className,children,label,resetKey=0}: {className?:string;children:ReactNode;label:string;resetKey?:number}) {
 return <Card key={resetKey} className={className} label={label}>{children}</Card>;
}
function Card({className,children,label}:{className?:string;children:ReactNode;label:string}) {
 const cardRef=useRef<HTMLDivElement>(null);const reduced=useReducedMotion();const [moving,setMoving]=useState(false);
 const mouseX=useMotionValue(0),mouseY=useMotionValue(0),x=useMotionValue(0),y=useMotionValue(0);
 const spring={stiffness:160,damping:24,mass:.5};
 const rotateX=useSpring(useTransform(mouseY,[-200,200],[10,-10]),spring);
 const rotateY=useSpring(useTransform(mouseX,[-200,200],[-10,10]),spring);
 const glareOpacity=useSpring(useTransform(mouseX,[-200,0,200],[.15,0,.15]),spring);
 const move=(direction:number)=>animate(x,Math.max(-80,Math.min(80,x.get()+direction*30)),{duration:reduced?0:.25});
 return <motion.div ref={cardRef} className={cn('draggable-card',className)} drag={reduced?false:'x'} dragConstraints={{left:-80,right:80}} dragElastic={.12} dragMomentum={false} onDragStart={()=>setMoving(true)} onDragEnd={()=>setMoving(false)} style={{x,y,rotateX:reduced?0:rotateX,rotateY:reduced?0:rotateY,zIndex:moving?20:1,touchAction:'pan-y'}} whileDrag={{scale:1.035,cursor:'grabbing'}} whileHover={reduced?undefined:{scale:1.02}} onPointerMove={e=>{if(e.pointerType!=='mouse'||reduced)return;const r=cardRef.current!.getBoundingClientRect();mouseX.set(e.clientX-r.left-r.width/2);mouseY.set(e.clientY-r.top-r.height/2);}} onPointerLeave={()=>{mouseX.set(0);mouseY.set(0);}}>
 {children}<motion.div className="card-glare" style={{opacity:glareOpacity}}/>
 <div className="card-controls" onPointerDown={e=>e.stopPropagation()}><span>Drag to explore</span><button aria-label={`Move ${label} left`} onClick={()=>move(-1)}><ArrowLeft size={14}/></button><button aria-label={`Reset ${label} position`} onClick={()=>{animate(x,0,{duration:reduced?0:.25});animate(y,0);}}><RotateCcw size={13}/></button><button aria-label={`Move ${label} right`} onClick={()=>move(1)}><ArrowRight size={14}/></button></div>
 </motion.div>;
}
export function DraggableCardContainer({children,className,containerRef}:{children:ReactNode;className?:string;containerRef?:RefObject<HTMLDivElement|null>}){return <div ref={containerRef} className={cn('draggable-container',className)}>{children}</div>;}
