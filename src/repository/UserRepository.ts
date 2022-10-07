import axios, {AxiosResponse, AxiosError} from 'axios'

const BASE_URL = process.env.VUE_APP_API_BASE_URL

export class UserRepository {

    signup(userName: string, password: string, callbackValidationError: Function, callbackSuccess: Function, callbackFail: Function): void {
        
        const errorMessage = this.validate(userName, password)
        if (errorMessage) {
            callbackValidationError(errorMessage)
            return
        }

        axios.post(BASE_URL + '/signup', {'userName': userName, 'password': password}, {withCredentials: true})
            .then((res: AxiosResponse<string>) => callbackSuccess(res.data))
            .catch((error: AxiosError<{message: string}>) => callbackFail(error))
    }

    login(userName: string, password: string, callbackValidationError: Function, callbackSuccess: Function, callbackFail: Function): void {

        const errorMessage = this.validate(userName, password)
        if (errorMessage) {
            callbackValidationError(errorMessage)
            return
        }

        axios.post(BASE_URL + "/login", {'userName': userName, 'password': password}, {withCredentials: true})
            .then((res: AxiosResponse<string>) => callbackSuccess(res.data))
            .catch((error: AxiosError<{message: string}>) => callbackFail(error))
    }

    logout(callbackSuccess: Function, callbackFail: Function): void {
        axios.post(BASE_URL + "/logout", {}, {withCredentials: true})
            .then((res: AxiosResponse<string>) => callbackSuccess(res.data))
            .catch((error: AxiosError<{message: string}>) => callbackFail(error))
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