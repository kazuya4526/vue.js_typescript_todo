<template>
    <div>
        <Header :showLogoutButton="false"/>
        <h1 class="text-center">500 Internal Server Error</h1>
    </div>
</template>

<script>
import {Vue} from 'vue-property-decorator'
import Header from '@/components/Header.vue'

export default Vue.extend({

    components: {
        Header
    }
})
</script>