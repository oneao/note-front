import { createRouter, createWebHistory } from 'vue-router'
import SmallNoteIndexView from "@/views/small-note/IndexView.vue";
const routes = [
  {
    path : '/smallNote',
    component : SmallNoteIndexView
  }
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
