import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../../enums/status-code.enum";
import { FileService } from "../../services/file/file.service";
import {
  GenerateGetSignedUrlResponseSchema,
  GeneratePutSignedUrlResponseSchema,
} from "@academia-dev/common";
import {
  GenerateGetSignedUrlRequestSchema,
  GeneratePutSignedUrlRequestSchema,
} from "./request.dto";
import { IFileController } from "./file.interface";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class FileController implements IFileController {
  constructor(
    @inject(Types.FileService) private readonly fileService: FileService
  ) {}

  async generateGetSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = GenerateGetSignedUrlRequestSchema.parse(req.body);
      const url = await this.fileService.generateGetSignedUrl(key);
      const response = GenerateGetSignedUrlResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Signed GET URL generated successfully",
        data: { url },
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
  async generatePutSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, contentType, isPublic, isTemp } =
        GeneratePutSignedUrlRequestSchema.parse(req.body);
      const url = await this.fileService.generatePutSignedUrl(
        key,
        contentType,
        isPublic,
        isTemp
      );
      const response = GeneratePutSignedUrlResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Signed PUT URL generated successfully",
        data: { url },
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
