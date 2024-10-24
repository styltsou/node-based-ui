// Simple PriorityQueue implementation
export class PriorityQueue<T> {
  private elements: { element: T; priority: number }[] = [];

  enqueue(element: T, priority: number): void {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.elements.shift()?.element;
  }

  isEmpty(): boolean {
    return this.elements.length === 0;
  }
}
