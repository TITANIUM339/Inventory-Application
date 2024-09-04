import { body } from "express-validator";
import { doesCategoryExist, doesItemExist } from "../models/queries.js";

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
        stringValidationChain("name", 32).custom(
            async (
                value,
                {
                    req: {
                        res: {
                            locals: { categoryId },
                        },
                    },
                },
            ) => {
                if (await doesItemExist(value, categoryId)) {
                    throw new Error("Item name already exists");
                }
            },
        ),
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

function passwordValidationChian() {
    return body("password")
        .notEmpty()
        .withMessage("Password must not be empty")
        .equals(process.env.ADMIN_PASSWORD)
        .withMessage("Wrong password");
}

export {
    categoryNameValidationChain,
    itemValidationChain,
    passwordValidationChian,
};
