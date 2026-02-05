export class TodoService {
    constructor(baseUrl = "/api/todos") {
        this.baseUrl = baseUrl
    }

    async create({ description, done = false }) {
        const res = await postJson(this.baseUrl, { description, done })
        if (!res.ok) {
            throw "Could not save todo on the server :("
        }

        return await res.json()
    }

    async list() {
        const res = await fetch(this.baseUrl)
        if (!res.ok) {
            throw "Could not get todos from the server"
        }
        return await res.json()
    }

    async update({ id, description, done }) {
        const res = await postJson(`${this.baseUrl}/${id}`, { description, done })
        if (!res.ok) {
            throw "Could not update todo on the server"
        }
        return await res.json()
    }

    async delete(id) {
        const res = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" })
        if (!res.ok) {
            throw "Could not delete todo from the server"
        }
    }
}

function postJson(url, body) {
    return fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    })
}