import directives from '../until/directives'

const myPlugins = {
  install(Vue, options) {
    Object.keys(directives).forEach(v=>{
        Vue.directive(v, directives[v])
    })
    Vue.mixin({
      data() {
        return {
        }
      },
      created: function () {
        // 逻辑...
      },
    })
    Vue.prototype.$myMethod = function (methodOptions) {
      // 逻辑...
    }
    // Vue.component(vuePayKeyboard.name, vuePayKeyboard)
  }
}



export default myPlugins
