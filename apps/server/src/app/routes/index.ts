import { Router } from "express";
import uploadRoute from "../modules/uploads/upload.route";

const router = Router();

const moduleRoutes = [
  //   {
  //     path: "/users",
  //     route: "",
  //   },
  {
    path: "/uploads",
    route: uploadRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

// Upload routes
router.use("/uploads", uploadRoute);

export default router;
