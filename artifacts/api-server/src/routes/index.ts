import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import postsRouter from "./posts";
import analyticsRouter from "./analytics";
import socialRouter from "./social";
import mediaRouter from "./media";
import companiesRouter from "./companies";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/ai", aiRouter);
router.use("/posts", postsRouter);
router.use("/analytics", analyticsRouter);
router.use("/social-accounts", socialRouter);
router.use("/media", mediaRouter);
router.use("/companies", companiesRouter);
router.use("/profiles", companiesRouter);

export default router;
