import { ReviewDocument } from "../../models/review.model";
import { IRepository } from "../base/base-repository.interface";

export interface IReviewRepository extends IRepository<ReviewDocument> {}
