import { Client } from "snoots";
import { Content, Listing, Post } from "snoots/types/reddit";

import { Pollify } from "./pollify";

export class snootsStream {

    constructor(
        private readonly snootsClient: Client
    ) {

    }

    postStream<U extends Content, T extends (...args: readonly any[]) => any = (...args: readonly any[]) => Listing<Post>>(
        rateMilliseconds: number,
        pollFn: T,
        ...args: Parameters<T>
    ): Pollify<T> {

        const poll = new Pollify(
            rateMilliseconds,
            pollFn,
            ...args
        )

        let old_cache: readonly U[] = [];

        poll.on('data', async (data: Listing<U>) => {
            const new_cache: U[] = [];
            for await (const element of data) {
                new_cache.push(element)

                // dedupe
                if (old_cache.filter(el => el.id == element.id).length > 0) continue;
                poll.emit('post', element)
            }

            old_cache = new_cache;
        })


        return poll;
    }


    submissionStream(subreddit?: string | undefined) {
        return this.postStream(
            0,
            this.snootsClient.subreddits.getNewPosts.bind(this.snootsClient),
            subreddit
        )
    }

    /*commentStream(subreddit?: string | undefined) {
        return this.postStream(
            0,
            this.snootsClient.subreddits.getNewComments.bind(this.snootsClient),
            subreddit
        )
    }*/


}