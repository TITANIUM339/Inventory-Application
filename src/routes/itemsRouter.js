import { Router } from "express";

const router = Router();

router.get("/");
router.get("/:itemId");
router.route("/:itemId/update").get().put();
router.route("/:itemId/delete").get().delete();

export default router;
