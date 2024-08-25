import { Router } from "express";
import controller from "../controllers/categoriesController.js";
import { param, validationResult } from "express-validator";
import { doesCategoryExist } from "../models/queries.js";

const router = Router();

router.get("/", controller.getCategories);
router
    .route("/new")
    .get(controller.getCategoriesNew)
    .post(controller.postCategoriesNew);

router.use("/:categoryId", [
    param("categoryId")
        .toInt()
        .isInt({ min: 1 })
        .custom(async (value) => {
            if (!(await doesCategoryExist(value))) {
                throw new Error();
            }
        }),
    (req, res, next) => {
        if (!validationResult(req).isEmpty()) {
            next("router");
            return;
        }

        next();
    },
]);

router.get("/:categoryId");
router.route("/:categoryId/edit").get(controller.getCategoryEdit).post();
router.route("/:categoryId/delete").get().post();
router.route("/:categoryId/new").get().post();

export default router;
