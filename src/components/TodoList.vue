<template>
    <div>
        <h5 class="text-center">TODO一覧</h5>
        <div>

        </div>
        <div class="todo-table">
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th width="50px">No</th>
                        <th class="link-primary" :class="sortMark('task')" @click="sortTodo('task')">タスク</th>
                        <th width="150px" class="text-center link-primary" :class="sortMark('registerDate')" @click="sortTodo('registerDate')">登録日</th>
                        <th width="150px" class="text-center link-primary" :class="sortMark('expirationDate')" @click="sortTodo('expirationDate')">期限</th>
                        <th width="120px" class="text-center link-primary" :class="sortMark('progress')" @click="sortTodo('progress')">進捗</th>
                        <th width="100px" class="text-center">更新</th>
                        <th width="100px" class="text-center">削除</th>
                    </tr>
                </thead>
                <tbody>
                    <tr :class="decideRowColor(todo.progress, todo.expirationDate)" v-for="(todo, index) in registeredTodo" :key="todo.id">
                        <td>{{index + 1}}</td>
                        <td>{{todo.task}}</td>
                        <td class="text-center">{{formatDate(todo.registerDate)}}</td>
                        <td class="text-center">{{formatDate(todo.expirationDate)}}</td>
                        <td>
                            <select class="form-control text-center" v-model="todo.progress">
                                <option>未着手</option>
                                <option>進行中</option>
                                <option>完了</option>
                            </select>
                        </td>
                        <td class="text-center"><button class="btn btn-primary" @click="update(todo.id, todo.progress)">更新</button></td>
                        <td class="text-center"><button class="btn btn-primary" @click="deleteTodo(todo.id)">削除</button></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h5 class="text-center">TODO登録</h5>
        <div class="container todo-form">
            <div class="row">
                <label class="form-label col-2" for="task">タスク</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="task" v-model="todoForm.task">
                </div>
            </div>
            <div class="row">
                <label class="form-label col-2" for="expier">期限</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="expire" v-model="todoForm.expirationDate">
                </div>
            </div>
            <div class="row">
                <label class="form-label col-2" for="progress">進捗</label>
                <div class="col-10">
                    <select class="form-control" id="progress" v-model="todoForm.progress">
                        <option>{{progress[0]}}</option>
                        <option>{{progress[1]}}</option>
                        <option>{{progress[2]}}</option>
                    </select>
                </div>
            </div>
            <div class="row">
                <button class="btn btn-primary col-1" @click="register">登録</button>
            </div>
            <div class="row">
                <p class="col-12 text-center text-danger prewrap">{{message}}</p>
            </div>
        </div>

    </div>
</template>

<script lang="ts">
import {Component, Prop, Emit, Vue} from 'vue-property-decorator'
import {TodoRepository, TodoInfo, TodoRegisterInfo, progress} from '@/repository/TodoRepository.ts'
import {parse, getDate, getMonth, getYear, isAfter} from 'date-fns'

const todoRepository: TodoRepository = new TodoRepository()

type DataType = {
    progress: Array<string>
    registeredTodo: Array<TodoInfo>
    todoForm: TodoRegisterInfo
    message: string,
    sortStatus: SortStatus
}

type SortStatus = {
    sortKey: string,
    sortDesc: boolean
}

export default Vue.extend({
    name: "todoList",

    data(): DataType {
        return {
            progress: progress,
            registeredTodo: [],
            todoForm: {
                task: "",
                expirationDate: "",
                progress: progress[0]
            },
            message: "",
            sortStatus: {
                sortKey: "progress",
                sortDesc: false
            }
        }
    },

    created(): void {
        this.getAll()
    },

    methods: {

        getAll(): void {
            this.registeredTodo = todoRepository.getAll()
            this.sortTodoWithSortOrder("progress", false)
        },

        register(): void {
            this.message = ""
            try {
                todoRepository.register(this.todoForm)
            } catch (e) {
                this.message = e.message
                return
            }
            this.todoForm.task = ""
            this.todoForm.expirationDate = ""
            this.todoForm.progress = this.progress[0]

            this.message = "登録しました。"
            this.getAll()
            
        },

        update(id: number, progress: string): void {
            try {
                todoRepository.update(id, progress)
            } catch (e) {
                this.message = e.message
                return
            }
            this.message = "更新しました。"
        },

        deleteTodo(id: number) {
            try {
                todoRepository.deleteTodo(id)
            } catch (e) {
                this.message = e.message
                return
            }
            this.message="削除しました。"
            this.getAll()
        },

        formatDate(dateStr: string): string {
            if (!dateStr) {
                return ""
            }
            const dateObj = parse(dateStr, 'yyyyMMdd', new Date())
            const year = getYear(dateObj)
            const month = (getMonth(dateObj) + 1).toString().padStart(2, '0')
            const date = getDate(dateObj).toString().padStart(2, '0')
            return `${year}年${month}月${date}日`   
        },

        decideRowColor(progress: string, expirationDate: string): string {

            const eDate = parse(expirationDate, "yyyyMMdd", new Date())
            const cDate = new Date()
            if (progress != this.progress[2] && isAfter(cDate, eDate)) {
                return "table-danger"
            }

            switch(progress) {
                case(this.progress[0]):
                    return ""
                case(this.progress[1]):
                    return "table-success"
                case(this.progress[2]):
                    return "table-secondary"
                default:
                    return ""
            }
            
        },

        sortTodoWithSortOrder(sortKey: string, sortDesc: boolean): void {
            // 現在のソート状態を保存
            this.sortStatus.sortKey = sortKey
            this.sortStatus.sortDesc = sortDesc

            const sortingNum = sortDesc ? -1 : 1
            switch(sortKey) {
                case("id"):
                    this.registeredTodo.sort((a, b) => a.id >= b.id ? sortingNum : sortingNum * -1)
                    break;
                case("task"):
                    this.registeredTodo.sort((a, b) => a.task > b.task ? sortingNum : sortingNum * -1)
                    break;
                case("registerDate"):
                    this.registeredTodo.sort((a, b) => a.registerDate > b.registerDate ? sortingNum : sortingNum * -1)
                    break;
                case("expirationDate"):
                    this.registeredTodo.sort((a, b) => a.expirationDate > b.expirationDate ? sortingNum : sortingNum * -1)
                    break;
                case("progress"):
                    this.registeredTodo.sort((a, b) => this.progress.indexOf(a.progress) > this.progress.indexOf(b.progress) ? sortingNum : sortingNum * -1)
                    break;
                default:
                    break;
            }
        },

        sortTodo(sortKey: string): void {
            
            // 同一キーに対してソートした場合、昇順と降順を切り替える
            if (this.sortStatus.sortKey == sortKey) {
                this.sortStatus.sortDesc = !this.sortStatus.sortDesc
            } else {
                // 前回ソート時とソートキーが変更された場合は昇順固定
                this.sortStatus.sortKey = sortKey
                this.sortStatus.sortDesc = false
            }
            this.sortTodoWithSortOrder(sortKey, this.sortStatus.sortDesc)
        },

        sortMark(columnName: string): string {
            if (this.sortStatus.sortKey != columnName) {
                return ""
            }
            if (this.sortStatus.sortDesc) {
                return "sort_desc"
            } else {
                return "sort_asc"
            }
        }
    }
})
</script>

<style scoped>
.prewrap {
    white-space: pre-wrap;
}
.todo-table {
    margin: 0 auto;
    width: 60%;
}
.todo-form {
    margin: 0 auto;
    width: 60%;
}
.sort_asc:after {
    content: '↑'
}
.sort_desc:after {
    content: '↓'
}
</style>