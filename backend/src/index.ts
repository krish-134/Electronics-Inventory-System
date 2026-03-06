import { Hono } from 'hono'
import sql from './db/db'
import 'dotenv/config'

import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(logger())
app.use(cors())

app.get('/', (c) => {
    (async () => {
        console.log(await sql`SELECT * FROM component FULL JOIN resistor ON component.part_num = resistor.part_num;`)
    })()

    return c.text('Hello Hono!')
})

app.get('/:table/all', async c => {
    const { table } = c.req.param()

    const res = await sql`SELECT * FROM ${sql(table)};`

    return c.json(res)
})

app.post('/component/create', async c => {
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

// temp endpoint to showcase database tuple edits
app.put('/component/:part_num/price', async (c) => {
    const { part_num } = c.req.param();
    const  body  = await c.req.json();

    await sql`
        UPDATE component 
        SET price = ${body.price} 
        WHERE part_num = ${part_num}
    `;

    return c.json(body, 200)
});

export default app
