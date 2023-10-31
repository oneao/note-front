import {createRouter, createWebHistory} from 'vue-router'

const routes = [
    {
        path: '/smallNote',//小记
        component: () => import('@/views/small-note/IndexView.vue')
    },
    {
        path: '/note',//笔记
        component: () => import("@/views/note/IndexView.vue"),
        children: [
            {
                path: 'edit/:noteId',//路由属性传值
                props: true,//路由属性传值
                component: () => import("@/views/note/EditNote.vue")
            }
        ]
    },
    {
        path: '/noteShare',
        component:() => import('@/views/note/ShareNoteLayout.vue')
    },
    {
        path: '/userCenter',
        component:() => import('@/views/user/UserCenter.vue')
    },
    {
        path: '/userAccountSetting',
        component:() => import('@/views/user/UserAccountSetting.vue')
    },
    {
        path: '/calendar',
        component:() => import('@/views/calendar/Calendar.vue')
    },
    {
        path: '/recycle',
        component:() => import('@/views/recycle/RecycleBin.vue')
    },
    {
        path: '/shareCenter',
        component:() => import('@/views/share/ShareCenter.vue')
    }
]
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
