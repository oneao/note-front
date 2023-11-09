import {defineStore} from "pinia";
import {ref} from 'vue'

export const useCommentUserStore = defineStore(
    "commentUser",
    () => {
        const commentUserId = ref('')
        const commentUserEmail = ref('')
        const commentUserName = ref('')
        const commentUserAvatar = ref('')
        //设置
        const setCommentUserInfo = (id, email, name, avatar) => {
            commentUserId.value = id
            commentUserEmail.value = email
            commentUserName.value = name
            commentUserAvatar.value = avatar
        }
        return {commentUserId,commentUserEmail,commentUserName,commentUserAvatar,setCommentUserInfo}
    },{
        persist : {
            storage : localStorage,
            paths:['commentUserId','commentUserEmail','commentUserName','commentUserAvatar']
        }
    }
)
