import { Hono } from "hono";
import sql from './db/db'

const app = new Hono()

app.get('/storage-value', async c => {
    const res = await sql`SELECT fname, SUM(quantity * price) as value FROM (
        SELECT f.name as fname, quantity, price FROM component
        JOIN position p ON p.id = position
        JOIN storage s ON s.id = p.storage
        JOIN facility f ON f.id = s.facility
    ) GROUP BY fname ORDER BY value DESC
    `

    const resp = res.map((c: { fname: string, value: string }) => ({ fname: c.fname, price: parseFloat(c.value) }))

    return c.json(resp, 200)
})

app.get('/supplier-value', async c => {
    const res = await sql`SELECT supplier, SUM(price) as value FROM purchase GROUP BY supplier`

    const resp = res.map((c: { supplier: string, value: string }) => ({ supplier: c.supplier, price: parseFloat(c.value) }))

    return c.json(resp, 200)
})

app.get('/expensive-projects', async c => {
    const { cost } = c.req.query();

    if (cost == undefined) return c.text("Cost is undefined", 400)

    const res = await sql`SELECT p.name as name, SUM(c.price * i.quantity) AS total_cost
    FROM project p JOIN includes i on p.name = i.project_name
    JOIN component c ON i.component_part_num = c.part_num
    GROUP BY p.name
    HAVING SUM(c.price * i.quantity) > ${cost}`

    const resp = res.map((c: { name: string, total_cost: string }) => ({ name: c.name, total_cost: parseFloat(c.total_cost)}))

    return c.json(resp, 200)
})

export default app
