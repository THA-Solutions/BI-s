import { Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { tap } from "rxjs";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    intercept(context: any, next: any) {
        if(context.getType() === 'ws'){
            return this.wsLog(context, next);
        }else if (context.getType() === 'http'){
            return this.httpLog(context, next);
        }

    }

    private httpLog(context: any, next: any){
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url.replace(request.params.token, '{token}');

        Logger.warn(`${method} - Request to ${url}`);
        const now = Date.now();
        return next.handle().pipe(tap(() => Logger.log(`${method} - Response from ${url} in ${Date.now() - now}ms`)));
    }

    private wsLog(context: any, next: any){
        const request = context.switchToWs().getClient();
        const event = request.event;

        Logger.warn(`${event} - Event emmited`);
        const now = Date.now();
        return next.handle().pipe(tap(() => Logger.log(`${event} - Event handled in ${Date.now() - now}ms`)));
    }
}