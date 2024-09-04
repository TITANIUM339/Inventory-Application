import { getCategory, getItems, getItem as gi } from "../models/queries.js";
import customError from "../helpers/customError.js";
import { matchedData } from "express-validator";

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
};
