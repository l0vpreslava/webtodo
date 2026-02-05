import express from "express"

const app = express()

app.use(express.static("client"))
app.use(express.json())
let todos = new Map()
let idCounter = 0

app.get("/api/todos", (req, res) => {
    res.send(todos.values().toArray())
})

app.post("/api/todos", (req, res) => {
    let { done, description } = req.body
    if (!done) done = false;
    if (typeof done !== "boolean" || typeof description !== "string") {
        res.status(400).end()
        return
    }

    const id = idCounter++
    const todo = { id, done, description }
    todos.set(id, todo)
    res.send(todo)
})

app.delete("/api/todos/:id", (req, res) => {
    const id = Number(req.params.id)
    todos.delete(id)
    res.end()
})

app.post("/api/todos/:id", (req, res) => {
    const id = Number(req.params.id)
    const { done, description } = req.body
    if (typeof done !== "boolean" || typeof description !== "string") {
        res.status(400).end()
        return
    }

    const todo = { id, done, description }
    todos.set(id, todo)
    res.send(todos)
})

const port = 9000
app.listen(port, () => { console.log(`Listenning at ${port}`) })