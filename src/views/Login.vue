<template>

    <div>
        <div v-if="loading" class="loading-background">
            <img src="../assets/loading-l-3.gif" alt="" class="loading">
        </div>
        <Header :showLogoutButton="false"/>
        <div class="container">
            <div class="row">
                <label class="form-label col-2" for="userName">ユーザ名</label>
                <div class="col-10">
                    <input type="text" id="userName" class="form-control" v-model="userName">
                </div>
            </div>
            <div class="row">
                <label class="form-label col-2" for="password">パスワード</label>
                <div class="col-10">
                    <input type="password" id="password" class="form-control" v-model="password">
                </div>
            </div>
            <div class="text-danger">{{message}}</div>
            <div class="row">
                <button class="btn btn-primary col-2" @click="login">ログイン</button>
                <button class="btn btn-primary col-2" @click="signup">新規登録してログイン</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {Vue} from 'vue-property-decorator'
import { AxiosError } from 'axios'
import {UserRepository, Token} from '@/repository/UserRepository'
import Header from '@/components/Header.vue'

const userRepository: UserRepository = new UserRepository()

type DataType = {
    userName: string,
    password: string,
    message: string,
    // ローディング画像表示用フラグ
    // API呼出し中に表示させる
    loading: boolean
}

export default Vue.extend({
    name: 'login',

    components: {
        Header
    },

    data(): DataType {
        return {
            userName: "",
            password: "",
            message: "",
            loading: false
        }
    },

    methods: {

        login(): void {
            this.loading = true
            userRepository.login(this.userName, this.password, this.validationErrorHandle, (data: Token) => {
                localStorage.setItem("accessToken", data.access_token)
                this.$router.push('/top')
                this.loading = false
            }, this.handleError)
        },

        signup(): void {
            this.loading = true
            userRepository.signup(this.userName, this.password, this.validationErrorHandle, () => {this.login()}, this.handleError)
        },

        afterLoginOrSignup(data: Token): void {

            localStorage.setItem("accessToken", data.access_token)

            this.$router.push('/top')

            this.loading = false
        },

        validationErrorHandle(errorMessage: string): void {
            this.message = errorMessage
            this.loading = false
        },

        // 共通エラーハンドリング
        handleError(error: AxiosError<{detail: string}>): void {
            console.log("eeeeee")
            // ネットワークエラーまたは5XXエラーの場合はシステムエラー画面に遷移
            if (!error.response || error.response.status >= 500) {
                // this.$router.replace("/error")
            } else {
                // それ以外のエラー（4XXを想定）は、メッセージを画面下部に表示
                this.message = error.response.data.detail
            }
            this.loading = false
        }
    }


})
</script>

<style lang="css">
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