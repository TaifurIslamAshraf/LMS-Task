import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodEffects } from "zod";
import fileDelete from "../utils/fileDelete";

const validateRequest =
  (schema: AnyZodObject | ZodEffects<AnyZodObject>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
        cookies: req.cookies,
      });

      return next();
    } catch (error) {
      fileDelete(req, next);
      next(error);
    }
  };

export default validateRequest;
