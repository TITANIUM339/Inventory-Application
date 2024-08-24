import { Router } from "express";
import controller from "../controllers/categoriesController.js";

const router = Router();

router.get("/", controller.getCategories);
router.route("/new").get().post();
router.get("/:category");
router.route("/:category/edit").get().put();
router.route("/:category/delete").get().delete();
router.route("/:category/new").get().post();

export default router;
