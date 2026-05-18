import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ZodValidationPipe } from "nestjs-zod";
import { AppModule } from "./app.module.js";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter.js";
import { AppConfigService } from "./config/config.service.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  const configService = app.get(AppConfigService);
  app.enableCors({ origin: configService.corsOrigin });
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(configService.port);
}

void bootstrap();
