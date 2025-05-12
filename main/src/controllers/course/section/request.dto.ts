import { z } from "zod";

// Add Section Request
export const AddSectionRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
  section: z.object({
    title: z.string().nonempty("Section title is required"),
    description: z.string().nonempty("Section description is required"),
  }),
});
export type AddSectionRequestDTO = z.infer<typeof AddSectionRequestSchema>;

// Delete Section Request
export const DeleteSectionRequestSchema = z.object({
    sectionId: z.string().nonempty("Section ID is required"),
  });
  export type DeleteSectionRequestDTO = z.infer<
    typeof DeleteSectionRequestSchema
  >;
  
// Edit Section Request
export const EditSectionRequestSchema = z.object({
    sectionId: z.string().nonempty("Section ID is required"),
    title: z.string().nonempty("Section title is required"),
    description: z.string().nonempty("Section description is required"),
  });
  export type EditSectionRequestDTO = z.infer<typeof EditSectionRequestSchema>;