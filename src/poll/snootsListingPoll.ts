import { Content, Listing } from 'snoots';

import { IAsyncPollOptions } from './asyncPoll';
import { AsyncPollMiddleware } from './asyncPollMiddleware';

export interface SnootsListingPoll<T extends Content> {
	on(event: 'item', listener: (item: T) => void): this;
	on(event: 'listing', listener: (items: T[]) => void): this;
	on(event: 'end', listener: () => void): this;

	once(event: 'item', listener: (item: T) => void): this;
	once(event: 'listing', listener: (items: T[]) => void): this;
	once(event: 'end', listener: () => void): this;

	off(event: 'item', listener: (item: T) => void): this;
	off(event: 'listing', listener: (items: T[]) => void): this;
	off(event: 'end', listener: () => void): this;
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
