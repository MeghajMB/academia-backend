import { z } from "zod";

// Create Category Request
export const CreateCategoryRequestSchema = z.object({
  name: z.string().nonempty("Category name is required"), 
  description:z.string().nonempty("Category description is required")
});
export type CreateCategoryRequestDTO = z.infer<
  typeof CreateCategoryRequestSchema
>;


// Edit Category Request
export const EditCategoryRequestSchema = z.object({
  categoryId: z.string().nonempty("Category ID is required"),
  category: z.object({
    name:z.string().nonempty("Category name is required"),
    description:z.string().nonempty("Category description is required")
  })
});
export type EditCategoryRequestDTO = z.infer<typeof EditCategoryRequestSchema>;

// Block Category Request
export const BlockCategoryRequestSchema = z.object({
  categoryId: z.string().nonempty("Category ID is required"),
});
export type BlockCategoryRequestDTO = z.infer<
  typeof BlockCategoryRequestSchema
>;