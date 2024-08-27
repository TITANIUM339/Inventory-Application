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
        .isInt({ min: 1 })
        .toInt()
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

router.get("/:categoryId", controller.getCategoryItems);
router
    .route("/:categoryId/edit")
    .get(controller.getCategoryEdit)
    .post(controller.postCategoryEdit);
router.route("/:categoryId/delete").get().post();
router.route("/:categoryId/new").get(controller.getCategoryItemsNew).post();

export default router;
