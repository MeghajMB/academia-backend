//errors
import { NotFoundError } from "../../util/errors/not-found-error";
import { BadRequestError } from "../../util/errors/bad-request-error";

//externl dependencies
import { StatusCode } from "../../enums/status-code.enum";
import { UserRepository } from "../../repositories/implementations/user.repository";
import { IEnrollmentRepository } from "../../repositories/interfaces/enrollment-repository.interface";
import { ITransactionRepository } from "../../repositories/interfaces/transaction-repository.interface";
import { ICourseRepository } from "../../repositories/interfaces/course-repository.interface";

export class InstructorService {
  constructor(
    private userRepository: UserRepository,
    private enrollmentRepository: IEnrollmentRepository,
    private transactionRepository: ITransactionRepository,
    private courseRepository: ICourseRepository
  ) {}

  async getProfile(userId: string) {
    const userProfile = await this.userRepository.findById(userId);
    if (!userProfile) {
      throw new NotFoundError("User Not Found");
    }
    return userProfile;
  }
  async getDashboard(userId: string) {
    try {
      const userProfile = await this.userRepository.findById(userId);
      if (!userProfile) {
        throw new NotFoundError("User Not Found");
      }
      const courses =
        await this.courseRepository.fetchCoursesWithInstrucorIdAndStatus(
          userId,
          "listed"
        );
      //calculate the total students enrolled
      const courseMetrics = await Promise.all(
        courses.map(async (course) => {

          const transactionCount =
            await this.transactionRepository.getInstructorAnalytics(
              course._id.toString(),
              "month"
            );
          const enrollments = await this.enrollmentRepository.getEnrollmentMetrics(
            course._id.toString()
          );
          return {
            courseId: course._id,
            title: course.title,
            reviewStats: course.reviewStats,
            enrollmentData:enrollments,
            transactions:transactionCount
          };
        })
      );
      //const gigMetrics;
      console.log(courseMetrics)
      return { courseMetrics };
    } catch (error) {
      throw error;
    }
  }
}
