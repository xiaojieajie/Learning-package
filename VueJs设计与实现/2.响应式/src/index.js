const data = { text: 'text', ooo: 'ooo' }

let activeEffect = null

function textEffect() {
  window.text.innerTExt = data.text
}
function oooEffect() {
  window.ooo.innerTExt = data.ooo
}

const proxyData = new Proxy(data, {
  get(target, key, receiver) {
    console.log(args)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    Reflect.set(target, key, value, receiver)

    activeEffect = effect
    activeEffect()
  }
})

window.pd = proxyData
