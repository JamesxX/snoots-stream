import { Client } from "snoots";
import { Content, Listing, Post } from "snoots/types/reddit";

import { Pollify } from "./pollify";

export class snootsStream {

    constructor(
        private readonly snootsClient: Client
    ) {

    }

    postStream<U extends Content, T extends (...args: any[]) => any = (...args: any[]) => Listing<Post>>(
        rateMilliseconds: number,
        pollFn: T,
        ...args: Parameters<T>
    ): Pollify<T> {

        const poll = new Pollify(
            rateMilliseconds,
            pollFn,
            ...args
        )

        let old_cache: U[] = [];
        const start = Date.now();

        poll.on('data', async (data: Listing<U>) => {

            const new_cache: U[] = [];
            for await (const element of data) {
                if (element.createdUtc < start / 1000) continue;
                new_cache.push(element)
                if (old_cache.filter(el => el.id == element.id).length > 0) continue;

                poll.emit('post', element)
            }

            old_cache = new_cache;
            poll.loop()
        })


        return poll;
    }


    submissionStream(pollRate: number, subreddit?: string | undefined) {
        return this.postStream(
            pollRate,
            this.snootsClient.subreddits.getNewPosts.bind(this.snootsClient.subreddits),
            subreddit
        )
    }

    commentStream(pollRate: number, subreddit?: string | undefined) {
        return this.postStream(
            pollRate,
            this.snootsClient.subreddits.getSortedComments.bind(this.snootsClient.subreddits),
            subreddit,
            "new"
        )
    }


}