import CircuitBreaker from 'opossum';
import { Logger } from '@nestjs/common';

export interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  timeout: 5000, // 5 seconds default timeout
  errorThresholdPercentage: 50, // Trip if 50% fail
  resetTimeout: 10000, // Try again after 10 seconds
};

export class ExternalServiceCall {
  private static readonly logger = new Logger(ExternalServiceCall.name);
  private static breakers = new Map<string, CircuitBreaker>();

  /**
   * Executes a promise-returning function wrapped in a Circuit Breaker with Timeout and Fallback.
   *
   * @param name Unique name for the breaker (e.g. 'whatsapp-api', 'razorpay-create-order')
   * @param action The function to execute
   * @param fallback The fallback function if the service is unavailable, slow, or fails
   * @param options Circuit breaker options
   */
  static async execute<T>(
    name: string,
    action: () => Promise<T>,
    fallback?: (err: Error) => Promise<T> | T,
    options?: CircuitBreakerOptions,
  ): Promise<T> {
    let breaker = this.breakers.get(name);

    if (!breaker) {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      // Opossum takes the function to execute. We pass a generic executor.
      const executor = async (fn: () => Promise<T>) => await fn();
      breaker = new CircuitBreaker(executor, opts);

      breaker.fallback((fn: any, err: Error) => {
        // Opossum's fallback receives the arguments passed to fire(), then the error.
        // Wait, Opossum fallback signature: fallback((...args, err) => ...)
        // However, if we just use a 1-arg fallback, it's just the error in older versions or args+error.
        // To be safe, we can handle it.
        const actualError = err instanceof Error ? err : (arguments[arguments.length - 1] as Error);
        
        this.logger.warn(`Fallback triggered for [${name}]. Error: ${actualError?.message || actualError}`);
        if (fallback) {
          return fallback(actualError);
        }
        throw new Error(`Service [${name}] is currently unavailable. Please try again later.`);
      });

      breaker.on('open', () => this.logger.error(`Circuit Breaker [${name}] is OPEN (Service Down)`));
      breaker.on('halfOpen', () => this.logger.log(`Circuit Breaker [${name}] is HALF-OPEN (Testing)`));
      breaker.on('close', () => this.logger.log(`Circuit Breaker [${name}] is CLOSED (Service Restored)`));
      breaker.on('timeout', () => this.logger.warn(`Call to [${name}] TIMED OUT`));

      this.breakers.set(name, breaker);
    }

    return (breaker as any).fire(action).catch((err: any) => {
        throw err;
    });
  }
}
