import { Provider } from "@nestjs/common";
import { platform } from "os";
import Docker from "dockerode";

export const DOCKER_CLIENT = "DOCKER_CLIENT";

const defaultSocketPath =
  platform() === "win32" ? "//./pipe/docker_engine" : "/var/run/docker.sock";

export const dockerProvider: Provider = {
  provide: DOCKER_CLIENT,
  useFactory: () => new Docker({ socketPath: process.env.DOCKER_SOCKET ?? defaultSocketPath }),
};
