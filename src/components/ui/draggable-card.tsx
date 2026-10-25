import {type ReactNode, type RefObject} from 'react';
import {cn} from '@/lib/utils';

// Static card shells: movement is controlled only by the portfolio's scroll animation.
export function DraggableCardBody({className,children}:{className?:string;children:ReactNode}) {
 return <div className={cn('draggable-card',className)}>{children}</div>;
}
export function DraggableCardContainer({children,className,containerRef}:{children:ReactNode;className?:string;containerRef?:RefObject<HTMLDivElement|null>}) {
 return <div ref={containerRef} className={cn('draggable-container',className)}>{children}</div>;
}
