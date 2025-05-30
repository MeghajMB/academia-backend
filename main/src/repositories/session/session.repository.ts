import { PipelineStage, Types } from "mongoose";
import { SessionDocument, SessionModel } from "../../models/session.model";
import { BaseRepository } from "../base/base.repository";
import { ISessionRepository } from "./session.interface";
import {
  GetUsersSessionsInput,
  GetUsersSessionsResult,
  SessionAnalyticsResult,
} from "./session.types";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import { injectable } from "inversify";

@injectable()
export class SessionRepository
  extends BaseRepository<SessionDocument>
  implements ISessionRepository
{
  //implements ISessionRepository
  constructor() {
    super(SessionModel);
  }

  async fetchAdminSessionAnalytics(
    matchStage: Record<string, any>,
    dateGroup: "daily" | "monthly" | "yearly"
  ): Promise<{
    metrics: SessionAnalyticsResult[];
    summary: {
      sessionCount: number;
    };
  }> {
    try {
      let dateFormat: string;

      switch (dateGroup) {
        case "daily":
          dateFormat = "%Y-%m-%d";
          break;
        case "monthly":
          dateFormat = "%Y-%m";
          break;
        case "yearly":
          dateFormat = "%Y";
          break;
        default:
          throw new Error("Invalid date group specified");
      }

      const pipeline: PipelineStage[] = [
        {
          $match: {
            ...matchStage,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: "$sessionDate", // sessionDate is the key date here
              },
            },
            sessionCount: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            sessionCount: 1,
          },
        },
      ];

      const sessionStats = await SessionModel.aggregate(pipeline).exec();

      const summaryResult = await SessionModel.aggregate([
        {
          $match: {
            ...matchStage,
          },
        },
        {
          $group: {
            _id: null,
            sessionCount: { $sum: 1 },
          },
        },
      ]);

      const summary = summaryResult[0] || { sessionCount: 0 };

      return { metrics: sessionStats ?? [], summary };
    } catch (error) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUserSessions(
    input: GetUsersSessionsInput
  ): Promise<GetUsersSessionsResult[] | []> {
    try {
      const { limit, status, search, page = 1, userId } = input;

      const filter: Record<string, any> = {
        participants: { $elemMatch: { userId: new Types.ObjectId(userId) } },
      };

      if (status && status !== "all") {
        filter.status = status;
      }

      // Build aggregation pipeline
      const pipeline: any[] = [
        {
          $match: {
            $or: [{ instructorId: new Types.ObjectId(userId) }, filter],
          },
        },
        {
          $lookup: {
            from: "gigs",
            localField: "gigId",
            foreignField: "_id",
            as: "gig",
          },
        },
        { $unwind: "$gig" },
        {
          $lookup: {
            from: "users",
            localField: "instructorId",
            foreignField: "_id",
            as: "instructor",
          },
        },
        { $unwind: "$instructor" },
      ];

      // If search is provided (match on gig title or instructor name)
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { "gig.title": { $regex: search, $options: "i" } },
              { "instructor.name": { $regex: search, $options: "i" } }, // assuming instructor has a name field
            ],
          },
        });
      }

      // Sort by sessionDate descending (latest first)
      pipeline.push({ $sort: { sessionDate: -1 } });

      // Pagination
      pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

      // Final projection
      pipeline.push({
        $project: {
          gigId: "$gig._id",
          sessionId: "$_id",
          instructor: {
            id: "$instructor._id",
            name: "$instructor.name", // Make sure User has a name field
          },
          title: "$gig.title",
          description: "$gig.description",
          sessionDate: 1,
          sessionDuration: 1,
          status: 1,
        },
      });

      const sessions = await SessionModel.aggregate(pipeline);

      return sessions as GetUsersSessionsResult[] | [];
    } catch (error) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
