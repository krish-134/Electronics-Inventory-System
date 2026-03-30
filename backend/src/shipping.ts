import { Hono } from 'hono'
import sql from './db/db'

const app = new Hono()

app.get('/supplier', async c => {
    return c.json(await sql`SELECT * FROM supplier`)
})

app.get('/courier', async c => {
    return c.json(await sql`SELECT * FROM courier`)
})

app.get('/purchase', async c => {
    return c.json(await sql`SELECT * FROM purchase`)
})

export default app
