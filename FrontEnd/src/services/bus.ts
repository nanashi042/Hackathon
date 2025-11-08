export type AnalysisAdviceEvent = {
  source: 'image' | 'video';
  summary?: string;
  advice?: string;
};

type Subscriber = (event: AnalysisAdviceEvent) => void;

class SimpleBus {
  private subscribers: Set<Subscriber> = new Set();
  private lastEvent: AnalysisAdviceEvent | null = null;

  subscribe(fn: Subscriber) {
    this.subscribers.add(fn);
    // Immediately replay the last event to late subscribers (e.g., after navigation)
    if (this.lastEvent) {
      try { fn(this.lastEvent); } catch {}
    }
    return () => this.subscribers.delete(fn);
  }

  publish(event: AnalysisAdviceEvent) {
    this.lastEvent = event;
    for (const fn of this.subscribers) fn(event);
  }
}

export const analysisBus = new SimpleBus();



