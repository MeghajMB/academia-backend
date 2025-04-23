import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../../enums/status-code.enum";
import { FileService } from "../../services/file/file.service";
import {
  GenerateGetSignedUrlResponseSchema,
  GeneratePutSignedUrlResponseSchema,
} from "../dtos/file/response.dto";
import {
  GenerateGetSignedUrlRequestSchema,
  GeneratePutSignedUrlRequestSchema,
} from "../dtos/file/request.dto";
import { IFileController } from "../interfaces/file-controller.interface";

export class FileController implements IFileController {
  constructor(private fileService: FileService) {}

  async generateGetSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = GenerateGetSignedUrlRequestSchema.parse(req.body);
      const url = await this.fileService.generateGetSignedUrl(key);
      const response = GenerateGetSignedUrlResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Signed GET URL generated successfully",
        data:{url},
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
        data:{url},
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
