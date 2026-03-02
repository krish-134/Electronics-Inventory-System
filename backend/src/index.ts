import { Hono } from 'hono'
import sql from './db/db'
import 'dotenv/config'

const app = new Hono()

app.get('/', (c) => {
    (async () => {
        console.log(await sql`SELECT * FROM component FULL JOIN resistor ON component.part_num = resistor.part_num;`)
    })()

    return c.text('Hello Hono!')
})

export default app
