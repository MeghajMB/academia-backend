import mongoose from "mongoose";
import { ILectureResult } from "../../repositories/interfaces/ILectureRepository";
import { ICourseResult } from "../../types/course.interface";
import { ISectionResult } from "../../repositories/interfaces/ISectionRepository";
import { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";

export interface ICreateCourse {
  category: string;
  imageThumbnail: string;
  description: string;
  price: number;
  subtitle: string;
  title: string;
  promotionalVideo: string;
}

export interface ICurriculumResult {
  lectures: ILectureResult[];
  courseId: mongoose.ObjectId;
  title: string;
  order: number;
}

export interface IUpdatedSection {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lectures: IUpdatedLecture[];
}
export interface IUpdatedLecture {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
  status: string;
}

export interface ICourseService {
  createCourse(
    courseData: ICreateCourse,
    userId: string
  ): Promise<ICourseResult | void>;
  getCurriculum(
    courseId: string
  ): Promise<IUpdatedSection[]>;
  getCurriculumOfInstructor(
    courseId: string,
    userId: string
  ): Promise<IUpdatedSection[]>;
  addSection(
    section: { title: string; description: string },
    courseId: string,
    userId: string
  ): Promise<ISectionResult>;
  addLecture(
    userId: string,
    courseId: string,
    sectionID: string,
    lectureData: { title: string; videoUrl: string; duration: number }
  ): Promise<ILectureResult>;
  getCourseOfInstructor(
    instructorId: string,
    status: string
  ): Promise<ICourseResult[]>;
  submitCourseForReview(
    instructorId: string,
    courseId: string
  ): Promise<{ message: string }>;
  addLectureAfterProcessing(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    key: string
  ): Promise<Boolean | void>;
  generateLecturePreviewLectureUrl(
    courseId: string,
    lectureId: string,
    userId: string,
    role: string
  ): Promise<{
    signedCookies: CloudfrontSignedCookiesOutput;
    url: string;
  }>;
}
