<template>
  <div id="app">
    <Header/>
    <div id="nav">
      <router-link to="/"></router-link>
    </div>
    <router-view/>
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator';
import Header from '@/components/Header.vue'

export default Vue.extend({
  name: 'app',

  components: {
    Header
  }
})
</script>

<style>

</style>
