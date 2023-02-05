import CallableInstance from 'callable-instance';

import { AsyncPoll, IAsyncPollOptions } from './asyncPoll';

export type Next = () => boolean | Promise<boolean>;
export type Middleware<T> = (
	context: T,
	next: Next
) => Promise<boolean> | boolean;

export abstract class AsyncPollMiddleware<T> extends AsyncPoll {

	/** @internal */
	private middlewares: Middleware<T>[] = [];

	/** @internal */
	constructor(options: IAsyncPollOptions) { super(options); }

	/**
	 * Add additional middleware to the content stream.
	 * @param mw an expanded list of middlewares to add to the content stream
	 */
	public use(...mw: Middleware<T>[]): void {
		this.middlewares.push(...mw);
	}

	/**
	 * @internal
	 * @param context The item on which to act
	 * @returns `false` to discard the item, or `true`
	 */
	protected dispatch(context: T): Promise<boolean> {
		return this.invokeMiddlewares(context, this.middlewares);
	}

	/**
	 * @internal
	 * @param context The item on which to act
	 * @param middlewares An array of middlewares to call
	 * @returns `false` to discard the item, or `true`
	 */
	private async invokeMiddlewares(
		context: T,
		middlewares: Middleware<T>[]
	): Promise<boolean> {
		if (!middlewares.length) return true;
		const mw = middlewares[0];
		return mw(context, async () => {
			return await this.invokeMiddlewares(context, middlewares.slice(1));
		});
	}
}

/**
 * This is the base class for middlewares that take the form of a class. Member variables
 * can be stored on classes that extend this to store information between polls (such as
 * in the case of {@link skipDuplicates}, where a record is kept of already processed
 * content).
 * 
 * By overriding {@link MiddlewareClass.method}, you can provide your own functionality.
 */
export abstract class MiddlewareClass<T> extends CallableInstance<
	[T, Next],
	boolean | Promise<boolean>
> {
	/** @internal */
	constructor() { super('method'); }

	/**
	 * Override this function to provide the desired feature. This function is called for
	 * each new item returned by a polled function.
	 * @param context The item to act upon
	 * @param next The `next` function. Call and return the result to continue the middleware chain.
	 * @return Return either the result of the next function, `false` to stop all middleware and discard
	 * the item, or `true` to stop all middleware but still emit the item.
	 */
	abstract method(context: T, next: Next): Promise<boolean> | boolean;
}
