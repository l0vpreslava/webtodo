textBoxForm.onsubmit = async (event) => {
    event.preventDefault()

    try {
        const description = textBoxForm.description.value
        const res = await postJson("/todos", { description })
        if (!res.ok) {
            throw "Could not save todo on the server :("
        }

        const todo = await res.json()
        todoElements.append(createTodoElement(todo))
    } finally {
        textBoxForm.description.value = ""
    }
}

async function main() {
    const res = await fetch("/todos")
    const todos = await res.json()
    for (const todo of todos) {
        todoElements.append(createTodoElement(todo))
    }
}

function createTodoElement({ id, description, done }) {
    const div = document.createElement("div")
    div.id = `todo-${id}`

    const save = (event) => {
        const req = { id, description: text.value, done: checkBox.checked }
        postJson(`/todos/${id}`, req)
    }

    const checkBox = document.createElement("input")
    checkBox.type = "checkbox"
    checkBox.checked = done
    checkBox.onchange = save

    const text = document.createElement("input")
    text.value = description
    text.onchange = save
    text.onsubmit = (event) => event.preventDefault()

    const deleteButton = document.createElement("button")
    deleteButton.innerText = "🗑️"
    deleteButton.onclick = (event) => {
        fetch(`/todos/${id}`, { method: "DELETE" })
        div.remove()
    }


    div.append(checkBox, text, deleteButton)

    return div
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

main()