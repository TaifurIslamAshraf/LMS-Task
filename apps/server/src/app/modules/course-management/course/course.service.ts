import httpStatus from "http-status";
import ApiError from "../../../errorHandlers/ApiError";
import { ICourse } from "./course.interface";
import Course from "./course.model";

const createCourse = async (payload: Partial<ICourse>): Promise<ICourse> => {
  try {
    const course = await Course.create(payload);
    return course;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Course with this title already exists"
      );
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create course"
    );
  }
};

const getAllCourses = async (search?: string): Promise<ICourse[]> => {
  let query = {};

  if (search) {
    query = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    };
  }

  // Public endpoint - populate modules without lecture details
  const courses = await Course.find(query).populate({
    path: 'modules',
    select: 'title moduleNumber isActive', // Only basic module info, no lectures
  });
  return courses;
};

const getCourseById = async (id: string): Promise<ICourse> => {
  const course = await Course.findById(id).populate('modules');

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  return course;
};

const updateCourse = async (
  id: string,
  payload: Partial<ICourse>
): Promise<ICourse> => {
  try {
    const course = await Course.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).populate('modules');

    if (!course) {
      throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
    }

    return course;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Course with this title already exists"
      );
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update course"
    );
  }
};

const deleteCourse = async (id: string): Promise<ICourse> => {
  const course = await Course.findByIdAndDelete(id);

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  return course;
};


export const CourseServices = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};