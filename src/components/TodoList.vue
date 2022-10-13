<template>
    <div>
        <div v-if="loading" class="loading-background">
            <img src="../assets/loading-l-3.gif" alt="" class="loading">
        </div>
        <h5 class="text-center bg-info">TODO一覧</h5>
        <div class="todo-table">
            <a v-if="dispTarget !== 1" class="link-primary" href="javascript:void(0)" @click="switchDispTarget(1)" >全件</a>
            <span v-else>全件</span>
            <span>｜</span>
            <a v-if="dispTarget !== 2" class="link-primary" href="javascript:void(0)" @click="switchDispTarget(2)" >完了タスク以外</a>
            <span v-else>完了タスク以外</span>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th width="50px">No</th>
                        <th class="link-primary" :class="sortMark('task')" @click="sortTodo('task')">タスク</th>
                        <th width="150px" class="text-center link-primary" :class="sortMark('register_date')" @click="sortTodo('register_date')">登録日</th>
                        <th width="150px" class="text-center link-primary" :class="sortMark('expiration_date')" @click="sortTodo('expiration_date')">期限</th>
                        <th width="120px" class="text-center link-primary" :class="sortMark('progress')" @click="sortTodo('progress')">進捗</th>
                        <th width="100px" class="text-center"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr :class="decideRowColor(todo.progress, todo.expiration_date)" v-for="(todo, index) in dispTodo" :key="todo.id">
                        <td>{{index + 1}}</td>
                        <td>{{todo.task}}</td>
                        <td class="text-center">{{formatDate(todo.register_date)}}</td>
                        <td class="text-center">{{formatDate(todo.expiration_date)}}</td>
                        <td>
                            <select class="form-control text-center" v-model="todo.progress" @change="update(todo.todo_id, todo.progress, todo.version)">
                                <option value="1">未着手</option>
                                <option value="2">進行中</option>
                                <option value="3">完了</option>
                            </select>
                        </td>
                        <td class="text-center"><button class="btn btn-primary" @click="deleteTodo(todo.todo_id, todo.version)">削除</button></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h5 class="text-center bg-info">TODO登録</h5>
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
                    <input class="form-control" type="date" id="expire" v-model="todoForm.expirationDate">
                </div>
            </div>
            <div class="row">
                <label class="form-label col-2" for="progress">進捗</label>
                <div class="col-10">
                    <select class="form-control" id="progress" v-model="todoForm.progress">
                        <option v-for="progress in Object.keys(progressList)" :key="progress" :value="progress">{{progressList[progress]}}</option>
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
import {Vue} from 'vue-property-decorator'
import { AxiosError } from 'axios'
import {TodoRepository, TodoInfo, TodoRegisterInfo, progressList} from '@/repository/TodoRepository'
import {parse, getDate, getMonth, getYear, isAfter} from 'date-fns'

const todoRepository: TodoRepository = new TodoRepository()

// dataブロックで保持するオブジェクトの型情報
type DataType = {
    progressList: {[key: number]: string}
    allTodo: Array<TodoInfo>
    dispTodo: Array<TodoInfo>
    todoForm: TodoRegisterInfo
    message: string,
    sortStatus: SortStatus,
    // 表示対象（1: 全件、2: 完了以外）
    dispTarget: number,
    expirationDateSave: string,
    // ローディング画像表示用フラグ
    // API呼出し中に表示させる
    loading: boolean
}

// 現在のソート状態を表すオブジェクトの型情報
type SortStatus = {
    sortKey: string,
    sortDesc: boolean
}

