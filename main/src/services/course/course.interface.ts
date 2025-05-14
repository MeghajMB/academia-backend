import {
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
  getCoursesOfInstructor(
    instructorId: string,
    status: string
  ): Promise<GetCoursesOfInstructorResponse[]>;
  submitCourseForReview(
    instructorId: string,
    courseId: string
  ): Promise<{ message: string }>;
  listCourse(
    instructorId: string,
    courseId: string
  ): Promise<{ message: string }>;
}
