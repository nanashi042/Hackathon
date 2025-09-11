export type AnalysisAdviceEvent = {
  source: 'image' | 'video';
  summary?: string;
  advice?: string;
};

type Subscriber = (event: AnalysisAdviceEvent) => void;

class SimpleBus {
  private subscribers: Set<Subscriber> = new Set();

  subscribe(fn: Subscriber) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  publish(event: AnalysisAdviceEvent) {
    for (const fn of this.subscribers) fn(event);
  }
}

export const analysisBus = new SimpleBus();



