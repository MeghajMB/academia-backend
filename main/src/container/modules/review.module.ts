import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { IReviewController } from "../../controllers/review/review.interface";
import { ReviewController } from "../../controllers/review/review.controller";
import { IReviewRepository } from "../../repositories/review/review.interface";
import { IReviewService } from "../../services/review/review.interface";
import { ReviewService } from "../../services/review/review.service";
import { ReviewRepository } from "../../repositories/review/review.repository";
import { Model } from "mongoose";
import { ReviewDocument, ReviewModel } from "../../models/review.model";

export const reviewModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<IReviewController>(Types.ReviewController)
      .to(ReviewController)
      .inSingletonScope();

    options
      .bind<IReviewService>(Types.ReviewService)
      .to(ReviewService)
      .inSingletonScope();

    options
      .bind<IReviewRepository>(Types.ReviewRepository)
      .to(ReviewRepository)
      .inSingletonScope();

    options
      .bind<Model<ReviewDocument>>(Types.ReviewModel)
      .toConstantValue(ReviewModel);
  }
);
