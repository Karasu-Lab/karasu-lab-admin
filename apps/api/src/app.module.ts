import { Module } from "@nestjs/common";
import { DockerModule } from "./docker/docker.module.js";
import { ContainersModule } from "./containers/containers.module.js";
import { ImagesModule } from "./images/images.module.js";

@Module({
  imports: [DockerModule, ContainersModule, ImagesModule],
})
export class AppModule {}
