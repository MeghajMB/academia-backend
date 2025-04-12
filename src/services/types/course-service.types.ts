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
  enrollmentStatus: "enrolled" | "not enrolled"|"instructor";
  canReview: boolean;
  hasReviewed: boolean;
  sections: {
    id: string;
    title: string;
    order: number;
    lectures: {
      id: string;
      title: string;
      order: number;
    }[];
  }[];
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

export interface EditCourseLandingPagePayload{
  category: string;
  imageThumbnail: string|null;
  description: string;
  price: number;
  subtitle: string;
  title: string;
  promotionalVideo: string|null;
}

export interface GetCourses {
  courses: {
    id: string;
    instructorDetails: {
      name: string;
      id: string;
    };
    title: string;
    price: number;
    subtitle: string;
    rating: number;
    category: {
      name: string;
      id: string;
    };
    totalDuration: number;
    totalLectures: number;
    totalSections: number;
    isBlocked: boolean;
    status: string;
    imageThumbnail: string;
    createdAt: string;
    updatedAt: string;
  }[];
  pagination: {
    totalDocuments: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface GetCoursesOfInstructorResponse {
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
  status: "pending" | "accepted" | "rejected" | "draft" | "listed";
  rejectedReason: string;
  imageThumbnail: string;
  promotionalVideo: string;
  createdAt: string;
  updatedAt: string;
}
