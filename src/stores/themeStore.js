import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {darkTheme} from "naive-ui";
import {DarkModeRound, WbSunnyTwotone} from "@vicons/material"

export const useThemeStore = defineStore("theme", () => {
        //定义是否是暗黑主题
        const isDarkTheme = ref(false);
        //主题
        const theme = computed(() => {
            if (isDarkTheme.value) {
                //如果是暗黑主题
                return {
                    name : darkTheme,
                    icon : DarkModeRound,
                    theDividingLineColor : "background-color: white",
                }
            } else {
                //如果不是
                return {
                    name : null,
                    icon : WbSunnyTwotone,
                    theDividingLineColor : "background-color: black",
                }
            }
        });
        //主题切换
        const changeTheme = dark => {
            isDarkTheme.value = dark;
        }
        //开关switch按钮切换颜色
        const changeRailStyle = ({focused, checked}) => {
            const style = {};
            if (checked) {
                style.background = "#696969";
                if (focused) {
                    style.boxShadow = "0 0 0 2px #d0305040";
                }
            } else {
                style.background = "#cccccc";
                if (focused) {
                    style.boxShadow = "0 0 0 2px #2080f040";
                }
            }
            return style;
        }
        return {isDarkTheme, theme, changeTheme, changeRailStyle}
    }, {
        persist: {
            storage: localStorage,//开启本地存储
            paths: ['isDarkTheme'], //只对isDarkTheme开启存储}
        }
    }
)
