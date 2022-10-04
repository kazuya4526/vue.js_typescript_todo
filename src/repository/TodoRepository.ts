import {parse, format} from 'date-fns'

const KEY_TODO_ID_SEQUENCE = "todoIdSequence"
const KEY_TOOD_INFO = "todoInfo"

export type TodoInfo = {
    id: number
    task: string
    registerDate: string
    expirationDate: string
    progress: string
}

export const progress: string[] = ["未着手", "進行中", "完了"]

export class TodoRepository {

    getAll(): Array<TodoInfo> {

        const todo = localStorage.getItem(KEY_TOOD_INFO)
        if (todo) {
            return JSON.parse(todo)
        } else {
            return []
        }
    }

    register(todoInfo: TodoInfo): void {
        // バリデーション
        const errorMessage = this.validate(todoInfo)
        if(errorMessage) {
            throw new Error(errorMessage)
        }
        // 登録日設定
        todoInfo.registerDate = format(new Date(), 'yyyyMMdd')
        // ID払い出し
        todoInfo.id = this.payoutId()
        // 登録
        const todoList = this.getAll()
        todoList.push(todoInfo)
        localStorage.setItem(KEY_TOOD_INFO, JSON.stringify(todoList))
    }

    update(id: number, progress: string) {
        const currentTodo = this.getAll()
        currentTodo.forEach(t => {
            if (t.id === id) {
                t.progress = progress
            }
        })
        localStorage.setItem(KEY_TOOD_INFO, JSON.stringify(currentTodo))
    }

    deleteTodo(id: number): void {
        const currentTodo = this.getAll()
        const newTodo = currentTodo.filter(t => t.id !== id)
        if (currentTodo.length - 1 !== newTodo.length) {
            throw new Error("削除に失敗しました。")
        }
        localStorage.setItem(KEY_TOOD_INFO, JSON.stringify(newTodo))
    }

    private validate(todoInfo: TodoInfo): string {

        let errorMessage = ""
        if (!todoInfo.task) {
            errorMessage += "タスクを入力してください。\n"
        }
        // 期限の日付形式チェック（date-fnsのparseメソッドを使用し、parseに失敗したらエラー。エラー時は文字列で'Invalid Date'が返却される）
        if (todoInfo.expirationDate && parse(todoInfo.expirationDate, "yyyyMMdd", new Date()) == 'Invalid Date') {
            errorMessage += "期限はyyyyMMdd形式で入力してください。\n"
        }
        if (!todoInfo.progress) {
            errorMessage += "進捗を入力してください。"
            // 進捗の整合性チェック。開発者ツールでのプルダウン書き換え対策。
        } else if (todoInfo.progress && !progress.includes(todoInfo.progress)) {
            errorMessage += "不正な進捗が設定されています。"
        }

        return errorMessage
    }

    private payoutId(): number {
        const currentMaxId = localStorage.getItem(KEY_TODO_ID_SEQUENCE)
        if (!currentMaxId) {
            localStorage.setItem(KEY_TODO_ID_SEQUENCE, "1")
            return 1
        }
        const nextId = Number.parseInt(currentMaxId) + 1
        localStorage.setItem(KEY_TODO_ID_SEQUENCE, String(nextId))
        return nextId
    }
}


