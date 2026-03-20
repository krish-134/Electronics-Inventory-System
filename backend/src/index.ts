import { Hono } from 'hono'
import 'dotenv/config'

import component from './component'
import location from './location'
import project from './project'
import shipping from './shipping'

import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(logger())
app.use(cors())

app.get('/', (c) => {
    return c.text('Hello Hono!')
})

app.route('/component', component)
app.route('/location', location)
app.route('/project', project)
app.route('/shipping', shipping)


export default app
