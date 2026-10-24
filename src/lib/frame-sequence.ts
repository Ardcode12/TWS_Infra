/** Small, testable helpers for the scroll renderer. No timers or DOM state here. */
export function progressToFrame(progress: number, count: number): number {
  return Math.round(Math.max(0, Math.min(1, progress)) * Math.max(0, count - 1));
}

/** Prioritise the requested frame, then its neighbours in the direction of travel. */
export function frameWindow(target: number, count: number, radius: number, direction = 1): number[] {
  const result: number[] = [];
  for (let distance = 0; distance <= radius; distance++) {
    const candidates = distance === 0 ? [target] : [target + distance * direction, target - distance * direction];
    for (const index of candidates) if (index >= 0 && index < count) result.push(index);
  }
  return result;
}

export function nearestFrame(target: number, available: Iterable<number>): number | undefined {
  let closest: number | undefined;
  for (const index of available) {
    if (closest === undefined || Math.abs(index - target) < Math.abs(closest - target)) closest = index;
  }
  return closest;
}

export function imageFit(sourceWidth: number, sourceHeight: number, width: number, height: number, contain: boolean) {
  const scale = (contain ? Math.min : Math.max)(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale, drawHeight = sourceHeight * scale;
  return { x: (width - drawWidth) / 2, y: (height - drawHeight) / 2, width: drawWidth, height: drawHeight };
}
