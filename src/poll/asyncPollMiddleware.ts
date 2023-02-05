import CallableInstance from 'callable-instance';

import { AsyncPoll, IAsyncPollOptions } from './asyncPoll';

export type Next = () => boolean | Promise<boolean>;
export type Middleware<T> = (
	context: T,
	next: Next
) => Promise<boolean> | boolean;

export abstract class AsyncPollMiddleware<T> extends AsyncPoll {
	private middlewares: Middleware<T>[] = [];

	constructor(options: IAsyncPollOptions) {
		super(options);
	}

	public use(...mw: Middleware<T>[]): void {
		this.middlewares.push(...mw);
	}

	protected dispatch(context: T): Promise<boolean> {
		return this.invokeMiddlewares(context, this.middlewares);
	}

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

export abstract class MiddlewareClass<T> extends CallableInstance<
	[T, Next],
	boolean | Promise<boolean>
> {
	constructor() {
		super('method');
	}
	abstract method(context: T, next: Next): Promise<boolean> | boolean;
}
