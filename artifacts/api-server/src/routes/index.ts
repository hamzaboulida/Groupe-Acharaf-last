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

const router: IRouter = Router();

router.use(seoRouter);
router.use(healthRouter);
router.use(brandsRouter);
router.use(projectsRouter);
router.use(articlesRouter);
router.use(careersRouter);
router.use(leadsRouter);
router.use(subscribersRouter);
router.use(statsRouter);

export default router;
