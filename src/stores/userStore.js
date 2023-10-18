import {ref,computed,watch} from 'vue'
import {defineStore} from "pinia";
export const useUserStore = defineStore(
    "user",
    () => {
        const token = ref(null)
        const id = ref(null)
        const email = ref('')
        const nickname = ref('')
        const headPic = ref('')
        const level = ref(0)
        const time = ref('')
        const setUserInfo = (u_token,u_id,u_email,u_nickname,u_headPic,u_level,u_time) =>{
            token.value = u_token
            id.value = u_id
            email.value = u_email;
            nickname.value = u_nickname;
            headPic.value = u_headPic;
            level.value = u_level;
            time.value = u_time;
        }
        const levelInfo = computed(()=>{
            if(level.value === 1){
                return 'vip会员';
            }else{
                return '普通会员';
            }
        })
        const resetUserInfo = () => {
            token.value = null
        }
        watch(() => token.value,newData => {
            if(newData === null){
                id.value = null;
                email.value = null;
                nickname.value = null;
                headPic.value = null;
                level.value = null;
                time.value = null;
            }
        })

        return {token,id,email,nickname,headPic,level,time,setUserInfo,levelInfo,resetUserInfo}
    },{
        persist : {
            storage : localStorage,
            paths:['token','id','email','nickname','headPic','level','time']
        }
    }
)