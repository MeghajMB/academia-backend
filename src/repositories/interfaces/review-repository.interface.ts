import { Document } from "mongoose";
import { IRepository } from "../base/base-repository.interface";
import { IReviewDocument } from "../../models/review.model";


export interface IReviewRepository extends IRepository<IReviewDocument> {

}
