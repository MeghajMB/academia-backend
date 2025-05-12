import { z } from "zod";
import { SuccessResponseSchema } from "../shared-response.dto";

// Create Course Response
export const CreateCourseResponseSchema = SuccessResponseSchema.extend({
  message: z.literal("success"),
  data: z.object({
    id: z.string(),
  }),
});
export type CreateCourseResponseDTO = z.infer<
  typeof CreateCourseResponseSchema
>;

// Get Enrolled Courses Of User Response
export const GetEnrolledCoursesOfUserResponseSchema =
  SuccessResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        completedAt: z.string().nullable(),
        imageThumbnail: z.string(),
        progressPercentage: z.number(),
        certificate: z.string().nullable(),
      })
    ),
  });
export type GetEnrolledCoursesOfUserResponseDTO = z.infer<
  typeof GetEnrolledCoursesOfUserResponseSchema
>;

// Get Curriculum Response
export const GetCurriculumResponseSchema = SuccessResponseSchema.extend({
  data: z.array(
    z.object({
      id: z.string(),
      courseId: z.string(),
      title: z.string(),
      order: z.number(),
      description: z.string(),
      lectures: z.array(
        z.object({
          id: z.string(),
          sectionId: z.string(),
          courseId: z.string(),
          title: z.string(),
          videoUrl: z.string(),
          duration: z.number(),
          order: z.number(),
          status: z.string(),
          progress: z.enum([
            "completed",
            "not completed",
            "locked",
            "instructor",
          ]),
        })
      ),
    })
  ),
});
export type GetCurriculumResponseDTO = z.infer<
  typeof GetCurriculumResponseSchema
>;

// Get Course Details Response
export const GetCourseDetailsResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    courseId: z.string(),
    instructorId: z.string(),
    instructorName: z.string(),
    totalDuration: z.number(),
    totalLectures: z.number(),
    imageThumbnail: z.string(),
    promotionalVideo: z.string(),
    canReview: z.boolean(),
    hasReviewed: z.boolean(),
    category: z.string(),
    title: z.string(),
    price: z.number(),
    subtitle: z.string(),
    description: z.string(),
    enrollmentStatus: z.enum(["enrolled", "not enrolled", "instructor"]),
    sections: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        order: z.number(),
        lectures: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            order: z.number(),
          })
        ),
      })
    ),
  }),
});

export type GetCourseDetailsResponseDTO = z.infer<
  typeof GetCourseDetailsResponseSchema
>;

export const GetCourseCreationDetailsResponseSchema =
  SuccessResponseSchema.extend({
    data: z.object({
      courseId: z.string(),
      imageThumbnail: z.string(),
      promotionalVideo: z.string(),
      category: z.string(),
      title: z.string(),
      price: z.number(),
      subtitle: z.string(),
      description: z.string(),
      rejectedReason: z.string(),
      canSubmitReview: z.boolean(),
    }),
  });

export type GetCourseCreationDetailsResponseDTO = z.infer<
  typeof GetCourseCreationDetailsResponseSchema
>;

// Edit Course Creation Details Response (similar to GetCourseDetails)
export const EditCourseCreationDetailsResponseSchema =
  SuccessResponseSchema.extend({
    data: z.null(),
  });
export type EditCourseCreationDetailsResponseDTO = z.infer<
  typeof EditCourseCreationDetailsResponseSchema
>;

// Get New Courses Response
export const GetNewCoursesResponseSchema = SuccessResponseSchema.extend({
  data: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      title: z.string(),
      price: z.number(),
      subtitle: z.string(),
      description: z.string(),
      category: z.object({ description: z.string(), name: z.string() }),
      totalDuration: z.number(),
      totalLectures: z.number(),
      totalSections: z.number(),
      isBlocked: z.boolean(),
      status: z.enum(["pending", "accepted", "rejected", "draft", "listed"]),
      imageThumbnail: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
  ),
});
export type GetNewCoursesResponseDTO = z.infer<
  typeof GetNewCoursesResponseSchema
>;

// Add Processed Lecture Response
export const AddProcessedLectureResponseSchema = SuccessResponseSchema.extend({
  message: z.literal("Lecture Updated Successfully"),
  data: z.null(),
});
export type AddProcessedLectureResponseDTO = z.infer<
  typeof AddProcessedLectureResponseSchema
>;

// Get Courses Of Instructor Response
export const GetCoursesOfInstructorResponseSchema =
  SuccessResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        price: z.number(),
        subtitle: z.string(),
        description: z.string(),
        category: z.object({ description: z.string(), name: z.string() }),
        totalDuration: z.number(),
        totalLectures: z.number(),
        totalSections: z.number(),
        isBlocked: z.boolean(),
        status: z.enum(["pending", "accepted", "rejected", "draft", "listed"]),
        rejectedReason: z.string(),
        imageThumbnail: z.string(),
        promotionalVideo: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
    ),
  });
export type GetCoursesOfInstructorResponseDTO = z.infer<
  typeof GetCoursesOfInstructorResponseSchema
>;

// List Course Response
export const ListCourseResponseSchema = SuccessResponseSchema.extend({
  data: z.null(), // Assuming no significant data returned
});
export type ListCourseResponseDTO = z.infer<typeof ListCourseResponseSchema>;

//get courses
export const GetCoursesResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    courses: z.array(
      z.object({
        id: z.string(),
        instructorDetails: z.object({
          name: z.string(),
          id: z.string(),
        }),
        title: z.string(),
        price: z.number(),
        subtitle: z.string(),
        rating: z.number().nullable(),
        category: z.object({
          name: z.string(),
          id: z.string(),
        }),
        totalDuration: z.number(),
        totalLectures: z.number(),
        totalSections: z.number(),
        totalReviews: z.number(),
        isBlocked: z.boolean(),
        status: z.string(),
        imageThumbnail: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
    ),
    pagination: z.object({
      totalDocuments: z.number(),
      totalPages: z.number(),
      currentPage: z.number(),
      limit: z.number(),
    }),
  }),
});
export type GetCoursesResponseDTO = z.infer<typeof GetCoursesResponseSchema>;

//get courseAnalytics
export const GetCourseAnalyticsResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    courseMetrics: z.object({
      enrollments: z.array(
        z.object({
          averageProgress: z.number(),
          count: z.number(),
          date: z.string(),
        })
      ),
      transactions: z.array(
        z.object({
          totalAmount: z.number(),
          date: z.string(),
        })
      ),
    }),
    courseMetricsSummary: z.object({
      totalRevenue: z.number(),
      totalStudents: z.number(),
      averageProgress: z.number(),
      averageRating: z.number(),
      reviewCount: z.number(),
      reviewDistribution: z.object({
        1: z.number(),
        2: z.number(),
        3: z.number(),
        4: z.number(),
        5: z.number(),
      }),
    }),
  }),
});

export type GetCourseAnalyticsResponseDTO = z.infer<
  typeof GetCourseAnalyticsResponseSchema
>;
