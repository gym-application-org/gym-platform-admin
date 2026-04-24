import { BehaviorSubject, Observable } from 'rxjs';
import { Result, Ok, Err } from './result';

export type CommandAction0<T> = () => Promise<Result<T>>;
export type CommandAction1<T, A> = (arg: A) => Promise<Result<T>>;

export abstract class Command<T> {
  protected _running = new BehaviorSubject<boolean>(false);
  protected _result = new BehaviorSubject<Result<T> | null>(null);


  public readonly running$: Observable<boolean> = this._running.asObservable();
  public readonly result$: Observable<Result<T> | null> = this._result.asObservable();

  get running(): boolean {
    return this._running.value;
  }

  get error(): boolean {
    return this._result.value instanceof Err;
  }

  get completed(): boolean {
    return this._result.value instanceof Ok;
  }

  get result(): Result<T> | null {
    return this._result.value;
  }

  clearResult(): void {
    this._result.next(null);
  }

  protected async _execute(action: () => Promise<Result<T>>): Promise<void> {
    if (this._running.value) {
      return;
    }

    this._running.next(true);
    this._result.next(null);

    try {
      const res = await action();
      this._result.next(res);
    } finally {
      this._running.next(false);
    }
  }
}


export class Command0<T> extends Command<T> {
  constructor(private readonly action: CommandAction0<T>) {
    super();
  }

  async execute(): Promise<void> {
    await this._execute(this.action);
  }
}


export class Command1<T, A> extends Command<T> {
  constructor(private readonly action: CommandAction1<T, A>) {
    super();
  }

  async execute(arg: A): Promise<void> {
    await this._execute(() => this.action(arg));
  }
}