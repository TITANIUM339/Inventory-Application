import { Router } from "express";
import controller from "../controllers/indexController.js";

const router = Router();

router.get("/", controller.get);

export default router;
