//errors
import { NotFoundError } from "../../util/errors/not-found-error";

//externl dependencies
import { ICourseRepository } from "../../repositories/course/course.interface";
import { IGigRepository } from "../../repositories/gig/gig.interface";
import { IUserRepository } from "../../repositories/user/user.interface";
import { ITransactionRepository } from "../../repositories/transaction/transaction.interface";
import { IEnrollmentRepository } from "../../repositories/enrollment/enrollment.interface";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class InstructorService implements InstructorService {
  constructor(
    @inject(Types.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(Types.GigRepository) private readonly gigRepository: IGigRepository,
    @inject(Types.CourseRepository)
    private readonly courseRepository: ICourseRepository,
    @inject(Types.TransactionRepository)
    private readonly transactionRepository: ITransactionRepository,
    @inject(Types.EnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository
  ) {}

  async getProfile(userId: string) {
    const userProfile = await this.userRepository.findById(userId);
    if (!userProfile) {
      throw new NotFoundError("User Not Found");
    }
    return userProfile;
  }

  async getAnalyticsSummary(userId: string) {
    try {
      const userProfile = await this.userRepository.findById(userId);
      if (!userProfile) {
        throw new NotFoundError("User Not Found");
      }
      const courseMetrics = await this.courseRepository.fetchCourseMetrics(
        userId
      );
      const gigMetrics = await this.gigRepository.getGigMetrics(userId);
      const defaultCourseMetrics = {
        totalCourses: 0,
        totalStudents: 0,
        totalEarnings: 0,
        averageRating: 0,
        totalReviews: 0,
        reviewDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };

      const defaultGigMetrics = {
        totalGigs: 0,
        activeGigs: 0,
        expiredGigs: 0,
        completedGigs: 0,
        missedGigs: 0,
        noBidGigs: 0,
        totalGigEarnings: 0,
      };
      const finalCourseMetrics =
        courseMetrics.length > 0 ? courseMetrics[0] : defaultCourseMetrics;
      const finalGigMetrics =
        gigMetrics.length > 0 ? gigMetrics[0] : defaultGigMetrics;
      console.log(courseMetrics);
      return { courseMetrics: finalCourseMetrics, gigMetrics: finalGigMetrics };
    } catch (error) {
      throw error;
    }
  }

  async getAnalytics(userId: string, filter: "month" | "quarter" | "year") {
    try {
      const now = new Date();
      const start = new Date();
      const end = new Date();

      switch (filter) {
        case "month":
          start.setFullYear(now.getFullYear(), 0, 1);
          end.setFullYear(now.getFullYear(), 11, 31);
          break;
        case "quarter":
          start.setFullYear(now.getFullYear(), 0, 1);
          end.setFullYear(now.getFullYear(), 11, 31);
          break;
        case "year":
          start.setFullYear(now.getFullYear() - 4, 0, 1);
          break;
      }

      const [courseEarningsResult, studentGrowthResult, gigEarningsResult] =
        await Promise.all([
          this.transactionRepository.getCourseEarnings(
            userId,
            filter,
            start,
            end
          ),
          this.enrollmentRepository.getStudentGrowth(
            userId,
            filter,
            start,
            end
          ),
          this.gigRepository.getGigEarnings(userId, filter, start, end),
        ]);
      return {
        courseEarnings: courseEarningsResult,
        studentGrowth: studentGrowthResult,
        gigEarnings: gigEarningsResult,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  
}
