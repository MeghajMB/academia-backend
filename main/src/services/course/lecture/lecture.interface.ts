import { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";
import { AddLectureResponse } from ".././course.types";

export interface ILectureService {
  markLectureAsCompleted(
    id: string,
    courseId: string,
    lectureId: string
  ): Promise<{ message: string } | null>;
  editLecture(
    lectureId: string,
    lectureData: { title: string; videoUrl: string; duration: number },
    id: string
  ): Promise<{ message: "success" }>;

  addLecture(
    userId: string,
    courseId: string,
    sectionID: string,
    lectureData: { title: string; videoUrl: string; duration: number }
  ): Promise<AddLectureResponse>;
  deleteLecture(
    instructorId: string,
    lectureId: string
  ): Promise<{ message: string; status: "archived" | "deleted" }>;
  changeOrderOfLecture(
    draggedLectureId: string,
    targetLectureId: string,
    id: string
  ): Promise<{ message: "success" }>;
  addLectureAfterProcessing(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    key: string
  ): Promise<boolean>;
  generateLectureUrl(
    courseId: string,
    lectureId: string,
    userId: string,
    role: string
  ): Promise<{
    signedCookies: CloudfrontSignedCookiesOutput;
    url: string;
  }>;
}
