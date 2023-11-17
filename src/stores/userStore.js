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
        const updateNicknameAndHeadPic = (u_nickname,u_headPic) => {
            nickname.value = u_nickname
            headPic.value = u_headPic
        }
        const setUserInfo = (u_token,u_id,u_email,u_nickname,u_headPic,u_level,u_time) =>{
            token.value = u_token
            id.value = u_id
            email.value = u_email;
            nickname.value = u_nickname;
            headPic.value = u_headPic;
            level.value = u_level;
            time.value = u_time;
        }
        //重置用户等级
        const resetLevel = (u_level) => {
            level.value = u_level
        }
        const levelInfo = computed(()=>{
            switch (level.value) {
                case 1:
                    return {level:'等级1',
                            levelInfo:'出生在新手村哦！'};
                case 2:
                    return {level:'等级2',
                        levelInfo:'已经摆脱新手村了！'};
                case 3:
                    return {level:'等级3',
                        levelInfo:'开始大展身手了！'};
                case 4:
                    return {level:'等级4',
                        levelInfo:'占有一席之地了！'};
                case 5:
                    return {level:'等级5',
                        levelInfo:'距离顶端就差一步了！'};
                case 6:
                    return {level:'等级6',
                        levelInfo:'已经云上之巅了！'};
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
        return {token,id,email,nickname,headPic,level,time,setUserInfo,levelInfo,resetUserInfo,updateNicknameAndHeadPic,resetLevel}
    },{
        persist : {
            storage : localStorage,
            paths:['token','id','email','nickname','headPic','level','time']
        }
    }
)