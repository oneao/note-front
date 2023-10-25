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
    }
]
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
