import { Kafka } from "kafkajs";
import { AddProcessedLectureRequestSchema } from "../../controllers/course/request.dto";
import { CourseRepository } from "../../repositories/course/course.repository";
import { LectureRepository } from "../../repositories/course/lecture/lecture.repository";
import { EnrollmentRepository } from "../../repositories/enrollment/enrollment.repository";
import { UserRepository } from "../../repositories/user/user.repository";
import { FileService } from "../../services/file/file.service";
import { LectureMessage } from "../types";
import { LectureService } from "../../services/course/lecture/lecture.service";
import { WalletRepository } from "../../repositories/wallet/wallet.repository";
import config from "../../config/configuration";

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: [config.kafka.broker],
});

const consumer = kafka.consumer({ groupId: "lecture-uploaded-group" });

const courseRepository = new CourseRepository();
const lectureRepository = new LectureRepository();
const enrollmentRepository = new EnrollmentRepository();
const walletRepository=new WalletRepository()
const userRepository = new UserRepository();

const fileService = new FileService();

const lectureService = new LectureService(
  courseRepository,
  lectureRepository,
  enrollmentRepository,
  userRepository,
  fileService,
  walletRepository
);
export async function lectureUploadedConsumer() {
  await consumer.connect();
  console.log("Consumer connected");

  // Subscribe to the topic
  await consumer.subscribe({
    topics: ["lecture-transcoded"],
    fromBeginning: true,
  });

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
