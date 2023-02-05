import { Content } from 'snoots';

import { Middleware, Next } from '../poll/asyncPollMiddleware';

/**
 * Restrict values to keys of properties of a given type
 * @internal
 */
type KeysOfType<T, KT> = {
	[K in keyof T]: T[K] extends KT ? K : never;
}[keyof T];

/**
 * Middleware generator that filters out content not passing a Regex test
 * @group Middleware
 * @param identifier Key of property where property is of type `string`, against which to test the regular expression
 * @param expression RegExp against which to test a property
 * @returns Function to be used as middleware
 */
export function matchRegex<T extends Content>(
	identifier: KeysOfType<T, string>,
	expression: RegExp
): Middleware<T> {
	return (context: T, next: Next): boolean | Promise<boolean> => {
		if (expression.test(context[identifier] as string)) return next();
		return false;
	};
}
