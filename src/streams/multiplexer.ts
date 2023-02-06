

import { Client, Comment, Post } from "snoots";

import { IAsyncPollOptions, Middleware, SnootsListingPoll } from "../poll";

import { CommentStream } from "./comments";
import { SubmissionStream } from "./submissions";


type StreamInternalObject<T> = T extends SnootsListingPoll<infer R> ? R : never
type MultiplexableConstructor<T> = new (client: Client, options: IAsyncPollOptions, subreddit: string) => T;

export class StreamMultiplexer<
    T extends CommentStream | SubmissionStream,
    U = StreamInternalObject<T>
>{

    private callbacks: Record<string, ((item: U) => void)[]> = {};
    private middlewares: Middleware<U>[] = []
    private stream?: T;

    constructor(private streamType: MultiplexableConstructor<T>, private client: Client, private options: IAsyncPollOptions, private subreddits: string[] = []) {
        this.subreddits = subreddits;
    }

    public use(...mw: Middleware<U>[]): void { this.middlewares.push(...mw) }

    private subscribeSingleSubreddit(subreddit: string): void {
        if (this.subreddits.includes(subreddit.toLowerCase())) return;
        this.subreddits.push(subreddit.toLowerCase())
    }

    private invalidateStream() {
        if (this.stream !== undefined) this.stream.end();
        this.stream = new this.streamType(this.client, this.options, this.subreddits.join("+"));

        // This is dumb, but TS2345 insists
        if (this.stream instanceof CommentStream) this.stream.use(...(<Middleware<Comment>[]>this.middlewares))
        if (this.stream instanceof SubmissionStream) this.stream.use(...(<Middleware<Post>[]>this.middlewares))

        // Add internal dispatcher
        this.stream.on('item', this.onItem.bind(this))
    }

    private addCallback(subreddit: string, listener: (item: U) => void) {
        if (this.callbacks[subreddit] == undefined) this.callbacks[subreddit] = [];
        this.callbacks[subreddit].push(listener);
    }

    subscribe(subreddits: string[], listener: (item: U) => void) {
        for (const subreddit of subreddits) {
            this.subscribeSingleSubreddit(subreddit);
            this.addCallback(subreddit, listener)
        }
        this.invalidateStream()
    }

    private onItem(item: U): void {
        for (const callback of this.callbacks[(<Comment | Post>item).subreddit]) {
            callback(item)
        }
    }

}
