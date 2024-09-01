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

async function updateCategory(id, newName) {
    await pool.query("UPDATE categories SET name = $1 WHERE id = $2", [
        newName,
        id,
    ]);
}

async function getItems(categoryId) {
    const query1 = "SELECT * FROM items WHERE category_id = $1";
    const query2 = "SELECT * FROM items";

    const { rows } = categoryId
        ? await pool.query(query1, [categoryId])
        : await pool.query(query2);

    return rows;
}

async function addItem(name, description, price, stock, url, categoryId) {
    await pool.query(
        "INSERT INTO items (name, description, price, stock, image_url, category_id) VALUES ($1, $2, $3, $4, $5, $6)",
        [name, description, price, stock, url, categoryId],
    );
}

async function doesItemExist(value, categoryId) {
    const query = `SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END AS exists FROM items WHERE ${Number.isInteger(value) ? "id " : "name"} = $1 AND category_id = $2`;

    const { rows } = await pool.query(query, [value, categoryId]);

    return rows[0].exists;
}

async function deleteCategory(categoryId) {
    await pool.query("DELETE FROM items WHERE category_id = $1", [categoryId]);
    await pool.query("DELETE FROM categories WHERE id = $1", [categoryId]);
}

export {
    getCategories,
    addCategory,
    doesCategoryExist,
    getCategory,
    updateCategory,
    getItems,
    addItem,
    doesItemExist,
    deleteCategory,
};
