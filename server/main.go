package main

import (
	"encoding/json"
	"log"
	"net/http"
	"slices"
	"strconv"
	"sync/atomic"
)

type todo struct {
	Id          uint32 `json:"id"`
	Description string `json:"description"`
	Done        bool   `json:"done"`
}

type createTodo struct {
	Description string `json:"description"`
	Done        bool   `json:"done"`
}

type updateTodo struct {
	Description *string `json:"description"`
	Done        *bool   `json:"done"`
}

var todos = make(map[uint32]*todo)
var idCounter = atomic.Uint32{}

func main() {
	http.HandleFunc("GET /api/todos", handleGetTodos)
	http.HandleFunc("POST /api/todos", handleCreateTodo)
	http.HandleFunc("DELETE /api/todos/{id}", handleDeleteTodo)
	http.HandleFunc("POST /api/todos/{id}", handleUpdateTodo)
	http.Handle("/", http.FileServer(http.Dir("client")))

	log.Println("Listening at 8080")

	http.ListenAndServe(":8080", nil)
}

func handleGetTodos(w http.ResponseWriter, r *http.Request) {
	result := make([]todo, 0)
	for _, value := range todos {
		result = append(result, *value)
	}
	slices.SortFunc(result, func(a todo, b todo) int { return int(a.Id - b.Id) })
	writeJson(result, w)
}

func handleCreateTodo(w http.ResponseWriter, r *http.Request) {
	ct := createTodo{
		Done: false,
	}

	err := decodeJson(r, &ct, w)
	if err != nil {
		return
	}

	if ct.Description == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Missing field description"))
		return
	}

	id := idCounter.Add(1)
	todo := todo{
		Id:          id,
		Description: ct.Description,
		Done:        ct.Done,
	}
	todos[id] = &todo
	writeJson(todo, w)
}

func handleDeleteTodo(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Bad id"))
		return
	}

	delete(todos, uint32(id))
	w.WriteHeader(http.StatusNoContent)
}

func handleUpdateTodo(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Bad id"))
		return
	}

	todo, ok := todos[uint32(id)]
	if !ok {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	var ut updateTodo
	err = decodeJson(r, &ut, w)
	if err != nil {
		return
	}

	if ut.Description != nil {
		todo.Description = *ut.Description
	}
	if ut.Done != nil {
		todo.Done = *ut.Done
	}

	writeJson(todo, w)
}

func decodeJson(r *http.Request, value any, w http.ResponseWriter) error {
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&value)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return err
	}
	return nil
}

func writeJson(value any, w http.ResponseWriter) error {
	j, err := json.Marshal(value)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return err
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(j)
	return nil
}
