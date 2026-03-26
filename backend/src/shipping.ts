import { Hono } from 'hono'
import sql from './db/db'

const app = new Hono()

app.get('/supplier', async c => {
    return c.json(await sql`SELECT * FROM supplier`)
})

app.get('/courier', async c => {
    return c.json(await sql`SELECT * FROM courier`)
})

// ----- PURCHASES ------
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
        ${supplier ?? null},
        ${courier}
        );`

    return c.json(body, 200)
})

app.put('/purchase/:order_number', async c => {
    const { order_number } = c.req.param();
    const body = await c.req.json();
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
            supplier = ${supplier ?? null},
            courier = ${courier}
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
