<template>
    <div>
        <Header :showLogoutButton="true"/>
        <TodoList/>
    </div>
</template>

<script lang="ts">
import {Vue} from 'vue-property-decorator'
import TodoList from '@/components/TodoList.vue'
import Header from '@/components/Header.vue'

export default Vue.extend({
    name: "top",

    components: {
        Header,
        TodoList
    },

    created(): void {
        if (!localStorage.getItem("accessToken")) {
            console.log("accessToken取得失敗")
            this.$router.push("/")
        }
    }
})
</script>