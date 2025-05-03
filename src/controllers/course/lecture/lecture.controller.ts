import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../../../enums/status-code.enum";
import { ILectureController } from "./lecture.interface";
import { ILectureService } from "../../../services/course/lecture/lecture.interface";
import {
  AddLectureRequestSchema,
  ChangeOrderOfLectureRequestSchema,
  DeleteLectureRequestSchema,
  EditLectureRequestSchema,
  GenerateLectureUrlRequestSchema,
  MarkLectureAsCompletedRequestSchema,
} from "./request.dto";
import {
  AddLectureResponseSchema,
  EditLectureResponseSchema,
  GenerateLectureUrlResponseSchema,
  MarkLectureAsCompletedResponseSchema,
} from "./response.dto";
import { NullResponseSchema } from "../../shared-response.dto";


export class LectureController implements ILectureController {
  constructor(private readonly lectureService: ILectureService) {}

  async addLecture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.verifiedUser?.id!;
      const { courseId, sectionId, lectureData } =
        AddLectureRequestSchema.parse(req.body);
      const lectureResult = await this.lectureService.addLecture(
        userId,
        courseId,
        sectionId,
        lectureData
      );
      const response = AddLectureResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Lecture added successfully",
        data: lectureResult,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async generateLectureUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { courseId, lectureId } = GenerateLectureUrlRequestSchema.parse(
        req.params
      );
      const { id, role } = req.verifiedUser!;

      const { signedCookies, url } =
        await this.lectureService.generateLectureUrl(
          courseId,
          lectureId,
          id,
          role
        );

      res.cookie("CloudFront-Policy", signedCookies["CloudFront-Policy"], {
        httpOnly: true,
        secure: true,
      });
      res.cookie(
        "CloudFront-Signature",
        signedCookies["CloudFront-Signature"],
        {
          httpOnly: true,
          secure: true,
        }
      );
      res.cookie(
        "CloudFront-Key-Pair-Id",
        signedCookies["CloudFront-Key-Pair-Id"],
        {
          httpOnly: true,
          secure: true,
        }
      );
      const response = GenerateLectureUrlResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Lecture URL generated successfully",
        data: { url },
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteLecture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.verifiedUser!.id;
      const { lectureId } = DeleteLectureRequestSchema.parse(req.params);
      const courses = await this.lectureService.deleteLecture(userId, lectureId);
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Lecture deleted successfully",
        data: null,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async markLectureAsCompleted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.verifiedUser!;
      const { courseId, lectureId } = MarkLectureAsCompletedRequestSchema.parse(
        {...req.body,...req.params}
      );
      const result = await this.lectureService.markLectureAsCompleted(
        id,
        courseId,
        lectureId
      );
      const response = MarkLectureAsCompletedResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Lecture marked as completed",
        data: result,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async changeOrderOfLecture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.verifiedUser!;
      const { draggedLectureId, targetLectureId } =
        ChangeOrderOfLectureRequestSchema.parse(req.body);

      const result = await this.lectureService.changeOrderOfLecture(
        draggedLectureId,
        targetLectureId,
        id
      );
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Lecture order changed successfully",
        data: null,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async editLecture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.verifiedUser!;
      const { lectureId, lectureData } = EditLectureRequestSchema.parse(
        {lectureData:req.body.lectureData,lectureId:req.params.lectureId}
      );
      const updatedLecture = await this.lectureService.editLecture(
        lectureId,
        lectureData,
        id
      );
      const response = EditLectureResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Lecture updated successfully",
        data: updatedLecture,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
