import Vue from 'vue'
import App from './App.vue'

import myPlugins from './lib/index'
Vue.use(myPlugins)
new Vue({
  el: '#app',
  render: h => h(App)
})
