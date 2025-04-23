import { z } from "zod";

const SuccessResponseSchema = z.object({
  status: z.literal("success"),
  code: z.number(),
  message: z.string(),
  data: z.any(),
});

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

// Add Section Response
export const AddSectionResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    courseId: z.string(),
    order: z.number(),
  }),
});
export type AddSectionResponseDTO = z.infer<typeof AddSectionResponseSchema>;

// Get Enrolled Courses Of User Response
export const GetEnrolledCoursesOfUserResponseSchema =
  SuccessResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        completedAt: z.string().nullable(),
        imageThumbnail: z.string(),
        progressPercentage:z.number(),
        certificate:z.string().nullable()
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
          progress: z.enum(["completed", "not completed", "locked","instructor"]),
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
    enrollmentStatus: z.enum(["enrolled", "not enrolled","instructor"]),
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

// Add Lecture Response
export const AddLectureResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: z.string(),
    title: z.string(),
    videoUrl: z.string(),
    duration: z.number(),
  }),
});
export type AddLectureResponseDTO = z.infer<typeof AddLectureResponseSchema>;

// Add Processed Lecture Response
export const AddProcessedLectureResponseSchema = SuccessResponseSchema.extend({
  message: z.literal("Lecture Updated Successfully"),
  data: z.null(),
});
export type AddProcessedLectureResponseDTO = z.infer<
  typeof AddProcessedLectureResponseSchema
>;

// Generate Lecture URL Response
export const GenerateLectureUrlResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    url: z.string(),
  }),
});
export type GenerateLectureUrlResponseDTO = z.infer<
  typeof GenerateLectureUrlResponseSchema
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

// Delete Lecture Response
export const DeleteLectureResponseSchema = SuccessResponseSchema.extend({
  data: z.null(), // Assuming no significant data returned
});
export type DeleteLectureResponseDTO = z.infer<
  typeof DeleteLectureResponseSchema
>;

// Delete Section Response
export const DeleteSectionResponseSchema = SuccessResponseSchema.extend({
  data: z.null(), // Assuming no significant data returned
});
export type DeleteSectionResponseDTO = z.infer<
  typeof DeleteSectionResponseSchema
>;

// Submit Course For Review Response
export const SubmitCourseForReviewResponseSchema = SuccessResponseSchema.extend(
  {
    data: z.null(), // Assuming no significant data returned
  }
);
export type SubmitCourseForReviewResponseDTO = z.infer<
  typeof SubmitCourseForReviewResponseSchema
>;

// Mark Lecture As Completed Response
export const MarkLectureAsCompletedResponseSchema =
  SuccessResponseSchema.extend({
    data: z.object({
      lectureId: z.string(),
      completed: z.boolean(),
    }),
  });
export type MarkLectureAsCompletedResponseDTO = z.infer<
  typeof MarkLectureAsCompletedResponseSchema
>;

// List Course Response
export const ListCourseResponseSchema = SuccessResponseSchema.extend({
  data: z.null(), // Assuming no significant data returned
});
export type ListCourseResponseDTO = z.infer<typeof ListCourseResponseSchema>;

// Change Order Of Lecture Response
export const ChangeOrderOfLectureResponseSchema = SuccessResponseSchema.extend({
  data: z.null(), // Assuming no significant data returned
});
export type ChangeOrderOfLectureResponseDTO = z.infer<
  typeof ChangeOrderOfLectureResponseSchema
>;

// Edit Lecture Response
export const EditLectureResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: z.string(),
    title: z.string(),
    videoUrl: z.string(),
    duration: z.number(),
  }),
});
export type EditLectureResponseDTO = z.infer<typeof EditLectureResponseSchema>;

// Edit Section Response
export const EditSectionResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: z.string(),
  }),
});
export type EditSectionResponseDTO = z.infer<typeof EditSectionResponseSchema>;

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
        totalReviews:z.number(),
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
