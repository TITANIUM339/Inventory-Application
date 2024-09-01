import { Router } from "express";
import controller from "../controllers/itemsController.js";

const router = Router();

router.get("/", controller.getItems);
router.get("/:itemId");
router.route("/:itemId/update").get().put();
router.route("/:itemId/delete").get().delete();

export default router;