export default Vue.extend({
    name: "todoList",

    data(): DataType {
        return {
            progressList: progressList,
            allTodo: [],
            dispTodo: [],
            todoForm: {
                task: "",
                expirationDate: "",
                progress: "1"
            },
            message: "",
            sortStatus: {
                sortKey: "expiration_date",
                sortDesc: false
            },
            dispTarget: 2,
            expirationDateSave: "",
            loading: false
        }
    },

    // 初期表示処理。TODO全件取得し、完了タスク以外を表示する。
    created(): void {
        this.loading = true
        this.getAll()
    },

    methods: {

        // TODO一覧を取得してdataに設定。初期ソート条件（期限の昇順）でソートする。
        getAll(): void {
            todoRepository.getAll((data: TodoInfo[]) => {
                this.allTodo = data
                this.sortTodoWithSortOrder("expiration_date", false)
                this.switchDispTarget(this.dispTarget)
                this.loading = false
            }, this.handleError)
        },

        // TODO登録。
        register(): void {

            this.loading = true

            // フォームにyyyy/MM/dd形式で設定されるので、yyyyMMdd形式に変換
            if(this.todoForm.expirationDate) {
                this.expirationDateSave = this.todoForm.expirationDate
                const s = this.todoForm.expirationDate.split("-")
                this.todoForm.expirationDate = s[0] + s[1] + s[2]
            }

            todoRepository.register(this.todoForm, 
                // バリデーションエラー時
                (validationErrorMessage: string) => {
                    this.message = validationErrorMessage
                    this.loading = false
                }, 
                // 正常終了
                (_: string) => {
                    // Formのクリア
                    this.todoForm.task = ""
                    this.todoForm.expirationDate = ""
                    this.todoForm.progress = "1"
                    this.expirationDateSave = ""

                    this.message = "登録しました。"

                    // データ再取得
                    this.getAll()
                }, 
                // APIエラー
                this.handleError
            )
            this.todoForm.expirationDate = this.expirationDateSave
        },

        // TODO進捗更新
        update(id: number, progress: string, version: number): void {

            this.loading = true
            todoRepository.update(id, parseInt(progress), version,  
                // バリデーションエラー時
                (validationErrorMessage: string) => {
                    this.message = validationErrorMessage
                },
                // API正常終了
                (_: string) => {
                    this.message = "更新しました。"
                    // バージョンのインクリメント
                    for(let i = 0; i < this.allTodo.length; i++) {
                        if (this.allTodo[i].todo_id === id) {
                            this.allTodo[i].version += 1
                        }
                    }
                    this.switchDispTarget(this.dispTarget)
                    this.loading = false
                }, 
                // APIエラー
                this.handleError
            )
        },

        // TODO削除
        deleteTodo(id: number, version: number): void {
            this.loading = true
            todoRepository.deleteTodo(id, version, 
                // API正常終了
                (_: string) => {
                    this.message="削除しました。"
                    this.getAll()
                },
                // APIエラー
                this.handleError
            )
        },

        // 共通エラーハンドリング
        handleError(error: AxiosError<{detail: string}>): void {
            // ネットワークエラーまたは5XXエラーの場合はシステムエラー画面に遷移
            if (!error.response || error.response.status >= 500) {
                this.$router.replace("/error")
            } else if (error.response.status = 401) {
                // 認証エラーの場合（401）は、localStorageのaccessTokenをクリアしてログイン画面へ遷移
                localStorage.setItem("accessToken", "")
                alert(error.response.data.detail)
                this.$router.push("/")
            } else {
                // それ以外のエラー（4XXを想定）は、メッセージを画面下部に表示
                this.message = error.response.data.detail
            }
            this.loading = false
        },

        // 日付項目を、画面表示用に加工。
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

        // 進捗と期限によって列色を変える。優先順位は期限 > 進捗。
        decideRowColor(progress: string, expirationDate: string): string {
            // 期限切れの場合は赤
            const eDate = parse(expirationDate, "yyyyMMdd", new Date())
            const cDate = new Date()
            if (progress != "3" && isAfter(cDate, eDate)) {
                return "table-danger"
            }

            if (progress == "1") {
                return ""
            } else if (progress == "2") {
                return "table-success"
            } else if (progress == "3") {
                return "table-secondary"
            } else {
                return ""
            }
        },

        // ソート。
        sortTodo(sortKey: string): void {
            
            // 前回ソート時と同一の列に対してソートした場合、昇順と降順を切り替える
            if (this.sortStatus.sortKey == sortKey) {
                this.sortTodoWithSortOrder(sortKey, !this.sortStatus.sortDesc)
            } else {
                // 前回ソート時とソートキーが異なる場合は昇順固定
                this.sortTodoWithSortOrder(sortKey, false)
            }
        },

        // ソート順も直接指定してソート。
        sortTodoWithSortOrder(sortKey: string, sortDesc: boolean): void {
            // 現在のソート状態を保存
            this.sortStatus.sortKey = sortKey
            this.sortStatus.sortDesc = sortDesc

            const sortingNum = sortDesc ? -1 : 1
            this.dispTodo.sort((a, b) => a[sortKey] >= b[sortKey] ? sortingNum : sortingNum * -1)
        },

        // ソートマーク（↑ or ↓）を付与する。
        sortMark(columnName: string): string {
            if (this.sortStatus.sortKey != columnName) {
                return ""
            }
            if (this.sortStatus.sortDesc) {
                return "sort_desc"
            } else {
                return "sort_asc"
            }
        },

        // 表示対象TODOを切り替える（1:全件, 2: 完了以外）
        switchDispTarget(target: number): void {
            this.dispTarget = target
            if (!this.allTodo) {
                this.allTodo = []
            }
            if (target === 1) {
                this.dispTodo = this.allTodo
            } else if (target === 2) {
                this.dispTodo = this.allTodo.filter(todo => this.progressList[todo.progress] !== this.progressList[3])
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
.loading {
    position: fixed;
    z-index: 1000;
    top: 50%;
    left: 50%;
    background-color: darkgrey;
}
.loading-background {
    position: absolute;
    width: 120%;
    height: 120%;
    top: 0px;
    left: 0px;
    z-index: 999;
    background-color: white;
    opacity: 0.5;
}
</style>