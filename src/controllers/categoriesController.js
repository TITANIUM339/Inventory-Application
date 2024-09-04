import {
    getCategories,
    addCategory,
    getCategory,
    updateCategory,
    getItems,
    addItem,
    deleteCategory,
} from "../models/queries.js";
import customError from "../helpers/customError.js";
import { validationResult, matchedData } from "express-validator";
import {
    categoryNameValidationChain,
    passwordValidationChian,
    itemValidationChain,
} from "../helpers/validation.js";

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
        passwordValidationChian(),
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
                action: `categories/${categoryId}/new`,
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
        (req, res, next) => {
            const { categoryId } = matchedData(req);

            res.locals.categoryId = categoryId;

            next();
        },
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
                        action: `categories/${categoryId}/new`,
                        name: req.body.name,
                        description: req.body.description,
                        price: req.body.price,
                        stock: req.body.stock,
                        url: req.body.url,
                        password: false,
                        errors,
                        button: "Add",
                    });

                    return;
                }

                const { name, description, price, stock, url } =
                    matchedData(req);

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
        },
    ],
    async getCategoryDelete(req, res, next) {
        const { categoryId } = matchedData(req);

        try {
            const { name } = await getCategory(categoryId);

            res.render("pages/delete", {
                title: "Delete category - Inventory Application",
                heading: `Delete ${name}`,
                action: `categories/${categoryId}/delete`,
                errors: null,
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
    postCategoryDelete: [
        passwordValidationChian(),
        async (req, res, next) => {
            const { categoryId } = matchedData(req);
            const result = validationResult(req);

            try {
                const { name } = await getCategory(categoryId);

                if (!result.isEmpty()) {
                    const errors = result.array();

                    res.status(400).render("pages/delete", {
                        title: "Delete category - Inventory Application",
                        heading: `Delete ${name}`,
                        action: `categories/${categoryId}/delete`,
                        errors: errors,
                    });

                    return;
                }

                await deleteCategory(categoryId);

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
