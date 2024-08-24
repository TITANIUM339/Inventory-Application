import pool from "./pool.js";

async function getCategories() {
    const { rows } = await pool.query("SELECT * FROM categories");

    return rows;
}

export { getCategories };
