export interface ISectionService {
  editSection(
    sectionId: string,
    sectionData: { title: string; description: string },
    instructorId: string
  ): Promise<{ id: string }>;
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
  deleteSection(
    instructorId: string,
    sectionId: string
  ): Promise<{ message: string; status: "archived" | "deleted" }>;
}
