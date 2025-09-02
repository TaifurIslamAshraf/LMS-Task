import { Router } from "express";
import uploadRoute from "../modules/uploads/upload.route";
import authRouter from "../modules/auth/auth.route";
import userRouter from "../modules/users/user.route";

const router = Router();

const moduleRoutes = [
    {
      path: "/users",
      route: userRouter,
    },
    {
      path: "/auth",
      route: authRouter,
    },
  {
    path: "/uploads",
    route: uploadRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));


export default router;
