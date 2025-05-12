export interface LectureMessage {
    event: string;
    data: {
      userId: string;
      courseId: string;
      sectionId: string;
      lectureId: string;
      key: string;
    };
  }