import { effect } from './reactive.js'
export * from './reactive.js'

export const Vue = {
    createRenderer({ querySelector, insert }) {
        return {
            createApp(options) {
                // 返回app实例
                return {
                    mount(selector) {
                        // 挂载到dom
                        // 要把选项中数据状态转化为dom追加到宿主元素
                        // 1. 获取宿主
                        const parent = querySelector(selector)

                        // 1.5处理其他options，兼容vue2
                        if (options.setup) {
                            this.setupState = options.setup()
                        }
                        if (options.data) {
                            this.data = options.data()
                        }

                        this.proxy = new Proxy(this, {
                            get(target, key) {
                                if (key in target.setupState) {
                                    return Reflect.get(target.setupState, key)
                                } else {
                                    return Reflect.get(target.data, key)
                                }
                            }
                        })

                        // 2. 渲染
                        // 模板template => render
                        if (!options.render) {
                            options.render = this.compile(parent.innerHTML)
                        }

                        this.update = effect(() => {
                            const el = options.render.call(this.proxy)
                            // 3. 追加
                            parent.innerHTML = ''
                            insert(el, parent)
                        })

                        // 初始化时执行一次
                        // this.update()
                        
                    },
                    compile(template) {
                        // template => ast => render
                        return function render() {
                            // 描述视图
                            const h3 = document.createElement('h3')
                            h3.textContent = this.title2

                            return h3
                        }
                    }
                }
            }
        }
    },
    createApp(options) {
        const renderer = this.createRenderer({
            querySelector(selector) {
                return document.querySelector(selector)
            },
            insert(el, parent, anchor) {
                parent.insertBefore(el, anchor || null)
            }
        })
        // 返回APP实例
        return renderer.createApp(options)
    }
}