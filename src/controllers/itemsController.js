import {
    deleteItem,
    getCategory,
    getItem,
    getItems,
    getItem as gi,
    updateItem,
} from "../models/queries.js";
import customError from "../helpers/customError.js";
import { matchedData, validationResult } from "express-validator";
import {
    itemValidationChain,
    passwordValidationChian,
} from "../helpers/validation.js";

export default {
    async getItems(req, res, next) {
        try {
            const items = await getItems();

            res.render("pages/items", {
                title: "All items - Inventory Application",
                heading: "All items",
                items,
                categoryId: null,
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
    async getItem(req, res, next) {
        const { itemId } = matchedData(req);

        try {
            const item = await gi(itemId);
            const { name: category } = await getCategory(item.category_id);

            res.render("pages/item", { item, category });
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
    async getItemEdit(req, res, next) {
        const { itemId } = matchedData(req);

        try {
            const {
                name,
                description,
                price,
                stock,
                image_url: url,
            } = await gi(itemId);

            res.render("pages/itemForm", {
                title: "Edit item - Inventory Application",
                heading: "Edit item",
                action: `items/${itemId}/edit`,
                name,
                description,
                price,
                stock,
                url,
                password: true,
                errors: null,
                button: "Update",
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
    postItemEdit: [
        async (req, res, next) => {
            const { itemId } = matchedData(req);
            const { category_id } = await getItem(itemId);

            res.locals.categoryId = category_id;

            next();
        },
        itemValidationChain(),
        passwordValidationChian(),
        async (req, res, next) => {
            const { itemId } = matchedData(req);
            const result = validationResult(req);

            if (!result.isEmpty()) {
                const errors = result.array();

                res.status(400).render("pages/itemForm", {
                    title: "Edit item - Inventory Application",
                    heading: "Edit item",
                    action: `items/${itemId}/edit`,
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    stock: req.body.stock,
                    url: req.body.url,
                    password: true,
                    errors,
                    button: "Update",
                });

                return;
            }

            try {
                const { name, description, price, stock, url } =
                    matchedData(req);

                await updateItem(itemId, name, description, price, stock, url);

                res.redirect(`/categories/${res.locals.categoryId}`);
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
    async getItemDelete(req, res, next) {
        const { itemId } = matchedData(req);

        try {
            const { name } = await gi(itemId);

            res.render("pages/delete", {
                title: "Delete item - Inventory Application",
                heading: `Delete ${name}`,
                action: `items/${itemId}/delete`,
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
    postItemDelete: [
        passwordValidationChian(),
        async (req, res, next) => {
            const result = validationResult(req);
            const { itemId } = matchedData(req);

            try {
                const { name, category_id } = await gi(itemId);

                if (!result.isEmpty()) {
                    const errors = result.array();

                    res.status(400).render("pages/delete", {
                        title: "Delete item - Inventory Application",
                        heading: `Delete ${name}`,
                        action: `items/${itemId}/delete`,
                        errors,
                    });

                    return;
                }

                await deleteItem(itemId);

                res.redirect(`/categories/${category_id}`);
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
