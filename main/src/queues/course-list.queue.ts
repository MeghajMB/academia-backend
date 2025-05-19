import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis";
import { container } from "../container";
import { ICourseService } from "../services/course/course.interface";
import { Types } from "../container/types";

const courseListQueue = new Queue("courseListQueue", { connection: redis });

export async function scheduleCourseList(
  instructorId: string,
  courseId: string,
  scheduleDate: Date
) {
  await courseListQueue.add(
    "courseList",
    { courseId, instructorId },
    { delay: Math.max(scheduleDate.getTime() - Date.now(), 0) }
  );
}

const sessionWorker = new Worker(
  "courseListQueue",
  async (job) => {
    const { courseId, instructorId } = job.data;
    const courseService = container.get<ICourseService>(Types.CourseService);
    console.log(`Listing course: ${courseId}`);
    try {
      await courseService.listCourse(instructorId, courseId);
    } catch (error) {
      console.error("Error Listing course:", error);
    }
  },
  { connection: redis }
);

export { courseListQueue, sessionWorker };
