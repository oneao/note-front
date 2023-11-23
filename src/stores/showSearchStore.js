import {defineStore} from 'pinia'
import {ref, computed} from 'vue'

export const isShowSearchStore = defineStore("isShowSearch", () => {
        const isShow = ref(false)
        return {isShow}
    }, {
        persist: {
            storage: localStorage,//开启本地存储
        }
    }
)
