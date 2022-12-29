import EventEmitter from 'events'

type IPollify<ReturnType> = {
    emit(event: 'error', error: any): void;
    emit(event: 'data', data: ReturnType): void;
};

export class Pollify<T extends (...args: any[]) => any> extends EventEmitter implements IPollify<ReturnType<T>> {
    public stopped = true;
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

    public loop() {
        if (this.stopped) return;

        // If the function is due to be polled
        if (Date.now() > (this.lastPoll + this.rateMilliseconds)) {
            this.lastPoll = Date.now();
            this.callPollFunction()
        } else {
            setTimeout(this.loop.bind(this), this.lastPoll + this.rateMilliseconds - Date.now())
        }
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