//errors
import { NotFoundError } from "../../util/errors/not-found-error";
import { BadRequestError } from "../../util/errors/bad-request-error";

//externl dependencies
import { ICourseRepository } from "../../repositories/course/course.interface";
import { IGigRepository } from "../../repositories/gig/gig.interface";
import { IUserRepository } from "../../repositories/user/user.interface";
import { ITransactionRepository } from "../../repositories/transaction/transaction.interface";
import { IEnrollmentRepository } from "../../repositories/enrollment/enrollment.interface";

export class InstructorService {
  constructor(
    private userRepository: IUserRepository,
    private gigRepository: IGigRepository,
    private courseRepository: ICourseRepository,
    private transactionRepository: ITransactionRepository,
    private enrollmentRepository: IEnrollmentRepository
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
        avgerageRating: 0,
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
      const studentGrowth = studentGrowthResult.map((student) => {
        let date: string;

        if (filter === "month") {
          // Format as YYYY-MM-01 for month labels
          date = `${student._id.year}-${String(student._id.month).padStart(
            2,
            "0"
          )}-01`;
        } else if (filter === "quarter") {
          // Use first day of quarter: Jan, Apr, Jul, Oct
          const quarterStartMonth = (student._id.quarter - 1) * 3 + 1;
          date = `${student._id.year}-${String(quarterStartMonth).padStart(
            2,
            "0"
          )}-01`;
        } else {
          // Yearly format
          date = `${student._id.year}-01-01`;
        }

        return {
          date,
          count: student.count,
        };
      });
      const courseEarnings = courseEarningsResult.map((earning) => {
        let date: string;

        if (filter === "month") {
          // Format as YYYY-MM-01 for month labels
          date = `${earning._id.year}-${String(earning._id.month).padStart(
            2,
            "0"
          )}-01`;
        } else if (filter === "quarter") {
          // Use first day of quarter: Jan, Apr, Jul, Oct
          const quarterStartMonth = (earning._id.quarter - 1) * 3 + 1;
          date = `${earning._id.year}-${String(quarterStartMonth).padStart(
            2,
            "0"
          )}-01`;
        } else {
          // Yearly format
          date = `${earning._id.year}-01-01`;
        }

        return {
          date,
          earnings: earning.total,
        };
      });
      const gigEarnings = gigEarningsResult.map((gig) => {
        let date: string;

        if (filter === "month") {
          // Format as YYYY-MM-01 for month labels
          date = `${gig._id.year}-${String(gig._id.month).padStart(2, "0")}-01`;
        } else if (filter === "quarter") {
          // Use first day of quarter: Jan, Apr, Jul, Oct
          const quarterStartMonth = (gig._id.quarter - 1) * 3 + 1;
          date = `${gig._id.year}-${String(quarterStartMonth).padStart(
            2,
            "0"
          )}-01`;
        } else {
          // Yearly format
          date = `${gig._id.year}-01-01`;
        }

        return {
          date,
          earnings: gig.total,
        };
      });
      return { courseEarnings, studentGrowth, gigEarnings };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
