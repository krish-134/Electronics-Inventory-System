import { Hono } from "hono";
import sql from './db/db'

const app = new Hono()

app.get('/', async c => {
    return c.json(await sql`SELECT * FROM component`)
})

app.post('/create', async c => {
    const body = await c.req.json()

    const {
        part_num,
        price,
        name,
        package: pkg,
        tolerance,
        quantity,
        voltage_rating,
        additional,
        storage_name,
        position,
        facility,
        supplier_name
    } = body;

    await sql`INSERT INTO supplier (name, url, country) VALUES ('DigiKey', 'https://digikey.com', 'US') ON CONFLICT DO NOTHING;`

    await sql`INSERT INTO location (storage_name, position, facility) VALUES (${storage_name}, ${position}, ${facility}) ON CONFLICT DO NOTHING;`;

    await sql`
INSERT INTO component (
    part_num,
    price,
    name,
    package,
    tolerance,
    quantity,
    voltage_rating,
    additional,
    storage_name,
    position,
    facility,
    supplier_name
    ) VALUES (
    ${part_num},
    ${price},
    ${name},
    ${pkg},
    ${tolerance},
    ${quantity},
    ${voltage_rating},
    ${additional},
    ${storage_name},
    ${position},
    ${facility},
    ${supplier_name}
    );`

    return c.json(body, 200)
})

app.delete("/:part_num", async (c) => {
    const { part_num } = c.req.param();

    await sql`
        DELETE 
        FROM component
        WHERE part_num = ${part_num}
    `;

    return c.json(part_num, 200)
})

export default app
