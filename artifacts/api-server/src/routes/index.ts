import { Router, type IRouter } from "express";
import healthRouter from "./health";
import brandsRouter from "./brands";
import projectsRouter from "./projects";
import articlesRouter from "./articles";
import careersRouter from "./careers";
import leadsRouter from "./leads";
import subscribersRouter from "./subscribers";
import statsRouter from "./stats";
import seoRouter from "./seo";
import uploadsRouter from "./uploads";
import homepageHeroRouter from "./homepage-hero";
import adminAuthRouter from "./admin-auth";
import { requireAdminAuth } from "../lib/admin-auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminAuthRouter);

router.use(
  [
    "/projects",
    "/projects/:id",
    "/brands",
    "/brands/:id",
    "/articles",
    "/articles/:id",
    "/careers",
    "/careers/:id",
    "/applications",
    "/homepage-hero",
    "/leads",
    "/leads/:id",
    "/subscribers",
    "/subscribers/:id",
    "/uploads/images",
    "/uploads/videos",
    "/uploads",
  ],
  (req, res, next) => {
    const isReadOnlyMethod = req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS";
    const needsAdminForRead =
      req.path.startsWith("/applications") ||
      req.path.startsWith("/leads") ||
      req.path.startsWith("/subscribers");

    if (!isReadOnlyMethod || needsAdminForRead) {
      return requireAdminAuth(req, res, next);
    }
    return next();
  },
);

router.use(uploadsRouter);
router.use(homepageHeroRouter);
router.use(brandsRouter);
router.use(projectsRouter);
router.use(articlesRouter);
router.use(careersRouter);
router.use(leadsRouter);
router.use(subscribersRouter);
router.use(statsRouter);

export default router;
