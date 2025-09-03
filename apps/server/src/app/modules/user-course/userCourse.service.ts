import httpStatus from "http-status";
import ApiError from "../../errorHandlers/ApiError";
import { ICreateUserCourse, IUserCourse, ISyncProgress } from "./userCourse.interface";
import UserCourse from "./userCourse.model";
import ModuleModel from "../course-management/course-module/module.model";
import LectureModel from "../course-management/lecture/lecture.model";

const enrollUserInCourses = async (payload: ICreateUserCourse): Promise<IUserCourse[]> => {
  const createdEnrollments = [];

  for (const courseId of payload.course) {
    // Check if user is already enrolled in this course
    const existingEnrollment = await UserCourse.findOne({
      user: payload.user,
      course: courseId,
    });

    if (existingEnrollment) {
      // If already exists and is enrolled, skip
      // If pending approval, skip
      continue;
    }

    const enrollment = await UserCourse.create({
      user: payload.user,
      course: courseId,
      isEnrolled: false, // Initially false - requires admin approval
    });
    createdEnrollments.push(enrollment);
  }

  return createdEnrollments;
};

const getUserCourses = async (userId: string): Promise<IUserCourse[]> => {
  const enrollments = await UserCourse.find({ user: userId })
    .populate('course', 'title description thumbnail price')
    .sort({ enrolledAt: -1 });

  return enrollments;
};

const getSingleUserCourse = async (courseId: string, userId: string): Promise<IUserCourse> => {
  const enrollment = await UserCourse.findOne({
    user: userId,
    course: courseId,
  });

  if (!enrollment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course enrollment not found");
  }

  // If user is enrolled, populate full course details with modules and lectures
  if (enrollment.isEnrolled) {
    await enrollment.populate([
      {
        path: 'course',
        select: 'title description thumbnail price modules',
        populate: {
          path: 'modules',
          select: 'title moduleNumber isActive',
          populate: {
            path: 'lectures',
            select: 'title videoUrl pdfNotes duration order isActive',
            match: { isActive: true }
          }
        }
      }
    ]);
  } else {
    // If not enrolled (pending approval), only populate basic course info
    await enrollment.populate({
      path: 'course',
      select: 'title description thumbnail price'
    });
  }

  return enrollment;
};

// First, let me create an actual progressive function that calculates progress properly
const calculateUserProgress = async (courseId: string, videosCompleted: string[]): Promise<number> => {
  // Count total active lectures in the course
  const courseModules = await ModuleModel.find({ courseId }).select('_id');
  const moduleIds = courseModules.map(mod => mod._id);

  const totalLectures = await LectureModel.countDocuments({
    moduleId: { $in: moduleIds },
    isActive: true
  });

  if (totalLectures === 0) return 0;

  // Calculate progress as completed videos / total lectures
  const progress = Math.min((videosCompleted.length / totalLectures) * 100, 100);
  return Math.round(progress);
};

const syncUserProgress = async (payload: ISyncProgress, userId: string): Promise<IUserCourse> => {
  const enrollment = await UserCourse.findOne({
    user: userId,
    course: payload.course,
  });

  if (!enrollment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course enrollment not found or not approved yet");
  }

  if (!enrollment.isEnrolled) {
    throw new ApiError(httpStatus.FORBIDDEN, "Course enrollment is pending admin approval");
  }

  // Update progress data
  Object.keys(payload).forEach((key) => {
    if (payload[key as keyof ISyncProgress] !== undefined) {
      const keyTyped = key as keyof ISyncProgress;
      const values = payload[keyTyped];
      if (Array.isArray(values) && keyTyped === 'videosCompleted') {
        // Merge arrays to avoid duplicates
        (enrollment as any)[keyTyped] = [
          ...new Set([...(enrollment[keyTyped] || []), ...values])
        ];
      } else {
        (enrollment as any)[keyTyped] = values;
      }
    }
  });

  // If videosCompleted is updated, recalculate progress
  if (payload.videosCompleted) {
    const videosCompleted = enrollment.videosCompleted?.map(v => v.toString()) || [];
    enrollment.progress = await calculateUserProgress(payload.course, videosCompleted);
  }

  if (payload.completed) {
    enrollment.completed = true;
    enrollment.progress = 100;
  }

  await enrollment.save();
  return enrollment;
};

const getCourseStatistics = async (courseId: string): Promise<{
  totalEnrollments: number;
  completedStudents: number;
  averageProgress: number;
}> => {
  const enrollments = await UserCourse.find({ course: courseId });

  const totalEnrollments = enrollments.length;
  const completedStudents = enrollments.filter(e => e.completed).length;
  const averageProgress = totalEnrollments > 0
    ? enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments
    : 0;

  return {
    totalEnrollments,
    completedStudents,
    averageProgress,
  };
};

const isUserEnrolled = async (userId: string, courseId: string): Promise<boolean> => {
  const enrollment = await UserCourse.findOne({
    user: userId,
    course: courseId,
  });

  return !!enrollment;
};

// Get enrollment status with details
const getEnrollmentStatus = async (userId: string, courseId: string): Promise<{
  isEnrolled: boolean;
  enrollmentId?: string;
  status: 'not_found' | 'pending' | 'approved';
}> => {
  const enrollment = await UserCourse.findOne({
    user: userId,
    course: courseId,
  }, '_id isEnrolled');

  if (!enrollment) {
    return { isEnrolled: false, status: 'not_found' };
  }

  return {
    isEnrolled: enrollment.isEnrolled,
    enrollmentId: enrollment._id?.toString(),
    status: enrollment.isEnrolled ? 'approved' : 'pending'
  };
};

export const UserCourseServices = {
  enrollUserInCourses,
  getUserCourses,
  getSingleUserCourse,
  syncUserProgress,
  getCourseStatistics,
  isUserEnrolled,
  getEnrollmentStatus,
};