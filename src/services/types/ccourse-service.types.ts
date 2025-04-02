import { Types } from "mongoose";

export interface GetCourseDetailsResponse {
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

export interface GetCourseCreationDetailsResponse {
  courseId: string;
  imageThumbnail: string;
  promotionalVideo: string;
  category: string;
  title: string;
  price: number;
  subtitle: string;
  description: string;
}

export interface GetEnrolledCoursesOfUserResponse {
  id: Types.ObjectId;
  imageThumbnail: string;
  title: string;
  completedAt: Date | undefined;
  progressPercentage: number;
  certificate: string | undefined;
}

export interface UpdatedSection {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lectures: UpdatedLecture[];
}
export interface UpdatedLecture {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
  status: string;
}

export interface CreateCourse {
  category: string;
  imageThumbnail: string;
  description: string;
  price: number;
  subtitle: string;
  title: string;
  promotionalVideo: string;
}