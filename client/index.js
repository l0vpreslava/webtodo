import { TodoService } from "./todo_service.js"

textBoxForm.onsubmit = async (event) => {
    event.preventDefault()

    try {
        const todoService = new TodoService()
        const todo = await todoService.create({ description: textBoxForm.description.value })
        todoElements.append(createTodoElement(todo))
    } finally {
        textBoxForm.description.value = ""
    }
}

async function main() {
    const todoService = new TodoService()
    const todos = await todoService.list()
    for (const todo of todos) {
        todoElements.append(createTodoElement(todo))
    }
}

function createTodoElement({ id, description, done }) {
    const todoService = new TodoService()

    const div = document.createElement("div")
    div.id = `todo-${id}`

    const save = async (event) => {
        await todoService.update({ id, description: text.value, done: checkBox.checked })
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
    deleteButton.onclick = async (event) => {
        await todoService.delete(id)
        div.remove()
    }


    div.append(checkBox, text, deleteButton)

    return div
}

main()