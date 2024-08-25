import { getCategories, addCategory, doesCategoryExist} from "../models/queries.js";
import customError from "../helpers/customError.js";
import { body, validationResult, matchedData } from "express-validator";

export default {
    async getCategories(req, res, next) {
        try {
            const categories = await getCategories();

            res.render("pages/categories", { categories });
        } catch (error) {
            console.error(error);
            next(
                new customError(
                    "Internal Server Error",
                    "Something unexpected has occurred. Try reloading the page.",
                    500,
                ),
            );
        }
    },
    getCategoriesNew(req, res) {
        res.render("pages/newCategory", { errors: null });
    },
    postCategoriesNew: [
        body("name")
            .trim()
            .customSanitizer((value) => value.replaceAll(/\s+/g, " "))
            .notEmpty()
            .withMessage("Name must not be empty")
            .isLength({ max: 16 })
            .withMessage("Name length must be within 16 characters")
            .custom(async (value) => {
                if (await doesCategoryExist(value)) {
                    throw new Error("Category name already exists");
                }
            }),
        async (req, res, next) => {
            const result = validationResult(req);

            if (!result.isEmpty()) {
                return res.render("pages/newCategory", { errors: result.array() });
            }
            
            try {
                const { name } = matchedData(req);

                await addCategory(name);

                res.redirect("/categories");
            } catch (error) {
                console.error(error);
                next(
                    new customError(
                        "Internal Server Error",
                        "Something unexpected has occurred. Try reloading the page.",
                        500,
                    ),
                );
            }
        },
    ],
};
