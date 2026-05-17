import { Controller, Get, Query, Sse } from "@nestjs/common";
import { Observable } from "rxjs";
import Docker from "dockerode";
import { ImagesService } from "./images.service.js";
import { PullImageDto } from "./dto/pull-image.dto.js";

@Controller("images")
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  listImages(): Promise<Docker.ImageInfo[]> {
    return this.imagesService.listImages();
  }

  @Sse("pull")
  @Get("pull")
  pullImage(@Query() dto: PullImageDto): Observable<MessageEvent> {
    return this.imagesService.pullImage(dto.image);
  }
}
