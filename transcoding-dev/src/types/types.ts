export interface MessageBody {
  event: "add-lecture";
  data: {
    userId: string;
    courseId: string;
    sectionId: string;
    lectureId: string;
    key: string;
    bucketName: string;
  };
}

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
