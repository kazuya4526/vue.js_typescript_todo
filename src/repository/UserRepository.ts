import axios, {AxiosResponse, AxiosError} from 'axios'

const BASE_URL = process.env.VUE_APP_API_BASE_URL + "/auth"

export type Token = {
    access_token: string,
    token_type: string
}

export class UserRepository {

    signup(userName: string, password: string, callbackValidationError: Function, callbackSuccess: Function, callbackFail: Function): void {
        
        const errorMessage = this.validate(userName, password)
        if (errorMessage) {
            callbackValidationError(errorMessage)
            return
        }

        const params = new URLSearchParams()
        params.append('username', userName)
        params.append('password', password)        

        axios.post(BASE_URL + '/signup', params, {withCredentials: true})
            .then((res: AxiosResponse<string>) => callbackSuccess(res.data))
            .catch((error: AxiosError<{detail: string}>) => callbackFail(error))
    }

    login(userName: string, password: string, callbackValidationError: Function, callbackSuccess: Function, callbackFail: Function): void {

        const errorMessage = this.validate(userName, password)
        if (errorMessage) {
            callbackValidationError(errorMessage)
            return
        }

        const params = new URLSearchParams()
        params.append('username', userName)
        params.append('password', password)      

        axios.post(BASE_URL + "/token", params, {withCredentials: true})
            .then((res: AxiosResponse<string>) => callbackSuccess(res.data))
            .catch((error: AxiosError<{detail: string}>) => callbackFail(error))
    }

    private validate(userName: string, password: string): string {
        let errorMessage = ""
        if (!userName) {
            errorMessage = "ユーザ名を入力してください。\n"
        }
        if (!password) {
            errorMessage += "パスワードを入力してください。"
        }
        return errorMessage
    }
}