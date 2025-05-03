import { Router } from "express";
import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";
import instructorRoutes from "./instructor.routes";
import userRoutes from "./user.routes";
import categoryRoutes from "./category.routes";
import courseRoutes from "./course/course.routes";
import sectionRoutes from './course/section.routes'
import lectureRoutes from './course/lecture.routes'
import fileRoutes from "./file.routes";
import paymentRoutes from "./payment.routes";
import reviewRoutes from "./review.routes";
import gigRoutes from "./gig.routes";
import bidRoutes from "./bid.routes";
import notificationRoutes from "./notifcation.routes";
import coinRoutes from "./coin.routes";

const router = Router();

// Mount all routes under their respective API paths
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/instructor", instructorRoutes);
router.use("/user", userRoutes);
router.use("/category", categoryRoutes);
router.use("/courses/lectures", lectureRoutes);
router.use("/courses/sections", sectionRoutes);
router.use("/courses", courseRoutes);
router.use("/files", fileRoutes);
router.use("/payment", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/gig", gigRoutes);
router.use("/bid", bidRoutes);
router.use("/notification", notificationRoutes);
router.use("/coin", coinRoutes);

export default router;
