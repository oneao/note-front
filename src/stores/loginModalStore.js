import {defineStore} from 'pinia'
import {ref} from 'vue'
export const handOffModalStore = defineStore("login-modal", () => {
        const showModal = ref(false);
        /**
         * 根据传入的值进行切换模态框的显示状态
         * @param status
         */
        const changeModalStatus = (status) => {
            showModal.value = status;
        }

        return {showModal,changeModalStatus}
    }
)