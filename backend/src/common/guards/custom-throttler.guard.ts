import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // If the request is authenticated, use the user's ID
    if (req.user && req.user.id) {
      return `user-${req.user.id}`;
    }
    if (req.user && req.user.sub) {
      return `user-${req.user.sub}`;
    }

    // Otherwise, fall back to the IP address
    return `ip-${req.ips?.length ? req.ips[0] : req.ip}`;
  }

  protected generateKey(context: ExecutionContext, suffix: string, name: string): string {
    // Override generateKey to use our custom tracker (the suffix) directly
    // name is the name of the throttler (e.g., 'default')
    return `${name}:${suffix}`;
  }
}
