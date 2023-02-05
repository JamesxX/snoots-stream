import { Content } from 'snoots';

import { MiddlewareClass, Next } from '../poll/asyncPollMiddleware';

/**
 * Middleware that discards any items created before the middleware's creation
 * @group Middleware
 */
export class skipExisting<T extends Content> extends MiddlewareClass<T> {
	private dateTime = Date.now() / 1000;

	/** @internal */
	method(context: T, next: Next): boolean | Promise<boolean> {
		if (context.createdUtc < this.dateTime) return false;
		return next();
	}
}
