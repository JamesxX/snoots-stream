import { Client, Post } from 'snoots';

import { IAsyncPollOptions } from '../poll/asyncPoll';
import { SnootsListingPoll } from '../poll/snootsListingPoll';

/**
 * Use this class to poll for submissions on a subreddit. By default, a large
 * quantity of recent submissions will be returned initially (to prevent this,
 * use the {@link skipExisting} middleware). Additionally, there will be repetition
 * between polls of returned submissions (to prevent this, use the {@link skipDuplicates}
 * middleware). This wrapper will poll for submissions at a given frequency, but
 * due to the asynchronous nature of the underlying Reddit API wrapper, some
 * overlap may be experienced. This is largely handled internally using mutex
 * locking, and can also be avoided by choosing a slower frequency.
 *
 * @category Content Streams
 * @example
 * import { Client } from 'snoots';
 * import { skipDuplicates, skipExisting } from './middlewares';
 * import { SubmissionStream } from '.';
 *
 * // Instantiate a Snoots client (or re-use one)
 * const client = new Client({...})
 *
 * // Create a submission stream that fetches submissions from r/AskReddit ever 5000ms
 * const submissions = new SubmissionStream( client, { frequency: 5000 }, 'AskReddit' );
 *
 * // Add middleware (more on that later)
 * submissions.use(new skipExisting(), new skipDuplicates('id'));
 *
 * // For every comment, log it to the console
 * submissions.on('item', console.log)
 */
export class SubmissionStream extends SnootsListingPoll<Post> {
	/**
	 * @param client Snoots client instance with which to fetch new comments
	 * @param options IAsyncPollOptions interface used to set the frequency of the polling
	 * @param subreddit The subreddit to poll.
	 */
	constructor(client: Client, options: IAsyncPollOptions, subreddit: string) {
		super(options, () => client.subreddits.getNewPosts(subreddit));
	}
}
