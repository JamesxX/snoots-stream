/** @internal */
interface IQueue<T> {
	enqueue(item: T): void;
	dequeue(): T | undefined;
	size(): number;
}

/** @internal */
export class limitedQueue<T> implements IQueue<T> {
	private storage: T[] = [];

	constructor(private capacity: number = Infinity) {}

	enqueue(item: T): void {
		if (this.size() === this.capacity) this.dequeue();
		this.storage.push(item);
	}

	dequeue(): T | undefined {
		return this.storage.shift();
	}

	size(): number {
		return this.storage.length;
	}

	has(item: T) {
		return this.storage.indexOf(item) != -1;
	}
}
