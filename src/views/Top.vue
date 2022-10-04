<template>
    <div>
        <TodoList/>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Emit, Vue} from 'vue-property-decorator'
import TodoList from '@/components/TodoList.vue'

export default Vue.extend({
    name: "top",

    components: {
        TodoList
    }
})
</script>