import {parse} from 'date-fns'
import axios, {AxiosResponse, AxiosError} from 'axios'

const BASE_URL = process.env.VUE_APP_API_BASE_URL + "/todo"

// TODOのEntity情報
export type TodoInfo = {
    todo_id: number
    task: string
    expiration_date: string
    progress: number
    register_date: string
    version: number
}

// TODO登録に必要な情報
export type TodoRegisterInfo = {
    task: string
    expirationDate: string
    progress: string
}

// 進捗リスト（プルダウン項目）
export const progressList: {[key: number]: string} = {1: "未着手", 2:"進行中", 3:"完了"}

export class TodoRepository {

    // TODO全件取得
    getAll(callbackSuccess: Function, callbackFail: Function): void {

        axios.get(BASE_URL, {withCredentials: true})
            .then((res: AxiosResponse<Array<TodoInfo>>) => callbackSuccess(res.data))
            .catch((error: AxiosError<{message: string}>) => callbackFail(error))

    }

    // TODO登録
    register(todoRegisterInfo: TodoRegisterInfo, callbackValidationError: Function,callbackSuccess: Function, callbackFail: Function): void {

        // バリデーション
        const errorMessage = this.validate(todoRegisterInfo)
        if (errorMessage) {
            callbackValidationError(errorMessage)
            return
        }

        // 登録
        axios.post(BASE_URL, {
                'task': todoRegisterInfo.task, 
                'expirationDate': todoRegisterInfo.expirationDate,
                'progress': parseInt(String(todoRegisterInfo.progress))
            }, {withCredentials: true})
            .then((res: AxiosResponse<string>) => callbackSuccess(res.data))
            .catch((error: AxiosError<{message: string}>) => callbackFail(error))
    }

    // 更新
    update(id: number, progress: number, callbackValidationError: Function, callbackSuccess: Function, callbackFail: Function): void {

        if (!progress) {
            callbackValidationError("進捗を入力してください。")
            return
        }
        
        axios.put(BASE_URL, {'todoId': id, 'progress': progress}, {withCredentials: true})
            .then((res: AxiosResponse<string>) => callbackSuccess(res.data))
            .catch((error: AxiosError<{message: string}>) => callbackFail(error))

    }

    // 削除
    deleteTodo(id: number, callbackSuccess: Function, callbackFail: Function): void {

        console.log(id)
        
        axios.delete(BASE_URL + '/' + id, {withCredentials: true})
            .then((res: AxiosResponse<string>) => callbackSuccess(res.data))
            .catch((error: AxiosError<{message: string}>) => callbackFail(error))

    }

    // TODO登録時のバリデーション
    private validate(todoRegisterInfo: TodoRegisterInfo): string {

        // タスクの必須チェック
        let errorMessage = ""
        if (!todoRegisterInfo.task) {
            errorMessage += "タスクを入力してください。\n"
        }
        // 期限の日付形式チェック（date-fnsのparseメソッドを使用し、parseに失敗したらエラー。エラー時は文字列で'Invalid Date'が返却される）
        if (todoRegisterInfo.expirationDate) {
            const parsed: any = parse(todoRegisterInfo.expirationDate, "yyyyMMdd", new Date())
            if (parsed instanceof String && parsed === 'Invalid Date') {
                errorMessage += "期限はyyyyMMdd形式で入力してください。\n"
            }
        }
        // 進捗の必須チェック
        if (!todoRegisterInfo.progress) {
            errorMessage += "進捗を入力してください。"
        }

        return errorMessage
    }
}


