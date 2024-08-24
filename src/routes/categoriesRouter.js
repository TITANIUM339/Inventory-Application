import { Router } from "express";
import controller from "../controllers/categoriesController.js";

const router = Router();

router.get("/", controller.getCategories);
router.route("/new").get().post();
router.get("/:categoryId");
router.route("/:categoryId/edit").get().put();
router.route("/:categoryId/delete").get().delete();
router.route("/:categoryId/new").get().post();

export default router;
