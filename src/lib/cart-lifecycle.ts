export function cartFailurePolicy(status: number, code?: string) {
  // Transient failures must not erase the only reference to a persisted cart.
  if (status === 404 || code === "cart_completed") return "retire";
  if (status === 401 || status === 403) return "isolate";
  return "preserve";
}

export class SerialQueue {
  private tail: Promise<unknown> = Promise.resolve();
  run<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.tail.then(operation, operation);
    this.tail = next.catch(() => undefined);
    return next;
  }
}
