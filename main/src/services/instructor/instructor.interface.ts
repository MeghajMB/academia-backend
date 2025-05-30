export interface IInstructorService {
  getProfile(userId: string): Promise<any>;

  getAnalyticsSummary(userId: string): Promise<{
    courseMetrics: {
      totalCourses: number;
      totalStudents: number;
      totalEarnings: number;
      averageRating: number;
      totalReviews: number;
      reviewDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
    };
    gigMetrics: {
      totalGigs: number;
      activeGigs: number;
      expiredGigs: number;
      completedGigs: number;
      missedGigs: number;
      noBidGigs: number;
      totalGigEarnings: number;
    };
  }>;

  getAnalytics(
    userId: string,
    filter: "month" | "quarter" | "year"
  ): Promise<{
    courseEarnings: any;
    studentGrowth: any;
    gigEarnings: any;
  }>;
}
