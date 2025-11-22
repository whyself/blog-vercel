import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../components/MainView.vue'
import ArticlesView from '../components/ArticlesView.vue'
import ArticleList from '../components/articles/ArticleList.vue'
import ArticleDetail from '../components/articles/ArticleDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: MainView
  },
  {
    path: '/articles',
    component: ArticlesView,
    children: [
      {
        path: '',
        name: 'Articles',
        component: ArticleList
      },
      {
        path: ':slug',
        name: 'ArticleDetail',
        component: ArticleDetail
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/'), // 匹配vite.config.js的base
  routes
})

export default router