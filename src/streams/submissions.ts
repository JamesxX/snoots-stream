import { Client, Post } from 'snoots';

import { IAsyncPollOptions } from '../poll/asyncPoll';
import { SnootsListingPoll } from '../poll/snootsListingPoll';

/**
 * @category Content Streams
 */
export class SubmissionStream extends SnootsListingPoll<Post> {
	constructor(client: Client, options: IAsyncPollOptions, subreddit: string) {
		super(options, () => client.subreddits.getNewPosts(subreddit));
	}
}
