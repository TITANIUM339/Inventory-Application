import { getCategories } from "../models/queries.js";
import customError from "../helpers/customError.js";

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
        res.render("pages/newCategory");
    }
};
