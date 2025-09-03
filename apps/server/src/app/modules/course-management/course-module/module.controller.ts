import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../middlewares/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { ModuleServices } from "./module.service";

// Create a new module
export const createModule = catchAsync(async (req: Request, res: Response) => {
  const moduleData = req.body;
  const module = await ModuleServices.createModule(moduleData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Module created successfully",
    data: module,
  });
});

// Get all modules
export const getAllModules = catchAsync(async (req: Request, res: Response) => {
  const modules = await ModuleServices.getAllModules();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Modules retrieved successfully",
    data: modules,
  });
});

// Get a single module by ID
export const getModuleById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const module = await ModuleServices.getModuleById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Module retrieved successfully",
    data: module,
  });
});

// Get modules by course ID
export const getModulesByCourseId = catchAsync(
  async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const modules = await ModuleServices.getModulesByCourseId(courseId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Modules retrieved successfully",
      data: modules,
    });
  }
);

// Update a module
export const updateModule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const module = await ModuleServices.updateModule(id, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Module updated successfully",
    data: module,
  });
});

// Delete a module
export const deleteModule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const module = await ModuleServices.deleteModule(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Module deleted successfully",
    data: module,
  });
});

// Reorder modules for a course
export const reorderModules = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const modules = await ModuleServices.reorderModules(courseId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Modules reordered successfully",
    data: modules,
  });
});