import { BadRequestError } from "../../../util/errors/bad-request-error";
import { ICourseRepository } from "../../../repositories/course/course.interface";
import { AppError } from "../../../util/errors/app-error";
import { StatusCode } from "../../../enums/status-code.enum";
import { ILectureRepository } from "../../../repositories/course/lecture/lecture.interface";
import { ISectionRepository } from "../../../repositories/course/section/section.interface";
import moment from "moment";
import { ISectionService } from "./section.interface";
import { inject, injectable } from "inversify";
import { Types } from "../../../container/types";
import mongoose from "mongoose";

@injectable()
export class SectionService implements ISectionService {
  constructor(
    @inject(Types.CourseRepository) private readonly courseRepository: ICourseRepository,
    @inject(Types.LectureRepository) private readonly lectureRepository: ILectureRepository,
    @inject(Types.SectionRepository) private readonly sectionRepository: ISectionRepository
  ) {}
  async editSection(
    sectionId: string,
    sectionData: { title: string; description: string },
    instructorId: string
  ): Promise<{ id: string }> {
    try {
      const existingSection =
        await this.sectionRepository.findByIdWithPopulatedData(sectionId);
      if (
        !existingSection ||
        existingSection.courseId.userId.toString() !== instructorId
      ) {
        throw new BadRequestError("Something happened");
      }
      const updatedSection = await this.sectionRepository.update(
        sectionId,
        sectionData,
        {}
      );
      if (!updatedSection) {
        throw new BadRequestError("Bad request");
      }
      return { id: updatedSection._id.toString() };
    } catch (error) {
      throw error;
    }
  }

  async deleteSection(
    instructorId: string,
    sectionId: string
  ): Promise<{ message: string; status: "archived" | "deleted" }> {
    try {
      const section = await this.sectionRepository.findByIdWithPopulatedData(
        sectionId
      );
      if (section?.courseId.userId.toString() !== instructorId) {
        throw new AppError(
          "Youd dont have the necessary permissions",
          StatusCode.FORBIDDEN
        );
      }
      if (section.courseId.status === "listed") {
        const scheduledDeletionDate = moment().add(30, "days").toDate();
        await this.lectureRepository.scheduleDeletionDateForLectures(
          sectionId,
          scheduledDeletionDate
        );
        await this.sectionRepository.delete(sectionId);
      } else {
        await this.lectureRepository.deleteLecturesByFilter({ sectionId });
      }

      return {
        message: "success",
        status: section.courseId.status === "listed" ? "archived" : "deleted",
      };
    } catch (error) {
      throw error;
    }
  }

  async addSection(
    sectionData: { title: string; description: string; order: string },
    courseId: string,
    userId: string
  ): Promise<{
    id: string;
    courseId: string;
    title: string;
    order: number;
    description: string;
  }> {
    const course = await this.courseRepository.findById(courseId); // assuming you have a repository for courses
    if (!course || course.userId.toString() !== userId) {
      throw new BadRequestError("Course not found");
    }
    const sectionCount = await this.sectionRepository.countDocumentsByCourseId(
      courseId
    );
    const updatedSectionData = {
      ...sectionData,
      courseId: new mongoose.Types.ObjectId(courseId),
      order: sectionCount,
    };
    const section = await this.sectionRepository.create(updatedSectionData);
    //update total count of section in course
    await this.courseRepository.update(
      courseId,
      {
        totalSections: sectionCount + 1,
      },
      {}
    );
    return {
      id: section._id.toString(),
      courseId: section.courseId.toString(),
      title: section.title,
      order: section.order,
      description: section.description,
    };
  }
}
