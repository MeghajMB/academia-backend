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
  enrollmentStatus: "enrolled" | "not enrolled" | "instructor";
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
  id: string;
  imageThumbnail: string;
  title: string;
  completedAt: string | null;
  progressPercentage: number;
  certificate: string | null;
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

export interface EditCourseLandingPagePayload {
  category: string;
  imageThumbnail: string | null;
  description: string;
  price: number;
  subtitle: string;
  title: string;
  promotionalVideo: string | null;
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
  status: "pending" | "accepted" | "rejected" | "draft" | "listed"|"scheduled";
  rejectedReason: string;
  imageThumbnail: string;
  promotionalVideo: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddLectureResponse {
  id: string;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
  status: "processing" | "processed" | "archived";
  sectionId: string;
  progress: string;
}

export interface GetCourseAnalyticsResponse {
  courseMetrics: {
    enrollments: { count: number; averageProgress: number; date: string }[];
    transactions: { totalAmount: number; date: string }[];
  };
  courseMetricsSummary: {
    totalRevenue: number;
    totalStudents: number;
    averageProgress: number;
    averageRating: number;
    reviewCount:number;
    reviewDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
}
