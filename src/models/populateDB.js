import "dotenv/config";
import pg from "pg";

const SQL = `
    CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(16) NOT NULL);

    INSERT INTO categories (name) VALUES ('Processors'), ('Graphics cards');

    CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(32) NOT NULL,
        description VARCHAR(256) NOT NULL,
        price REAL NOT NULL,
        stock SMALLINT NOT NULL,
        image_url VARCHAR(128) NOT NULL,
        category_id INTEGER REFERENCES categories
    );

    INSERT INTO items (
        name,
        description,
        price,
        stock,
        image_url,
        category_id
    )
    VALUES (
        'AMD Ryzen™ 9 9950X Processor',
        '# of CPU Cores: 16, # of Threads: 32, Max Boost Clock: Up to 5.7 GHz, Base Clock: 4.3 GHz, Default TDP: 170W, Graphics Model: AMD Radeon™ Graphics',
        700,
        15,
        'https://c1.neweggimages.com/ProductImage/19-113-841-03.png',
        1
    ), (
        'GeForce RTX 4080 SUPER',
        'Supercharge your PC with the NVIDIA® GeForce RTX™ 4080 SUPER. Bring your games and creative projects to life with accelerated ray tracing and AI-powered graphics.',
        999,
        10,
        'https://dlcdnwebimgs.asus.com/gain/27ba1b8a-1018-455b-9859-8a8b7974a5e9/w692',
        2
    );
`;

async function main() {
    console.log("seeding...");

    const client = new pg.Client({ connectionString: process.env.DB_URI });

    await client.connect();
    await client.query(SQL);
    await client.end();

    console.log("done");
}

main();
