import EventEmitter from 'events'

type IPollify<ReturnType> = {
    emit(event: 'error', error: any): void;
    emit(event: 'data', data: ReturnType): void;
};

export class Pollify<T extends (...args: readonly any[]) => any> extends EventEmitter implements IPollify<ReturnType<T>> {
    public stopped = false;
    public firstRun = true

    private lastPoll = 0;
    private readonly pollFnArgs: Parameters<T>;

    constructor(
        private readonly rateMilliseconds: number = 1000,
        private readonly pollFn: T,
        ...args: Parameters<T>
    ) {
        super();
        this.pollFnArgs = args;
    }

    private callPollFunction() {
        try {
            const pollFnReturnValue = this.pollFn(...this.pollFnArgs);
            this.emit('data', pollFnReturnValue)
        } catch (error: any) {
            this.emit('error', error)
        }
    }

    private loop() {
        if (this.stopped) return;

        // If the function is due to be polled
        if (Date.now() > (this.lastPoll + this.rateMilliseconds)) {
            this.callPollFunction()
            this.lastPoll = Date.now();
        }

        setTimeout(this.loop.bind(this), this.lastPoll + this.rateMilliseconds - Date.now())
    }


    start(): void {
        if (!this.stopped) return;
        this.stopped = false;
        this.loop();
    }

    stop() {
        this.stopped = false;
    }

}