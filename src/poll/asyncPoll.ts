import EventEmitter from 'events';

import { Mutex } from 'async-mutex';

/** Configuration for {@link AsyncPoll} class */
export interface IAsyncPollOptions {
	/** Frequency with which to call `this.pollFunction` */
	frequency: number;
}

export interface AsyncPoll {
	on(event: 'end', listener: () => void): this;
	once(event: 'end', listener: () => void): this;
	off(event: 'end', listener: () => void): this;
}

export abstract class AsyncPoll extends EventEmitter {
	private options: IAsyncPollOptions;
	private interval: NodeJS.Timeout;
	private mutex: Mutex = new Mutex();

	constructor(options: IAsyncPollOptions) {
		super();
		this.options = options;
		this.interval = setInterval(
			this.loop.bind(this),
			this.options.frequency
		);
	}

	private async loop() {
		// Don't call again if previous query is being processed
		if (this.mutex.isLocked()) return;

		// Acquire mutex
		const release = await this.mutex.acquire();
		try {
			await this.pollFunction();
		} finally {
			release();
		}
	}

	abstract pollFunction(): Promise<void>;

	end() {
		clearInterval(this.interval);
		this.emit('end');
	}
}
