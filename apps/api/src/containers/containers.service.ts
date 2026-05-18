import { Injectable, NotFoundException } from "@nestjs/common";
import { Observable } from "rxjs";
import { PassThrough } from "stream";
import Docker from "dockerode";
import { DockerService } from "../docker/docker.service.js";
import { ContainerInfoDto } from "./dto/container-info.dto.js";
import { LogQueryDto } from "./dto/log-query.dto.js";
import { ReplaceContainerDto } from "./dto/replace-container.dto.js";

@Injectable()
export class ContainersService {
  constructor(private readonly docker: DockerService) {}

  /** Returns a list of all running containers. */
  async listContainers(): Promise<ContainerInfoDto[]> {
    const containers = await this.docker.client.listContainers({ all: true });
    return containers.map((c) => ({
      id: c.Id,
      names: c.Names,
      image: c.Image,
      imageId: c.ImageID,
      status: c.Status,
      state: c.State,
      created: c.Created,
      ports: c.Ports.map((p) => ({
        IP: p.IP ?? "",
        PrivatePort: p.PrivatePort,
        PublicPort: p.PublicPort,
        Type: p.Type,
      })),
    }));
  }

  /** Starts a stopped container. */
  async startContainer(id: string): Promise<void> {
    try {
      await this.docker.client.getContainer(id).start();
    } catch {
      throw new NotFoundException(`Container ${id} not found`);
    }
  }

  /** Stops a running container. */
  async stopContainer(id: string): Promise<void> {
    try {
      await this.docker.client.getContainer(id).stop();
    } catch {
      throw new NotFoundException(`Container ${id} not found`);
    }
  }

  /** Returns detailed inspection data for a single container. */
  async inspectContainer(id: string): Promise<Docker.ContainerInspectInfo> {
    try {
      return await this.docker.client.getContainer(id).inspect();
    } catch {
      throw new NotFoundException(`Container ${id} not found`);
    }
  }

  /** Streams container logs as an SSE observable. */
  streamLogs(id: string, query: LogQueryDto): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const container = this.docker.client.getContainer(id);
      container.logs(
        {
          stdout: true,
          stderr: query.stderr ?? true,
          follow: true,
          tail: query.tail ?? 100,
          timestamps: true,
        },
        (err, stream) => {
          if (err) {
            subscriber.error(err);
            return;
          }
          if (!stream) {
            subscriber.complete();
            return;
          }
          const demuxed = new PassThrough();
          container.modem.demuxStream(stream, demuxed, demuxed);
          demuxed.on("data", (chunk: Buffer) => {
            subscriber.next({ data: chunk.toString("utf8") } as MessageEvent);
          });
          stream.on("end", () => subscriber.complete());
          stream.on("error", (e) => subscriber.error(e));
        },
      );
    });
  }

  /** Pulls a new image, stops the old container, then starts a new one with the same config. Streams progress via SSE. */
  replaceContainer(id: string, dto: ReplaceContainerDto): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const emit = (status: string, detail?: string) => {
        subscriber.next({ data: JSON.stringify({ status, detail }) } as MessageEvent);
      };

      void (async () => {
        try {
          emit("pulling", dto.newImage);
          await new Promise<void>((resolve, reject) => {
            void this.docker.client.pull(
              dto.newImage,
              (err: Error | null, stream: NodeJS.ReadableStream) => {
                if (err) {
                  reject(err);
                  return;
                }
                this.docker.client.modem.followProgress(
                  stream,
                  (finishErr: Error | null) => {
                    if (finishErr) {
                      reject(finishErr);
                      return;
                    }
                    resolve();
                  },
                  (event: { status: string; progress?: string }) => {
                    emit("pulling", event.progress ?? event.status);
                  },
                );
              },
            );
          });

          emit("stopping");
          const oldContainer = this.docker.client.getContainer(id);
          const inspectInfo = await oldContainer.inspect();
          await oldContainer.stop();

          emit("starting");
          const newContainer = await this.docker.client.createContainer({
            ...dto.createOptions,
            Image: dto.newImage,
            HostConfig: inspectInfo.HostConfig,
            Env: inspectInfo.Config.Env ?? undefined,
            ExposedPorts: inspectInfo.Config.ExposedPorts,
          });
          await newContainer.start();

          emit("done");
          subscriber.complete();
        } catch (e) {
          subscriber.error(e);
        }
      })();
    });
  }
}
