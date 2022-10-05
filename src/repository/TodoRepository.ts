import {parse, format} from 'date-fns'

// ローカルストレージ保存用のキー
// TODO情報
const KEY_TODO_ID_SEQUENCE = "todoIdSequence"
// TODO情報のID管理
const KEY_TOOD_INFO = "todoInfo"

// TODOのEntity情報
export type TodoInfo = {
    id: number
    task: string
    registerDate: string
    expirationDate: string
    progress: string
}

// TODO登録に必要な情報
export type TodoRegisterInfo = {
    task: string
    expirationDate: string
    progress: string
}

// 進捗リスト（プルダウン項目）
export const progress: string[] = ["未着手", "進行中", "完了"]

export class TodoRepository {

    // TODO全件取得
    getAll(): Array<TodoInfo> {

        const todo = localStorage.getItem(KEY_TOOD_INFO)
        if (todo) {
            return JSON.parse(todo)
        } else {
            return []
        }
    }

    // TODO登録
    register(todoRegisterInfo: TodoRegisterInfo): void {
        // バリデーション
        const errorMessage = this.validate(todoRegisterInfo)
        if(errorMessage) {
            throw new Error(errorMessage)
        }

        // 登録日設定
        const registerDate = format(new Date(), 'yyyyMMdd')
        // ID払い出し
        const id = this.payoutId()


        const todoInfo: TodoInfo = {
            id: id,
            task: todoRegisterInfo.task,
            expirationDate: todoRegisterInfo.expirationDate,
            progress: todoRegisterInfo.progress,
            registerDate: registerDate,
        }

        // 登録
        const todoList = this.getAll()
        todoList.push(todoInfo)
        localStorage.setItem(KEY_TOOD_INFO, JSON.stringify(todoList))
    }

    // 更新
    update(id: number, progress: string) {
        const currentTodo = this.getAll()
        currentTodo.forEach(t => {
            if (t.id === id) {
                t.progress = progress
            }
        })
        localStorage.setItem(KEY_TOOD_INFO, JSON.stringify(currentTodo))
    }

    // 削除
    deleteTodo(id: number): void {
        const currentTodo = this.getAll()
        const newTodo = currentTodo.filter(t => t.id !== id)
        if (currentTodo.length - 1 !== newTodo.length) {
            throw new Error("削除に失敗しました。")
        }
        localStorage.setItem(KEY_TOOD_INFO, JSON.stringify(newTodo))
    }

    // TODO登録時のバリデーション
    private validate(todoRegisterInfo: TodoRegisterInfo): string {

        // タスクの必須チェック
        let errorMessage = ""
        if (!todoRegisterInfo.task) {
            errorMessage += "タスクを入力してください。\n"
        }
        // 期限の日付形式チェック（date-fnsのparseメソッドを使用し、parseに失敗したらエラー。エラー時は文字列で'Invalid Date'が返却される）
        if (todoRegisterInfo.expirationDate && parse(todoRegisterInfo.expirationDate, "yyyyMMdd", new Date()) == 'Invalid Date') {
            errorMessage += "期限はyyyyMMdd形式で入力してください。\n"
        }
        // 進捗の必須チェック
        if (!todoRegisterInfo.progress) {
            errorMessage += "進捗を入力してください。"
        }

        return errorMessage
    }

    // ID払い出し
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


