import { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";
import {
  CreateCourse,
  GetCourseDetailsResponse,
  UpdatedSection,
} from "../types/ccourse-service.types";
import { CourseDocument } from "../../models/course.model";
import { LectureDocument } from "../../models/lecture.model";
import { SectionDocument } from "../../models/section.model";
import { EnrollmentDocument } from "../../models/enrollment.model";

export interface ICourseService {
  createCourse(
    courseData: CreateCourse,
    userId: string
  ): Promise<CourseDocument>;
  getNewCourses(): Promise<CourseDocument[]>;
  markLectureAsCompleted(
    id: string,
    courseId: string,
    lectureId: string
  ): Promise<{ message: string } | null>;
  editLecture(
    lectureId: string,
    lectureData: { title: string; videoUrl: string; duration: number },
    id: string
  ): Promise<LectureDocument>;
  editSection(
    sectionId: string,
    sectionData: { title: string; description: string },
    instructorId: string
  ): Promise<SectionDocument>;
  getCurriculum(
    courseId: string,
    userId: string,
    status: string,
    role: string
  ): Promise<UpdatedSection[]>;
  getEnrolledCoursesOfUser(studentId: string): Promise<any>;
  getCourseDetails(
    courseId: string,
    userId: string
  ): Promise<GetCourseDetailsResponse>;
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
    courseId: string,
    userId: string,
    courseData: CreateCourse
  ): Promise<CourseDocument>;
  enrollStudent(
    courseId: string,
    userId: string,
    transactionId: string
  ): Promise<EnrollmentDocument>;
  addSection(
    section: { title: string; description: string },
    courseId: string,
    userId: string
  ): Promise<SectionDocument>;
  addLecture(
    userId: string,
    courseId: string,
    sectionID: string,
    lectureData: { title: string; videoUrl: string; duration: number }
  ): Promise<LectureDocument>;
  getCoursesOfInstructor(
    instructorId: string,
    status: string
  ): Promise<CourseDocument[]>;
  submitCourseForReview(
    instructorId: string,
    courseId: string
  ): Promise<{ message: string }>;
  deleteLecture(
    instructorId: string,
    lectureId: string
  ): Promise<{ message: string; status: "archived" | "deleted" }>;
  deleteSection(
    instructorId: string,
    sectionId: string
  ): Promise<{ message: string; status: "archived" | "deleted" }>;
  listCourse(
    instructorId: string,
    courseId: string
  ): Promise<{ message: string }>;
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
