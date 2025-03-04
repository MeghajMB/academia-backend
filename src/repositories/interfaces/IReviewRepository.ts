import { Document } from "mongoose";
import { IRepository } from "../base/IRepositoryInterface";
import { IReviewDocument } from "../../models/reviewModel";


export interface IReviewRepository extends IRepository<IReviewDocument> {

}
