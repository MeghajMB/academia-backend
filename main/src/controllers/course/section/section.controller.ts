import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../../../enums/status-code.enum";
import {
  AddSectionRequestSchema,
  DeleteSectionRequestSchema,
  EditSectionRequestSchema,
} from "./request.dto";
import {
  AddSectionResponseSchema,
  NullResponseSchema,
} from "@academia-dev/common";
import { ISectionController } from "./section.interface";
import { ISectionService } from "../../../services/course/section/section.interface";
import { inject, injectable } from "inversify";
import { Types } from "../../../container/types";

@injectable()
export class SectionController implements ISectionController {
  constructor(
    @inject(Types.SectionService)
    private readonly sectionService: ISectionService
  ) {}

  async addSection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { section, courseId } = AddSectionRequestSchema.parse(req.body);
      const userId = req.verifiedUser!.id;
      const newSection = await this.sectionService.addSection(
        section,
        courseId,
        userId
      );
      const response = AddSectionResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Section added successfully",
        data: newSection,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteSection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.verifiedUser!.id;
      const { sectionId } = DeleteSectionRequestSchema.parse(req.params);
      const courses = await this.sectionService.deleteSection(
        userId,
        sectionId
      );
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Section deleted successfully",
        data: null,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async editSection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.verifiedUser!;
      const { sectionId, ...sectionData } = EditSectionRequestSchema.parse({
        ...req.body,
        ...req.params,
      });
      const updatedSection = await this.sectionService.editSection(
        sectionId,
        sectionData,
        id
      );
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Section updated successfully",
        data: null,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
