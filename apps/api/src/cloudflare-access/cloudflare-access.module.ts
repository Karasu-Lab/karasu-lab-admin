import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { CloudflareAccessGuard } from "cloudflare-access/nestjs";
import { AppConfigService } from "../config/config.service.js";

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useFactory: (config: AppConfigService) => {
        if (!config.cloudflare) return { canActivate: () => true };
        return new CloudflareAccessGuard({
          accessConfig: config.cloudflare,
          skipInDev: config.cloudflare.skipInDev,
          environment: process.env.NODE_ENV,
        });
      },
      inject: [AppConfigService],
    },
  ],
})
export class CloudflareAccessModule {}
