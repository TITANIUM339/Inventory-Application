import { getItems } from "../models/queries.js";
import customError from "../helpers/customError.js";

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
};
