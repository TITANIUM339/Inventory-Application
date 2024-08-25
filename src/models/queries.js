import pool from "./pool.js";

async function getCategories() {
    const { rows } = await pool.query("SELECT * FROM categories");

    return rows;
}

async function addCategory(name) {
    await pool.query("INSERT INTO categories (name) VALUES ($1)", [name]);
}

async function doesCategoryExist(name) {
    const { rows } = await pool.query("SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END AS exists FROM categories WHERE name = $1", [name]);

    return rows[0].exists;
}

export { getCategories, addCategory, doesCategoryExist };
