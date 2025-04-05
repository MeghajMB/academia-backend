export interface CreateReviewParams {
  courseId: string;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: string;
  studentId: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: RatingBreakDown;
}
export interface RatingBreakDown{
  "1star": number;
  "2star": number;
  "3star": number;
  "4star": number;
  "5star": number;
}
export interface ReviewsWithStats {
  reviews: ReviewResponse[];
  reviewStats: ReviewStats;
}
