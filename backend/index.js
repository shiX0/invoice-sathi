const express = require('express')
const { AppError } = require('./middlewares/ErrorHandler')
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))
app.use(AppError)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))