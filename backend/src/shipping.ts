import { Hono } from 'hono'
import sql from './db/db'

const app = new Hono()

// -------------- SUPPLIER --------------
app.get('/supplier', async c => {
    return c.json(await sql`SELECT * FROM supplier`)
})

app.post('/supplier', async c => {
    const body = await c.req.json()
    const {
        name,
        url,
        country,
        contact_email,
    } = body
    await sql`
    INSERT INTO supplier (
        name,
        url,
        country,
        contact_email
    ) VALUES (
        ${name},
        ${url},
        ${country},
        ${contact_email ?? null}
    );`
    
    return c.json(body, 200)
})

app.put('/supplier/:name',  async c => {
    const { name } = c.req.param()
    const body = await c.req.json()
    const {
        name: new_name,
        url,
        country,
        contact_email,
    } = body
    await sql`
    UPDATE supplier SET
        name = ${new_name},
        url = ${url},
        country = ${country},
        contact_email = ${contact_email ?? null}
        WHERE name = ${name}`

    return c.json(name, 200)
})

app.delete('/supplier/:name', async c => {
    const { name } = c.req.param();
    
    try {
        await sql`
            DELETE FROM supplier
            WHERE name = ${name}`
        return c.json(name, 200)
    } catch (e: any) {
        if (e.code === '23503') {
            return c.json({ error: `Cannot delete ${name} - it is still referenced by a component` }, 409)
        }
        return c.json({ error: e.message }, 500 )
    }
})

// -------------- COURIERS --------------
app.get('/courier', async c => {
    return c.json(await sql`SELECT * FROM courier`)
})

app.post('/courier', async c => {
    const body = await c.req.json()
    const {
        name,
        code_format,
        website,
        contact_email,
    } = body
    await sql`
        INSERT INTO courier (
            name,
            code_format,
            website,
            contact_email
        ) VALUES (
            ${name},
            ${code_format ?? null},
            ${website},
            ${contact_email ?? null}
        );`
    return c.json(body, 200)
})

app.put('/courier/:name',  async c => {
    const { name } = c.req.param()
    const body = await c.req.json()
    const {
        name: new_name,
        code_format,
        website,
        contact_email,
    } = body
    await sql`
        UPDATE courier SET
            name = ${new_name},
            code_format = ${code_format ?? null},
            website = ${website},
            contact_email = ${contact_email ?? null}
            WHERE name = ${name}`

    return c.json(name, 200)
})

app.delete('/courier/:name', async c => {
    const { name } = c.req.param();
    await sql`
        DELETE FROM courier
        WHERE name = ${name}`
    return c.json(name, 200)
})

// -------------- PURCHASES --------------
app.get('/purchase', async c => {
    return c.json(await sql`SELECT * FROM purchase`)
})

app.post('/purchase', async c => { 
    const body = await c.req.json()
    const { 
        order_number, 
        price, 
        tracking_code, 
        date_placed, 
        delivery_date, 
        supplier, 
        courier,
    } = body
    await sql`
    INSERT INTO purchase (
        order_number, 
        price, 
        tracking_code, 
        date_placed, 
        delivery_date, 
        supplier, 
        courier
        ) VALUES (
        ${order_number},
        ${price},
        ${tracking_code ?? null},
        ${date_placed},
        ${delivery_date ?? null},
        ${supplier},
        ${courier ?? null}
        );`

    return c.json(body, 200)
})

app.put('/purchase/:order_number', async c => {
    const { order_number } = c.req.param()
    const body = await c.req.json()
    const { 
        order_number : new_order_num, 
        price, 
        tracking_code, 
        date_placed, 
        delivery_date, 
        supplier, 
        courier,
    } = body
    await sql`
        UPDATE purchase SET
            order_number = ${new_order_num},
            price = ${price},
            tracking_code = ${tracking_code ?? null},
            date_placed = ${date_placed},
            delivery_date = ${delivery_date ?? null},
            supplier = ${supplier},
            courier = ${courier ?? null}
        WHERE order_number = ${order_number}`
    return c.json(order_number, 200)
})

app.delete('purchase/:order_number', async c => {
    const { order_number } = c.req.param();
    await sql`
        DELETE FROM purchase
        WHERE order_number = ${order_number}`
    return c.json(order_number, 200)
})

export default app
