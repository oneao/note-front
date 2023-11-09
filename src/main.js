
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import eventBus from 'vue3-eventbus'

import App from './App.vue'
import router from './router'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
// 通用字体
import 'vfonts/Lato.css'
// 等宽字体
import 'vfonts/FiraCode.css'

import UndrawUi from 'undraw-ui'
import 'undraw-ui/dist/style.css'

const app = createApp(App)
app.use(eventBus)
app.use(pinia)
app.use(router)
app.use(UndrawUi)
app.mount('#app')
 