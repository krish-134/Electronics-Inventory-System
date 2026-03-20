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

app.get('/components', async c => {
    const res = await sql`SELECT component.part_num, *,
        CASE
            WHEN capacitor.part_num = component.part_num THEN 'Capacitor'
            WHEN resistor.part_num = component.part_num THEN 'Resistor'
            WHEN diode.part_num = component.part_num THEN 'Diode'
            ELSE NULL END AS component_type
    FROM component
    LEFT JOIN capacitor USING (part_num)
    LEFT JOIN resistor USING (part_num)
    LEFT JOIN diode USING (part_num);`

    return c.json(res);
});

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
