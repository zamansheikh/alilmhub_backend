import express, { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ReferenceRoutes } from "../modules/references/references.route";
import { TopicRoutes } from "../modules/topic/topic.route";

const router: Router = express.Router();

const apiRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/reference",
    route: ReferenceRoutes,
  },
  {
    path: "/topic",
    route: TopicRoutes,
  },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

