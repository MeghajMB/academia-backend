import cron from "node-cron";
import { LectureRepository } from "../repositories/lectureRepository";
import moment from "moment";

const lectureRepository = new LectureRepository();

const deleteExpiredLectures = async () => {
  try {

    const deletedLectureCount = await lectureRepository.deleteLecturesByFilter({
      status: "archived",
      scheduledDeletionDate: { $lte: new Date() },
    });
  } catch (error) {
    console.error("❌ Error deleting expired lectures:", error);
  }
};

// ✅ Schedule the cron job to run every midnight
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Running expired lecture deletion job...");
  await deleteExpiredLectures();
});

export default deleteExpiredLectures;
