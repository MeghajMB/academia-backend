import { Router } from "express";
import authRoutes from "./modules/auth.routes";
import adminRoutes from "./modules/admin.routes";
import instructorRoutes from "./modules/instructor.routes";
import userRoutes from "./modules/user.routes";
import categoryRoutes from "./modules/category.routes";
import courseRoutes from "./modules/course/course.routes";
import sectionRoutes from './modules/course/section.routes'
import lectureRoutes from './modules/course/lecture.routes'
import fileRoutes from "./modules/file.routes";
import paymentRoutes from "./modules/payment.routes";
import reviewRoutes from "./modules/review.routes";
import gigRoutes from "./modules/gig.routes";
import bidRoutes from "./modules/bid.routes";
import notificationRoutes from "./modules/notifcation.routes";
import coinRoutes from "./modules/coin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/instructor", instructorRoutes);
router.use("/user", userRoutes);
router.use("/category", categoryRoutes);
router.use("/courses/lectures", lectureRoutes);
router.use("/courses/sections", sectionRoutes);
router.use("/courses", courseRoutes);
router.use("/files", fileRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/gig", gigRoutes);
router.use("/bid", bidRoutes);
router.use("/notification", notificationRoutes);
router.use("/coin", coinRoutes);

export default router;
