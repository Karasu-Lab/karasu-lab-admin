import { Provider } from "@nestjs/common";
import Docker from "dockerode";

export const DOCKER_CLIENT = "DOCKER_CLIENT";

export const dockerProvider: Provider = {
  provide: DOCKER_CLIENT,
  useFactory: () => new Docker({ socketPath: process.env.DOCKER_SOCKET ?? "/var/run/docker.sock" }),
};
