import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL, {
    password: process.env.POSTGRES_PASSWORD
})

export default sql
