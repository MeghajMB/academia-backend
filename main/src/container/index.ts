import { Container } from "inversify";
import { adminModule } from "./modules/admin.module";
import { authModule } from "./modules/auth.module";
import { bidModule } from "./modules/bid.module";
import { categoryModule } from "./modules/category.module";
import { coinModule } from "./modules/coin.module";
import { courseModule } from "./modules/course.module";
import { fileModule } from "./modules/file.module";
import { gigModule } from "./modules/gig.module";
import { instructorModule } from "./modules/instructor.module";
import { notificationModule } from "./modules/notification.module";
import { paymentModule } from "./modules/payment.module";
import { reviewModule } from "./modules/review.module";
import { sessionModule } from "./modules/session.module";
import { userModule } from "./modules/user.module";

const container = new Container();

container.load(
  adminModule,
  authModule,
  bidModule,
  categoryModule,
  coinModule,
  courseModule,
  fileModule,
  gigModule,
  instructorModule,
  notificationModule,
  paymentModule,
  reviewModule,
  sessionModule,
  userModule
);

export { container };
