export default {

  /**
   * 输入框过滤
   */
  emoji: {
    bind: function (el, binding, vnode) {
      let findEle = (parent, type) => {
        return parent.tagName.toLowerCase() === type ? parent : parent.querySelector(type)
      }
      const trigger = (el, type) => {
        const e = document.createEvent('HTMLEvents')
        e.initEvent(type, true, true)
        el.dispatchEvent(e)
      }
      var bindVal = binding.value
      let inputTag = 'input'
      let $inp = findEle(el, inputTag)
      el.$inp = $inp
      $inp.handle = function () {
        let val = $inp.value
         // 小数位数限制
        const reg = new RegExp("^\\d*(\.?\\d{0,"+bindVal.decimalNum+"})","g")
        let formateValue = ("" + val)
          .replace(/[^\d^\.]+/g, "") 
          .replace(/^0+(\d)/, "$1") 
          .replace(/^\./, "0.")
          .replace(/^\.+(\d)/, "0.")
          .match(reg)[0] || "";
          if(formateValue-0>=bindVal.maxNum){
            formateValue = bindVal.maxNum
          }
        $inp.value = formateValue
        trigger($inp, 'input')
      }
      $inp.addEventListener('keyup', $inp.handle)
    },
    unbind: function (el) {
      el.$inp.removeEventListener('keyup', el.$inp.handle)
    },
  },


  // 自定义点击事件，防止重复点击
  debounce: {
    inserted: function (el, binding) {
      let timer
      el.addEventListener('click', () => {
        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          binding.value()
        }, 1000)
      })
    },
  },

  // 添加水印
  waterMarker: {
    bind: function (el, binding) {
      addWaterMarker(binding.value.text, el, binding.value.font, binding.value.textColor)
    },
  },

  /**
      需求：实现长按，用户需要按下并按住按钮几秒钟，触发相应的事件
      思路：
      创建一个计时器， 2 秒后执行函数
      当用户按下按钮时触发 mousedown 事件，启动计时器；用户松开按钮时调用 mouseout 事件。
      如果 mouseup 事件 2 秒内被触发，就清除计时器，当作一个普通的点击事件
      如果计时器没有在 2 秒内清除，则判定为一次长按，可以执行关联的函数。
      在移动端要考虑 touchstart，touchend 事件
   */
  longpress: {
    bind: function (el, binding, vNode) {
      if (typeof binding.value !== 'function') {
        throw 'callback must be a function'
      }
      // 定义变量
      let pressTimer = null
      // 创建计时器（ 2秒后执行函数 ）
      let start = (e) => {
        if (e.type === 'click' && e.button !== 0) {
          return
        }
        if (pressTimer === null) {
          pressTimer = setTimeout(() => {
            handler()
          }, 2000)
        }
      }
      // 取消计时器
      let cancel = (e) => {
        if (pressTimer !== null) {
          clearTimeout(pressTimer)
          pressTimer = null
        }
      }
      // 运行函数
      const handler = (e) => {
        binding.value(e)
      }
      // 添加事件监听器
      el.addEventListener('mousedown', start)
      el.addEventListener('touchstart', start)
      // 取消计时器
      el.addEventListener('click', cancel)
      el.addEventListener('mouseout', cancel)
      el.addEventListener('touchend', cancel)
      el.addEventListener('touchcancel', cancel) 
    },
    // 当传进来的值更新的时候触发
    componentUpdated(el, {
      value
    }) {
      el.$value = value
    },
    // 指令与元素解绑的时候，移除事件绑定
    unbind(el) {
      el.removeEventListener('click', el.handler)
    },
  },






  /**
  背景：在一些后台管理系统，我们可能需要根据用户角色进行一些操作权限的判断，很多时候我们都是粗暴地给一个元素添加 v-if / v-show 来进行显示隐藏，但如果判断条件繁琐且多个地方需要判断，这种方式的代码不仅不优雅而且冗余。针对这种情况，我们可以通过全局自定义指令来处理。
  需求：自定义一个权限指令，对需要权限判断的 Dom 进行显示隐藏。
  思路：
  自定义一个权限数组
  判断用户的权限是否在这个数组内，如果是则显示，否则则移除 Dom
   */

  permission: {
    inserted: function (el, binding) {
      let permission = binding.value // 获取到 v-permission的值
      if (permission) {
        let hasPermission = checkArray(permission)
        if (!hasPermission) {
          // 没有权限 移除Dom元素
          el.parentNode && el.parentNode.removeChild(el)
        }
      }
    },
  },



  // 拖拽
  draggable: {
    inserted: function (el) {
      el.style.cursor = 'move'
      el.onmousedown = function (e) {
        let disx = e.pageX - el.offsetLeft
        let disy = e.pageY - el.offsetTop
        document.onmousemove = function (e) {
          let x = e.pageX - disx
          let y = e.pageY - disy
          let maxX = document.body.clientWidth - parseInt(window.getComputedStyle(el).width)
          let maxY = document.body.clientHeight - parseInt(window.getComputedStyle(el).height)
          if (x < 0) {
            x = 0
          } else if (x > maxX) {
            x = maxX
          }

          if (y < 0) {
            y = 0
          } else if (y > maxY) {
            y = maxY
          }

          el.style.left = x + 'px'
          el.style.top = y + 'px'
        }
        document.onmouseup = function () {
          document.onmousemove = document.onmouseup = null
        }
      }
    },
  },
}

function checkArray(key) {
  let arr = ['1', '2', '3', '4']
  let index = arr.indexOf(key)
  if (index > -1) {
    return true // 有权限
  } else {
    return false // 无权限
  }
}


function addWaterMarker(str, parentNode, font, textColor) {
  // 水印文字，父元素，字体，文字颜色
  var can = document.createElement('canvas')
  parentNode.appendChild(can)
  can.width = 200
  can.height = 150
  can.style.display = 'none'
  var cans = can.getContext('2d')
  cans.rotate((-20 * Math.PI) / 180)
  cans.font = font || '16px Microsoft JhengHei'
  cans.fillStyle = textColor || 'rgba(180, 180, 180, 0.3)'
  cans.textAlign = 'left'
  cans.textBaseline = 'Middle'
  cans.fillText(str, can.width / 10, can.height / 2)
  parentNode.style.backgroundImage = 'url(' + can.toDataURL('image/png') + ')'

}
