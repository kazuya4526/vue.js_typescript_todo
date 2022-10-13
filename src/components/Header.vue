<template>
    <div class="container">
        <h3 class="text-center">Vue.js+TypeScriptでTodo管理</h3>
        <div class="text-end" v-show="showLogoutButton">
            <button class="btn btn-primary" @click="logout">ログアウト</button>
        </div>
    </div>
</template>

<script lang="ts">
import {Vue} from 'vue-property-decorator'

type DataType = {
    showLogoutButton: boolean
}

type PropType = {
    showLogoutButton: boolean
}

export default Vue.extend({

    props: {
        showLogoutButton: {
            type: Boolean
        }
    },

    methods: {

        logout(): void {
            localStorage.setItem("accessToken", "")
            this.$router.push('/')
        }
    }
})
</script>