import { Content, Listing } from 'snoots';

import { IAsyncPollOptions } from './asyncPoll';
import { AsyncPollMiddleware } from './asyncPollMiddleware';

// Event Typing
interface PollEvents<T> {
	item: (item: T) => void;
	listing: (items: T[]) => void;
	end: () => void;
}

export interface SnootsListingPoll<T extends Content> {
	on<U extends keyof PollEvents<T>>(event: U, listener: PollEvents<T>[U]): this;
	once<U extends keyof PollEvents<T>>(
		event: U,
		listener: PollEvents<T>[U]
	): this;
	off<U extends keyof PollEvents<T>>(
		event: U,
		listener: PollEvents<T>[U]
	): this;
}

/**
 * Base class for content streams
 * @internal
 */
export class SnootsListingPoll<
	T extends Content
> extends AsyncPollMiddleware<T> {
	/** @internal */
	constructor(options: IAsyncPollOptions, private getter: () => Listing<T>) {
		super(options);
	}

	/** @internal */
	async pollFunction() {
		const batch = this.getter();
		const newItems: T[] = [];

		for await (const item of batch) {
			// Run the middleware, and discard if it returns `false`
			if (!(await this.dispatch(item))) continue;

			// Add the item to the list of new items, and emit
			newItems.push(item);
			this.emit('item', item);
		}

		// Emit the list of recently newly processed items
		this.emit('listing', newItems);
	}
}
