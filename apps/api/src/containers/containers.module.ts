import { Module } from "@nestjs/common";
import { ContainersController } from "./containers.controller.js";
import { ContainersGateway } from "./containers.gateway.js";
import { ContainersService } from "./containers.service.js";

@Module({
  controllers: [ContainersController],
  providers: [ContainersService, ContainersGateway],
})
export class ContainersModule {}
