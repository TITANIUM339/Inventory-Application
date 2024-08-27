import {
    getCategories,
    addCategory,
    doesCategoryExist,
    getCategory,
    updateCategory,
    getItems,
} from "../models/queries.js";
import customError from "../helpers/customError.js";
import { body, validationResult, matchedData } from "express-validator";

function categoryNameValidationChain() {
    return body("name")
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
        });
}

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
        res.render("pages/categoryForm", {
            title: "New category - Inventory Application",
            heading: "New category",
            input: null,
            button: "Add",
            errors: null,
            action: "new",
            password: false,
        });
    },
    postCategoriesNew: [
        categoryNameValidationChain(),
        async (req, res, next) => {
            const result = validationResult(req);

            if (!result.isEmpty()) {
                const errors = result.array();

                res.status(400).render("pages/categoryForm", {
                    title: "New category - Inventory Application",
                    heading: "New category",
                    input: req.body.name,
                    button: "Add",
                    errors,
                    action: "new",
                    password: false,
                });

                return;
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
    async getCategoryEdit(req, res, next) {
        try {
            const { categoryId } = matchedData(req);
            const { name } = await getCategory(categoryId);

            res.render("pages/categoryForm", {
                title: "Edit category - Inventory Application",
                heading: "Edit category",
                input: name,
                button: "Rename",
                errors: null,
                action: `${categoryId}/edit`,
                password: true,
            });
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
    postCategoryEdit: [
        categoryNameValidationChain(),
        body("password")
            .notEmpty()
            .withMessage("Password must not be empty")
            .equals(process.env.ADMIN_PASSWORD)
            .withMessage("Wrong password"),
        async (req, res, next) => {
            const { categoryId } = matchedData(req);
            const result = validationResult(req);

            if (!result.isEmpty()) {
                const errors = result.array();

                res.status(400).render("pages/categoryForm", {
                    title: "Edit category - Inventory Application",
                    heading: "Edit category",
                    input: req.body.name,
                    button: "Rename",
                    errors,
                    action: `${categoryId}/edit`,
                    password: true,
                });

                return;
            }

            try {
                const { name } = matchedData(req);

                await updateCategory(categoryId, name);

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
    async getCategoryItems(req, res, next) {
        const { categoryId } = matchedData(req);

        try {
            const items = await getItems(categoryId);
            const { name: heading } = await getCategory(categoryId);

            res.render("pages/items", {
                items,
                categoryId,
                heading,
                title: `${heading} - Inventory Application`,
            });
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
    async getCategoryItemsNew(req, res, next) {
        const { categoryId } = matchedData(req);

        try {
            const { name } = await getCategory(categoryId);

            res.render("pages/itemForm", {
                title: "New item - Inventory Application",
                heading: `New item in ${name}`,
                action: `${categoryId}/new`,
                name: null,
                description: null,
                price: null,
                stock: null,
                url: null,
                password: false,
                errors: null,
                button: "Add",
            });
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
};
