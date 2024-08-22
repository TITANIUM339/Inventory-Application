import { Router } from "express";

const router = Router();

router.get("/");
router.route("/new").get().post();
router.get("/:category");
router.route("/:category/update").get().put();
router.route("/category/delete").get().delete();
router.route("/:category/new").get().post();

export default router;
