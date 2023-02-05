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
 * @interal
 */
export class SnootsListingPoll<
	T extends Content
> extends AsyncPollMiddleware<T> {
	/**
	 * Function with which new items are fetched
	 * @internal
	 */
	private getter: () => Listing<T>;

	constructor(options: IAsyncPollOptions, getter: () => Listing<T>) {
		super(options);
		this.getter = getter;
	}

	/** @internal */
	async pollFunction() {
		const batch = this.getter();
		const newItems: T[] = [];
		for await (const item of batch) {
			if (await this.dispatch(item)) {
				newItems.push(item);
				this.emit('item', item);
			}
		}
		this.emit('listing', newItems);
	}
}
