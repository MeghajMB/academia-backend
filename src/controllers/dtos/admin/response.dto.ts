import { z } from "zod";

const SuccessResponseSchema = z.object({
  status: z.literal("success"),
  code: z.number(),
  message: z.string(),
  data: z.any(),
});

// Get Users Response (Assuming paginated user list)
export const GetUsersResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    users: z.array(
      z
        .object({
          _id: z.coerce.string(),
          name: z.string(),
          email: z.string(),
          profilePicture: z.string(),
          isBlocked: z.boolean(),
        })
        .transform(({ _id, ...rest }) => ({
          id: _id,
          ...rest,
        }))
    ),
    pagination: z.object({
      totalDocuments: z.number(),
      totalPages: z.number(),
      currentPage: z.number(),
      limit: z.number(),
    }),
  }),
});
export type GetUsersResponseDTO = z.infer<typeof GetUsersResponseSchema>;

// Get Courses Response (Assuming paginated course list)
export const GetAdminCoursesResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    courses: z.array(
      z
        .object({
          id: z.string(),
          title: z.string(),
          price: z.number(),
          isBlocked: z.boolean(),
          category: z.object({ name: z.string(), description: z.string() }),
          status:z.string()
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
export type GetCoursesResponseDTO = z.infer<typeof GetAdminCoursesResponseSchema>;

// Get Instructor Verification Requests Response
export const GetInstructorVerificationRequestsResponseSchema =
  SuccessResponseSchema.extend({
    data: z.object({
      requests: z.array(
        z
          .object({
            id: z.string(),
          name: z.string(),
          email: z.string(),
          profilePicture: z.string(),
          isBlocked: z.boolean(),
          verified: z.enum(["pending", "rejected", "notRequested", "verified"]),
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
export type GetInstructorVerificationRequestsResponseDTO = z.infer<
  typeof GetInstructorVerificationRequestsResponseSchema
>;

// Reject/Approve Verification Request Response
export const VerificationRequestResponseSchema = SuccessResponseSchema.extend({
  message: z.literal("Verification request processed"),
  data: z.null(),
});
export type VerificationRequestResponseDTO = z.infer<
  typeof VerificationRequestResponseSchema
>;

// Block User/Course Response
export const BlockResponseSchema = SuccessResponseSchema.extend({
  message: z.literal("success"),
  data: z.null(),
});
export type BlockResponseDTO = z.infer<typeof BlockResponseSchema>;

// Get Categories Response
export const GetCategoriesResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    categories: z.array(
      z
        .object({
          _id: z.coerce.string(),
          name: z.string(),
          description: z.string(),
          isBlocked: z.boolean(),
        })
        .transform(({ _id, ...rest }) => ({
          id: _id,
          ...rest,
        }))
    ),
    pagination: z.object({
      totalDocuments: z.number(),
      totalPages: z.number(),
      currentPage: z.number(),
      limit: z.number(),
    }),
  }),
});
export type GetCategoriesResponseDTO = z.infer<
  typeof GetCategoriesResponseSchema
>;

// Create/Edit
export const CategoryResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    isBlocked: z.boolean(),
  }),
});
export type CategoryResponseDTO = z.infer<typeof CategoryResponseSchema>;

// Block Category Response
export const BlockCategoryResponseSchema = SuccessResponseSchema.extend({
  message: z.literal("Category blocked successfully"),
  data: z.null(),
});
export type BlockCategoryResponseDTO = z.infer<
  typeof BlockCategoryResponseSchema
>;

// Get Course Review Requests Response
export const GetCourseReviewRequestsResponseSchema =
  SuccessResponseSchema.extend({
    data: z.object({
      requests: z.array(
        z
          .object({
            _id: z.coerce.string(),
            courseId: z.string(),
            price: z.number(),
            title: z.string(),
            isBlocked: z.boolean(),
            category: z.object({ name: z.string(), description: z.string() }),
          })
          .transform(({ _id, ...rest }) => ({
            id: _id,
            ...rest,
          }))
      ),
      pagination: z.object({
        totalDocuments: z.number(),
        totalPages: z.number(),
        currentPage: z.number(),
        limit: z.number(),
      }),
    }),
  });
export type GetCourseReviewRequestsResponseDTO = z.infer<
  typeof GetCourseReviewRequestsResponseSchema
>;

// Reject/Approve Course Review Request Response
export const CourseReviewRequestResponseSchema = SuccessResponseSchema.extend({
  message: z.literal("Course review request processed"),
  data: z.null(),
});
export type CourseReviewRequestResponseDTO = z.infer<
  typeof CourseReviewRequestResponseSchema
>;
