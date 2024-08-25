import pool from "./pool.js";

async function getCategories() {
    const { rows } = await pool.query("SELECT * FROM categories");

    return rows;
}

async function addCategory(name) {
    await pool.query("INSERT INTO categories (name) VALUES ($1)", [name]);
}

async function doesCategoryExist(value) {
    const query = `SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END AS exists FROM categories WHERE ${Number.isInteger(value) ? "id " : "name"} = $1`;

    const { rows } = await pool.query(query, [value]);

    return rows[0].exists;
}

async function getCategory(id) {
    const { rows } = await pool.query(
        "SELECT * FROM categories WHERE id = $1",
        [id],
    );

    return rows[0];
}

export { getCategories, addCategory, doesCategoryExist, getCategory };
