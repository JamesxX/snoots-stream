import { Client, Comment } from 'snoots';

import { IAsyncPollOptions } from '../poll/asyncPoll';
import { SnootsListingPoll } from '../poll/snootsListingPoll';

/**
 * @category Content Streams
 */
export class CommentStream extends SnootsListingPoll<Comment> {
	constructor(client: Client, options: IAsyncPollOptions, subreddit: string) {
		super(options, () =>
			client.subreddits.getSortedComments(subreddit, 'new')
		);
	}
}
