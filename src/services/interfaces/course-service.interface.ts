import mongoose from "mongoose";
import { ILectureResult } from "../../repositories/interfaces/lecture-repository.interface";
import { ICourseResult } from "../../types/course.interface";
import { ISectionResult } from "../../repositories/interfaces/section-repository.interface";
import { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";
import { IEnrollmentDocument } from "../../models/enrollment.model";

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

export interface IGetCourseDetails {
  courseId: string;
  instructorId: string;
  instructorName: string;
  totalDuration: number;
  totalLectures: number;
  imageThumbnail: string;
  promotionalVideo: string;
  category: string;
  title: string;
  price: number;
  subtitle: string;
  description: string;
  enrollmentStatus: "enrolled" | "not enrolled";
  canReview: boolean;
  hasReviewed: boolean;
}

export interface ICourseService {
  createCourse(
    courseData: ICreateCourse,
    userId: string
  ): Promise<ICourseResult>;
  getNewCourses(): Promise<ICourseResult[]>;
  markLectureAsCompleted(
    id: string,
    courseId: string,
    lectureId: string
  ): Promise<{ message: string } | null>;
  editLecture(
    lectureId: string,
    lectureData: { title: string; videoUrl: string; duration: number },
    id: string
  ): Promise<ILectureResult>;
  editSection(
    sectionId : string,
    sectionData: { title: string; description: string },
    instructorId: string
  ): Promise<ISectionResult>;
  getCurriculum(
    courseId: string,
    userId: string,
    status: string,
    role: string
  ): Promise<IUpdatedSection[]>;
  getEnrolledCoursesOfUser(studentId: string): Promise<any>;
  getCourseDetails(
    courseId: string,
    userId: string
  ): Promise<IGetCourseDetails>;
  getCourseCreationDetails(
    courseId: string,
    userId: string
  ): Promise<{
    courseId: string;
    imageThumbnail: string;
    promotionalVideo: string;
    category: string;
    title: string;
    price: number;
    subtitle: string;
    description: string;
  }>;
  editCourseCreationDetails(
    courseId:string,
    userId: string,
    courseData: ICreateCourse,
  ): Promise<ICourseResult>;
  enrollStudent(
    courseId: string,
    userId: string,
    transactionId: string,
  ): Promise<IEnrollmentDocument>;
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
  getCoursesOfInstructor(
    instructorId: string,
    status: string
  ): Promise<ICourseResult[]>;
  submitCourseForReview(
    instructorId: string,
    courseId: string
  ): Promise<{ message: string }>;
  deleteLecture(
    instructorId: string,
    lectureId: string
  ): Promise<{ message: string,status:"archived"|"deleted" }>;
  deleteSection(
    instructorId: string,
    sectionId: string
  ): Promise<{ message: string,status:"archived"|"deleted" }>;
  listCourse(
    instructorId: string,
    courseId: string
  ): Promise<{ message: string }>;
  changeOrderOfLecture(
    draggedLectureId: string,
    targetLectureId: string,
    id: string
  ): Promise<unknown>;
  addLectureAfterProcessing(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    key: string
  ): Promise<Boolean | void>;
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
