import { Content } from 'snoots';

import { MiddlewareClass, Next } from '../poll/asyncPollMiddleware';
import { limitedQueue } from '../structures/limitedQueue';

/**
 * Middleware that discards content that has already been processed. Content is considered
 * new if it has a unique value for the given property. Values are stored in a limited queue
 * with a default size of infinity. Bounding this limited queue is recommended as it is
 * essentially a memory leak.
 * @group Middleware
 */
export class skipDuplicates<
	T extends Content,
	U extends keyof T
> extends MiddlewareClass<T> {
	/** @internal */
	private processed: limitedQueue<T[U]>;

	/**
	 * @param identifier Key of the property to be considered unique
	 * @param bound Optional bound to limited queue. Only leave it set to infinity if your app
	 * is regularly restarted
	 */
	constructor(private identifier: U, bound = Infinity) {
		super();
		this.processed = new limitedQueue<T[U]>(bound);
	}

	/** @internal */
	method(context: T, next: Next): boolean | Promise<boolean> {
		const id = context[this.identifier];

		// Do not continue for any already processed items
		if (this.processed.has(id)) return false;

		this.processed.enqueue(id);

		return next();
	}
}
