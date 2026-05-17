import { z } from "zod";

export const AppConfigSchema = z.object({
  server: z.object({
    port: z.coerce.number().int().min(1).max(65535).default(3001),
    corsOrigin: z.string().default("http://localhost:3000"),
  }),
  docker: z.object({
    socket: z.object({
      win32: z.string().default("//./pipe/docker_engine"),
      default: z.string().default("/var/run/docker.sock"),
    }),
  }),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
