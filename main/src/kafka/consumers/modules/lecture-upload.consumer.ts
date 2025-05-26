import { AddProcessedLectureRequestSchema } from "../../../controllers/course/request.dto";
import { LectureMessage } from "../../types";
import { container } from "../../../container";
import { ILectureService } from "../../../services/course/lecture/lecture.interface";
import { Types } from "../../../container/types";
import { kafka } from "../../../lib/kafka";

const consumer = kafka.consumer({ groupId: "lecture-uploaded-group" });

export async function lectureUploadedConsumer() {
  await consumer.connect();
  console.log("Consumer connected");

  // Subscribe to the topic
  await consumer.subscribe({
    topics: ["lecture-transcoded"],
    fromBeginning: true,
  });
  // intialize lecture service
  const lectureService = container.get<ILectureService>(Types.LectureService);
  // Consume messages
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      const parsedMessage = JSON.parse(
        message.value?.toString() || "{}"
      ) as LectureMessage;

      try {
        const { userId, courseId, sectionId, lectureId, key } =
          AddProcessedLectureRequestSchema.parse(parsedMessage.data);
        await lectureService.addLectureAfterProcessing(
          userId,
          courseId,
          sectionId,
          lectureId,
          key
        );
        console.log("successfully updated");
      } catch (error) {
        console.log(error);
        pause(); // Pause the consumer on errors
        setTimeout(() => consumer.resume([{ topic }]), 1000);
      }
    },
  });
}
