import { BadRequestError } from "../../../util/errors/bad-request-error";
import { ICourseRepository } from "../../../repositories/course/course.interface";
import { Types } from "mongoose";
import { FileService } from "../../file/file.service";
import { AppError } from "../../../util/errors/app-error";
import { StatusCode } from "../../../enums/status-code.enum";
import { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";
import { ILectureRepository } from "../../../repositories/course/lecture/lecture.interface";
import { IEnrollmentRepository } from "../../../repositories/enrollment/enrollment.interface";
import { IUserRepository } from "../../../repositories/user/user.interface";
import moment from "moment";
import { AddLectureResponse } from ".././course.types";
import { publishLectureToTranscode } from "../../../kafka/producers/producer";
import { ILectureService } from "./lecture.interface"; 

export class LectureService implements ILectureService {
  constructor(
    private readonly courseRepository: ICourseRepository,
    private readonly lectureRepository: ILectureRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly userRepository: IUserRepository,
    private readonly fileService: FileService
  ) {}

  async changeOrderOfLecture(
    draggedLectureId: string,
    targetLectureId: string,
    id: string
  ): Promise<{ message: "success" }> {
    try {
      if (draggedLectureId == targetLectureId) {
        return { message: "success" };
      }
      const draggedLecture =
        await this.lectureRepository.findByIdWithPopulatedData(
          draggedLectureId
        );
      const targetLecture =
        await this.lectureRepository.findByIdWithPopulatedData(targetLectureId);
      if (
        !draggedLecture ||
        !targetLecture ||
        draggedLecture.courseId.userId.toString() !== id ||
        targetLecture.courseId.userId.toString() !== id
      ) {
        throw new BadRequestError("No lecture");
      }

      if (
        draggedLecture.sectionId.toString() ==
        targetLecture.sectionId.toString()
      ) {
        await this.lectureRepository.updateOrderOfLectureInSameSection(
          draggedLecture.sectionId,
          draggedLecture._id as Types.ObjectId,
          draggedLecture.order,
          targetLecture.order
        );
      } else {
        await this.lectureRepository.updateOrderOfLectureInDifferentSection(
          draggedLecture._id as Types.ObjectId,
          draggedLecture.sectionId,
          targetLecture.sectionId,
          draggedLecture.order,
          targetLecture.order
        );
      }

      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }

  async editLecture(
    lectureId: string,
    lectureData: { title: string; videoUrl: string; duration: number },
    id: string
  ): Promise<{ message: "success" }> {
    try {
      const updatedLecture = await this.lectureRepository.editLecture(
        lectureId,
        lectureData
      );
      if (!updatedLecture) {
        throw new BadRequestError("Bad request");
      }
      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }

  //write code for generating certificate and updating the status to completed
  async markLectureAsCompleted(
    id: string,
    courseId: string,
    lectureId: string
  ): Promise<{ message: "Enrollment Updated" }> {
    try {
      const enrollment = await this.enrollmentRepository.findOneByFilter({
        studentId: id,
        courseId,
      });

      if (!enrollment) {
        throw new AppError("Enrollment not found", StatusCode.NOT_FOUND);
      }

      if (
        !enrollment.progress.completedLectures.includes(
          new Types.ObjectId(lectureId)
        )
      ) {
        const totalLectures =
          await this.lectureRepository.getTotalLecturesOfCourse(courseId);
        const completedLecturesCount =
          enrollment.progress.completedLectures.length + 1;
        const progressPercentage = Math.round(
          (completedLecturesCount / totalLectures) * 100
        );

        // Fetch course once to get instructor (avoid redundant DB calls)
        const course = await this.courseRepository.findByIdWithPopulatedData(
          String(enrollment.courseId)
        );
        if (!course) {
          throw new BadRequestError("Not Found");
        }
        // Track whether coins should be awarded
        let awarded50Percent = enrollment.progress.awarded50Percent;
        let awarded100Percent = enrollment.progress.awarded100Percent;
        let coinsToAward = 0,
          redeemCoinsToAward = 0;

        // Award coins only if they haven't been awarded before
        if (progressPercentage >= 50 && !awarded50Percent) {
          coinsToAward += 1;
          redeemCoinsToAward += 50;
          awarded50Percent = true;
        }
        if (progressPercentage === 100 && !awarded100Percent) {
          coinsToAward += 2;
          redeemCoinsToAward += 100;
          awarded100Percent = true;
          await this.enrollmentRepository.update(
            enrollment._id.toString(),
            {
              completedAt: new Date(),
            },
            {}
          );
        }
        if (redeemCoinsToAward) {
          await this.userRepository.addRedeemableCoins(id, redeemCoinsToAward);
        }
        // Update enrollment progress and award status in a single call
        await this.enrollmentRepository.updateEnrollmentProgress(
          enrollment._id.toString(),
          lectureId,
          progressPercentage,
          awarded50Percent,
          awarded100Percent
        );

        // Award purple coins if applicable
        if (coinsToAward > 0) {
          await this.userRepository.awardPurpleCoins(
            String(course.userId),
            coinsToAward
          );
        }
      }

      return { message: "Enrollment Updated" };
    } catch (error) {
      throw error;
    }
  }

  async deleteLecture(
    instructorId: string,
    lectureId: string
  ): Promise<{ message: string; status: "archived" | "deleted" }> {
    try {
      const lecture = await this.lectureRepository.findByIdWithPopulatedData(
        lectureId
      );
      if (lecture?.courseId.userId.toString() !== instructorId) {
        throw new AppError(
          "Youd dont have the necessary permissions",
          StatusCode.FORBIDDEN
        );
      }
      if (lecture.courseId.status === "listed") {
        const scheduledDeletionDate = moment().add(30, "days").toDate();
        await this.lectureRepository.update(
          lectureId,
          {
            status: "archived",
            scheduledDeletionDate,
          },
          {}
        );
      } else {
        await this.lectureRepository.delete(lectureId);
      }

      return {
        message: "success",
        status: lecture.courseId.status === "listed" ? "archived" : "deleted",
      };
    } catch (error) {
      throw error;
    }
  }

  async addLecture(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureData: { title: string; videoUrl: string; duration: number }
  ): Promise<AddLectureResponse> {
    const existingCourse = await this.courseRepository.findById(courseId);

    if (existingCourse?.userId.toString() !== userId) {
      throw new BadRequestError("You dont have access to this course");
    }
    const lectureCount =
      await this.lectureRepository.countDocumentWithSectionId(sectionId);

    const updatedLectureData = {
      ...lectureData,
      sectionId: new Types.ObjectId(sectionId),
      courseId: new Types.ObjectId(courseId),
      duration: Math.ceil(lectureData.duration / 60),
      order: lectureCount,
    };

    const newLecture = await this.lectureRepository.create(updatedLectureData);
    //update total cuont of lectures in course
    await this.courseRepository.update(
      courseId,
      {
        totalLectures: existingCourse.totalLectures + 1,
        totalDuration: updatedLectureData.duration,
      },
      {}
    );
    //send event to kafka
    await publishLectureToTranscode({
      event: "add-lecture",
      data: {
        userId: userId,
        courseId: courseId,
        sectionId: sectionId,
        lectureId: newLecture._id.toString(),
        key: lectureData.videoUrl,
        bucketName: process.env.AWS_TEMP_BUCKET_NAME!,
      },
    });

    //send an event to sqs
    // const params = {
    //   MessageBody: JSON.stringify({
    //     event: "add-lecture",
    //     data: {
    //       userId: userId,
    //       courseId: courseId,
    //       sectionId: sectionId,
    //       lectureId: newLecture._id,
    //       key: lectureData.videoUrl,
    //       bucketName: process.env.AWS_TEMP_BUCKET_NAME,
    //     },
    //   }),
    //   QueueUrl: process.env.AWS_S3_QUEUE_URL,
    //   DelaySeconds: 0, // Optional: Delay for the message (in seconds)
    // };
    // const command = new SendMessageCommand(params);
    // await sqsClient.send(command);

    const updatedLecture = {
      id: newLecture._id.toString(),
      title: newLecture.title,
      videoUrl: newLecture.videoUrl,
      duration: newLecture.duration,
      order: newLecture.order,
      status: newLecture.status,
      sectionId: newLecture.sectionId.toString(),
      progress: "instructor",
    };
    return updatedLecture;
  }

  async addLectureAfterProcessing(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    key: string
  ): Promise<Boolean | void> {
    try {
      const newLecture =
        await this.lectureRepository.updateLectureWithProcessedKey(
          lectureId,
          key
        );

      if (!newLecture) {
        throw new BadRequestError("Lecture not found");
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  async generateLectureUrl(
    courseId: string,
    lectureId: string,
    userId: string,
    role: string
  ): Promise<{
    signedCookies: CloudfrontSignedCookiesOutput;
    url: string;
  }> {
    try {
      const existingCourse =
        await this.courseRepository.findByIdWithPopulatedData(courseId);

      if (!existingCourse) {
        throw new BadRequestError("Course not found");
      }
      if (
        role !== "admin" &&
        existingCourse.userId!._id.toString() !== userId
      ) {
        const enrolledCourse = await this.enrollmentRepository.findOneByFilter({
          studentId: userId,
          courseId,
        });
        if (!enrolledCourse) {
          throw new AppError(
            "You dont have access to this file",
            StatusCode.FORBIDDEN
          );
        }
      }

      const existingLecture =
        await this.lectureRepository.findByIdWithPopulatedData(lectureId);
      if (!existingLecture) {
        throw new BadRequestError("Lecture not found");
      }

      const videoKey = existingLecture.videoUrl;
      const signedCookies =
        await this.fileService.generateCloudFrontGetSignedCookies(videoKey);
      const url = `${process.env.CLOUDFRONT_DOMAIN}/${videoKey}`;
      return { signedCookies, url };
    } catch (error) {
      throw error;
    }
  }
}
