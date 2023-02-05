<div id="top"></div>

Snoots Stream is an event-based wrapper for [Snoots](https://github.com/thislooksfun/snoots), following much of the design decisions of [Snoostorm](https://github.com/MayorMonty/snoostorm). It handles polling certain Snoots functions for you to make designing Reddit bots and applications easier.

## Install

You can install Snoots Stream from NPM using the command below:

```
npm install snoots-stream
```

<p align="right">(<a href="#top">back to top</a>)</p>

## Usage

Let's get started with a simple example

```typescript
import { Client } from 'snoots';

import { skipDuplicates, skipExisting } from './middlewares';

import { CommentStream } from '.';

// Instantiate a Snoots client (or re-use one)
const client = new Client({...})

// Create a comment stream that fetches comments from r/AskReddit ever 5000ms
const comments = new CommentStream( client, { frequency: 5000 }, 'AskReddit' );

// Add middleware (more on that later)
comments.use(new skipExisting(), new skipDuplicates('id'));

// For every comment, log it to the console
comments.on('item', console.log)
```

The above example makes use of the `CommentStream` class, but the same could have been done for `SubmissionStream`. When more features become available in the snoots library, more streams will be added (such as modmail, modlog, reported content, and so on).

<p align="right">(<a href="#top">back to top</a>)</p>

## Custom polls

If you want to implement new polling classes, it is relatively simple. The `SubmissionStream` class is shown below as an example

```typescript
import { Client, Post } from 'snoots';

import { IAsyncPollOptions } from '../poll/asyncPoll';
import { SnootsListingPoll } from '../poll/snootsListingPoll';

// Ensure that the class correctly extends SnootsListingPoll, with the type of object that the listing returns
export class SubmissionStream extends SnootsListingPoll<Post> {
	constructor(client: Client, options: IAsyncPollOptions, subreddit: string) {
		// ---v--- This is the import line
		super(options, () => client.subreddits.getNewPosts(subreddit));
	}
}
```

As you can see, all it took was passing a function that calls `client.subreddits.getNewPosts`, and the rest of the work is done behind the scenes.

<p align="right">(<a href="#top">back to top</a>)</p>

## Middleware

A limitation of the SnooStorm library is its rigidity in filtering content that is returned. By default, it discards content that has already been processed (which is the correct thing to do 99% of the time), and leaves any further processing such as discarding already-existing content to the end developer.

By implementing a middleware paradigm, Snoots-Stream can cover all use-cases while still being plug-and-play. Suppose you want to discard comments that don't pass a Regex test? All you'd need to do is pass that middleware in

```typescript
import {matchRegex} from './middlewares'

// Create comment stream, as above
const const comments = ...

// Add middleware
comments.use(matchRegex('body', /^[1-9]\d{0,2}$/g))

// Now we are only logging comments that match the regex
comments.on('item', console.log)
```

Custom middleware is equally easy to create, and can take one of three forms: middleware, middleware generator function, or middleware class. The regex example is a middleware generator function, and the above `discardExisting` is a middleware class.

Example middleware that logs whatever it sees (any middleware above it might stop a comment from being logged, though!)

```typescript
export function loggingMiddleware<T>(
	context: T,
	next: Next
): boolean | Promise<boolean> {
	console.log(context);
	return next();
}
comments.use(loggingMiddleware);
```

or as a class (not necessary in this case, but just as an example)

```typescript
export class loggingMiddleware<T extends Content> extends MiddlewareClass<T> {
	method(context: T, next: Next): boolean | Promise<boolean> {
		console.log(context);
		return next();
	}
}
comments.use(new loggingMiddleware());
```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the GPL-3.0-only License. See [LICENSE.md](https://github.com/jamesxx/gort/blob/master/LICENSE.md) for more information.

<p align="right">(<a href="#top">back to top</a>)</p>
