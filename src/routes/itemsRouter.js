import { Router } from "express";
import controller from "../controllers/itemsController.js";
import { param, validationResult } from "express-validator";
import { doesItemExist } from "../models/queries.js";

const router = Router();

router.get("/", controller.getItems);

router.use("/:itemId", [
    param("itemId")
        .isInt({ min: 1 })
        .toInt()
        .custom(async (value) => {
            if (!(await doesItemExist(value))) {
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

router.get("/:itemId", controller.getItem);
router
    .route("/:itemId/edit")
    .get(controller.getItemEdit)
    .post(controller.postItemEdit);
router.route("/:itemId/delete").get(controller.getItemDelete).post();

export default router;
