import {
    getCategories,
    addCategory,
    doesCategoryExist,
    getCategory,
    updateCategory,
    getItems,
    doesItemExist,
    addItem,
} from "../models/queries.js";
import customError from "../helpers/customError.js";
import { body, validationResult, matchedData } from "express-validator";

function stringValidationChain(field, max) {
    const upper = field.charAt(0).toUpperCase() + field.slice(1);

    return body(field)
        .trim()
        .customSanitizer((value) => value.replaceAll(/\s+/g, " "))
        .notEmpty()
        .withMessage(`${upper} must not be empty`)
        .isLength({ max })
        .withMessage(`${upper} length must be within ${max} characters`);
}

function categoryNameValidationChain() {
    return stringValidationChain("name", 16).custom(async (value) => {
        if (await doesCategoryExist(value)) {
            throw new Error("Category name already exists");
        }
    });
}

function itemValidationChain() {
    return [
        stringValidationChain("name", 32).custom(async (value) => {
            if (await doesItemExist(value)) {
                throw new Error("Item name already exists");
            }
        }),
        stringValidationChain("description", 256),
        body("price")
            .notEmpty()
            .withMessage("Price must not be empty")
            .isFloat({ min: 0, max: 100_000 })
            .withMessage("Price must be between 0 and 100000")
            .toFloat(),
        body("stock")
            .notEmpty()
            .withMessage("Stock must not be empty")
            .isInt({ min: 0, max: 1_000 })
            .withMessage("Stock must be between 0 and 1000")
            .toInt(),
        body("url", "Invalid URL")
            .optional({ checkFalsy: true })
            .trim()
            .isURL()
            .isLength({ max: 128 })
            .withMessage("URL length must be within 128 characters"),
    ];
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
    postCategoryItemsNew: [
        itemValidationChain(),
        async (req, res, next) => {
            const { categoryId } = matchedData(req);
            const result = validationResult(req);

            try {
                if (!result.isEmpty()) {
                    const errors = result.array();
                    const { name } = await getCategory(categoryId);

                    res.status(400).render("pages/itemForm", {
                        title: "New item - Inventory Application",
                        heading: `New item in ${name}`,
                        action: `${categoryId}/new`,
                        name: req.body.name,
                        description: req.body.description,
                        price: req.body.price,
                        stock: req.body.stock,
                        url: req.body.url,
                        password: false,
                        errors: errors,
                        button: "Add",
                    });

                    return;
                }
                
                const { name, description, price, stock, url } = matchedData(req);

                await addItem(name, description, price, stock, url, categoryId);

                res.redirect(`/categories/${categoryId}`);
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
        }
    ],
};
