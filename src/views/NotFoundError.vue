<template>
    <div>
        <Header :showLogoutbutton="false"/>
        <h1 class="text-center">404 Page Not Found</h1>
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