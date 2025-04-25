import { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";
import {
  AddLectureResponse,
  CreateCourse,
  EditCourseLandingPagePayload,
  GetCourseAnalyticsResponse,
  GetCourseDetailsResponse,
  GetCourses,
  GetCoursesOfInstructorResponse,
  UpdatedSection,
} from "./course.types";
import { CourseDocument } from "../../models/course.model";
import { EnrollmentDocument } from "../../models/enrollment.model";

export interface ICourseService {
  createCourse(
    courseData: CreateCourse,
    userId: string
  ): Promise<{ id: string }>;
  getNewCourses(): Promise<
    {
      id: string;
      userId: string;
      title: string;
      price: number;
      subtitle: string;
      description: string;
      category: {
        description: string;
        name: string;
      };
      totalDuration: number;
      totalLectures: number;
      totalSections: number;
      isBlocked: boolean;
      status: string;
      imageThumbnail: string;
      createdAt: string;
      updatedAt: string;
    }[]
  >;
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
  editSection(
    sectionId: string,
    sectionData: { title: string; description: string },
    instructorId: string
  ): Promise<{ id: string }>;
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
    courseData: EditCourseLandingPagePayload
  ): Promise<CourseDocument>;
  enrollStudent(
    courseId: string,
    userId: string,
    transactionId: string
  ): Promise<EnrollmentDocument>;
  getCourses(payload: {
    category?: string;
    sort?: string;
    page?: string;
    search?: string;
    limit:number
  }): Promise<GetCourses>;
  getCourseAnalytics(filter: "month" | "quarter" | "year",courseId:string,userId:string):Promise<GetCourseAnalyticsResponse>;
  addSection(
    section: { title: string; description: string },
    courseId: string,
    userId: string
  ): Promise<{
    id: string;
    courseId: string;
    title: string;
    order: number;
    description: string;
  }>;
  addLecture(
    userId: string,
    courseId: string,
    sectionID: string,
    lectureData: { title: string; videoUrl: string; duration: number }
  ): Promise<AddLectureResponse>;
  getCoursesOfInstructor(
    instructorId: string,
    status: string
  ): Promise<GetCoursesOfInstructorResponse[]>;
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
