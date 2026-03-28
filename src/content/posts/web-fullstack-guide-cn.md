---
title: "网页前后端指北"
excerpt: "以一个语雀推送小 demo 为例，系统梳理 Node.js 后端与 Vue 前端的工程结构、路由、请求封装与服务分层。"
publishDate: 2024-03-20
listDate: "Mar 20, 2024"
wordCount: "3,600 Words"
tags:
  - 中文
  - Web
  - Backend
  - Frontend
majorCategory: Articles
---
以 vibe coding 含量极高的语雀推送小 demo 为例，写一份文档指北消化一下
## 后端 Node.js + MongoDB + axios
后端：数据处理、存储以及与前端进行数据交换

---

`npm install` 进行包管理

`node xxx.js` 运行代码

```javascript
yuque-email-pusher/
├── app.js              # 主程序入口
├── config.js           # 所有配置集中在这里
├── models.js           # 所有数据模型集中在这里
├── services.js         # 所有业务逻辑集中在这里
├── routes.js           # 所有API路由集中在这里
├── package.json
└── .env
```

之前文档里提到 Node.js 作为后端的结构框架

- app.js 主程序入口，启动整个服务，启动 express，将 api 路由交给 routes.js，设置根路由，启动数据库链接，启动定时服务，启动 web
- config.js 配置一些服务链接基本信息，比如服务器端口、数据库连接、语雀 api、邮件服务、定时……
- model.js 定义数据库的一些类型
- routes.js 统一配置 api 路由
- service.js 各种函数功能实现

### 全局定义与引入其他文件或包
```javascript
const axios = require('axios'); // 用于请求语雀 API
const nodemailer = require('nodemailer'); // 用于发送邮件
const cron = require('node-cron'); // 用于定时任务
const config = require('./config'); // 加载配置
const fs = require('fs');// files 模块
const { Subscription, PushHistory ,DocTree, User } = require('./models'); // 加载数据模型
const services = require('./services');// 引入服务文件模块
const bcrypt = require('bcryptjs');// 密码 hash
const jwt = require('jsonwebtoken');// token 令牌
require('dotenv').config();// 从项目根目录下读取 .env 的文件，把文件中的键值对加载到 process.env 中，等同于在运行环境里设置了这些环境变量。

const cors = require('cors');// // 允许前端端口跨域访问
const app = express(); // 创建 express 应用实例即后端应用入口
```

### app.js 文件
- 前端跨域访问

```javascript
app.use(cors({
  origin: ['http://10.6.1.104:8080', 'http://localhost:8080','http://26.116.77.54:8088'],
  credentials: true
}));
```

- 设置中间体，即从客户端到服务器端（后端）

```javascript
app.use(express.json());
```

> `express.json()`
>
> + 监听 JSON 请求： 它会检查传入请求的 `Content-Type` 头部。
> + 解析请求体： 如果请求体是 JSON 格式，它会将原始的 JSON 数据（通常是字符串形式）解析成一个 JavaScript 对象。
> + 挂载到 **req.body**： 它会将解析后的 JavaScript 对象自动附加到请求对象（`req`）的 **body** 属性上。
>

- 设置路由

```javascript
// 加载路由（所有 API 路由都在 routes.js 里定义）
const routes = require('./routes');
app.use('/api', routes); // 所有 /api 开头的请求交给 routes.js 处理
// 批量管理 api 接口
// 根路由和健康检查接口
app.get('/', (req, res) => {
  res.send('欢迎使用语雀邮件推送系统！');
});
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: '语雀邮件推送' });
});
```

- startServer() 启动服务函数

```javascript
async function startServer() {
  try {
    // 连接 MongoDB 数据库，连接地址在 .env 文件或 config.js 里配置
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('数据库连接成功');
    ...
    console.log('初始化文档树数据');
    ...
    // 启动定时任务（定时自动推送语雀消息，逻辑在 services.js）
    // 启动后立即推送一次 await services.manualPush();
    services.startCronJob();  // 启动定时任务
    // 启动 Web 服务，默认监听0.0.0.0 端口（默认 3000，可在 .env 或 config.js 配置）
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    // 启动失败时输出错误
    console.error('启动失败:', error);
  }
}
```

### config.js 文件
集中管理配置信息，例如

```javascript
// 语雀 API 配置
  yuque: {
    token: process.env.YUQUE_TOKEN, // 语雀 API 令牌
    baseURL: 'https://nova.yuque.com/api/v2', // 语雀 API 基础地址
    baseSlug: process.env.TEAM_BASE_ID + '/' + process.env.KNOWLEDGE_BASE_ID, // 知识库 ID（如 ph25ri/ua1c3q）
    targetAuthor: process.env.TARGET_AUTHOR // 只推送特定作者的文档
  },
```

通过 module.export ={} 开放给其他文件使用

### model.js 文件
定义数据库类型

```javascript
const subscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: false },
  // docSlug: { type: String, required: false, default: process.env.KNOWLEDGE_BASE_ID },
  docUuid: { type: String, required: false, default: '' },
  title: { type: String, default: '' },
  single: { type: Boolean, default: false },
  author: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now }
});
```

required: true 即为必填项

type 数据类型

unique 是否唯一

```javascript
const Subscription = mongoose.model('Subscription', subscriptionSchema);
// 链接到对应数据库
module.exports = {
  Subscription,
}
// 开放接口
```

### routes.js 文件
routes.js 负责定义所有 HTTP API 路由，并调用 service 层实现

例如注册接口

```javascript
router.post('/user/register', async (req, res) => {
  const { username, email, password } = req.body;
  const result = await userService.registerUser({ username, email, password });
  // 调用 userService 的函数
  res.json(result);
});
```

req 为请求所携带的内容，res 则为返回信息

### service.js 文件
服务层，可以按模块进行拆分：如 userService、yuqueService、emailService

```javascript
class YuqueEmailService {
  constructor() {// 构造函数，每次调用 YuqueEmailService 自动创建
    // 创建语雀 API 客户端
    this.yuqueClient = axios.create({
      baseURL: config.yuque.baseURL,
      headers: {
        'X-Auth-Token': config.yuque.token,
        'User-Agent': 'Yuque-Email-Pusher/1.0'
      }
    });
    // 创建邮件发送器
    this.emailTransporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });
    // 生成 token 密钥
    this.jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';
  }

  // 服务层函数
  async getYuqueDocs(){// async 关键字允许函数内使用 await 将异步操作转为同步
    try {
      const tocResponse = await this.yuqueClient.get(
        `/repos/${config.yuque.baseSlug}/toc`
      );
      if(tocResponse.status !== 200) {
        throw new Error('无法获取知识库目录');
      }
      // 数据库查询、修改、更新
      if(await DocTree.countDocuments({uuid:process.env.KNOWLEDGE_BASE_ID})===0){
      const newNode = new DocTree({
        title: '社团活动',
        type: 'KNOWLEDGE_BASE',
        slug: process.env.KNOWLEDGE_BASE_ID,
        uuid: process.env.KNOWLEDGE_BASE_ID,
        update: false,
        children: []
      });
      await newNode.save();// 只有 save 过才算更新
      }

      const rootDoc = await DocTree.findOne({uuid:'Root'});
      if(!rootDoc.children.includes(process.env.KNOWLEDGE_BASE_ID)){
        await DocTree.findOneAndUpdate(// findOneAndUpdate 可以避免一些异步更新错误
      { uuid: 'Root' },
      { $push: { children: process.env.KNOWLEDGE_BASE_ID } }// 对列表进行插入
      );
      }
      ...
      return [];
    } catch (error) {
      console.error('获取语雀文档失败:', error.message);
      return [];
    }
  }
  async sendEmail(docs, subscriberEmail) {}
  buildEmailContent(docs) {}
  async runPushTask() {}
  async startCronJob() {
    cron.schedule(config.cron.schedule, () => {
      this.runPushTask();
    });
    console.log('定时任务已启动');
  }
  // 手动触发推送任务
  async manualPush() {
    return await this.runPushTask();
  }
  // 订阅邮箱
  async subscribe(email, title, docUuid, single, author) {}
  // 取消订阅
  async unsubscribe(email, title, docUuid, single, author) {}
  async unsubscribeAll(email) {}
    ...
}

// 导出业务服务实例，供 app.js 和 routes.js 调用
module.exports = new YuqueEmailService();
```

具体语法细则问 ai 就 ok 啦

userService 等文件同理

## 前端 Vue 3 + TypeScript + Ant Design Vue + axios
还是贴出 gpt4.1 给的项目框架

```plain
frontend-vue/
├── babel.config.js         # Babel 配置（转译 ES6+ 语法）
├── package.json            # 项目依赖与脚本
├── tsconfig.json           # TypeScript 配置
├── vue.config.js           # Vue CLI 配置（如 devServer、代理等）
├── public/
│   ├── favicon.ico
│   └── index.html          # HTML 模板
└── src/
    ├── App.vue             # 根组件
    ├── main.ts             # 入口文件，挂载 Vue 应用
    ├── shims-vue.d.ts      # TypeScript 对 .vue 文件的类型声明
    ├── assets/             # 静态资源（如 logo.png）
    ├── components/         # 复用组件（如 GlobalHeader、HelloWorld）
    ├── layouts/            # 页面布局组件（如 BasicLayout）
    ├── router/
    │   └── index.ts        # 路由配置
    ├── views/              # 页面视图（如 HomeView、AboutView）
    └── requests.ts         # axios 封装，统一管理 API 请求
```

- 页面入口：main.ts 挂载 App.vue，引入全局样式和 Ant Design Vue。
- 路由跳转：router/index.ts 配置页面路由，views/ 目录下为各页面组件。
- 页面布局：layouts/ 统一页面结构，components/ 复用小组件。
- 数据请求：通过 requests.ts 封装 axios，页面/组件中调用 API。
- UI 展示：用 Ant Design Vue 组件渲染数据，结合响应式样式适配不同终端。

### 前端主入口 main.ts
```typescript
import { createApp } from 'vue';
import App from './App.vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import router from './router';

createApp(App).use(router).use(Antd).mount('#app');// 把根组件 App 渲染到 public/index.html 的 <div id="app"></div>
```

index.html 即为 html 模板，整个项目的 HTML/JS/CSS 资源都会自动注入其中，`%` 中间的内容由注入的内容决定

```html
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
    <noscript>
      <strong>We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <div id="app"></div>
    <!-- built files will be auto injected -->
  </body>
</html>

```

### App.vue/BasicLayout.vue
```vue
<template>
  <div>
    <BasicLayout />
  </div>
</template>

<style></style>

<script setup lang="ts">
  import BasicLayout from '@/layouts/BasicLayout.vue';// 引入目录下的 BasicLayout.vue 文件
</script>
```

```vue
<template>
  <div id="basicLayout">
    <a-layout>
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view /> 根据 index.ts 配置，以当前路由决定 content 内容
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://nova.yuque.com/r/organizations/homepage" target="_blank">
          Yueque Message Pusher ©2025 Created by NOVA
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
  import GlobalHeader from '@/components/GlobalHeader.vue';
</script>

<style scoped>// CSS 样式，scoped 代表仅在当前组件有效
  #basicLayout .footer { // # 代表 id，. 代表 class
    background: #efefef;
    text-align: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
  }

  #basicLayout .content {
    margin-bottom: 20px;
    padding: 20px;
    background: #fff;
  }

  #basicLayout .header {
    background: white;
    padding-inline: 20px;
    color: unset;
    margin-bottom: 20px;
  }
</style>
```

```typescript
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import HomeView from '../views/HomeView.vue'
import SubscriptionManage from '@/views/SubscriptionManage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/user/login',
    name: 'userLogin',
    component: LoginView// 使用引入的文件
  },
  {
    path: '/user/register',
    name: 'userRegister',
    component: RegisterView
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/subscriptions',
    name: 'subscriptions',
    component: SubscriptionManage
  },
  {
    path: '/',
    redirect: '/home'
  }
];


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),// history 模式 url 中不含 #
  routes// 及上文定义的内容
})

// 全局登录态守卫，每次路由跳转前都会执行
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  // 允许未登录访问登录/注册页
  if (to.path === '/user/login' || to.path === '/user/register') {
    next();// 执行跳转
  } else {
    // 其他页面必须有token
    if (token) {
      next();
    } else {
      next('/user/login');
    }
  }
});

export default router // 导出 router 通过 main.ts 注册到整个 vue

```

### requests.ts
```typescript
import axios from "axios";

alert(process.env.NODE_ENV);// 引入 env 文件

const myAxios = axios.create({
  baseURL:"http://10.6.1.104:3000/api",// 后端 api 接口地址
  timeout: 10000,
  withCredentials: true,// 让 axios 在跨域请求时也带上 cookie
});

// 请求拦截器：在请求前进行操作，如添加 token
myAxios.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }

  // 请求拦截器：在响应返回后进行操作
  myAxios.interceptors.response.use(
    function (response) {
      console.log(response);

      const { data } = response;
      console.log(data);
      // 未登录
      if (data.code === 40100) {
        // 不是获取用户信息接口，或者不是登录页面，则跳转到登录页面
        // 用户访问受保护页面，未登录时被拦到登录页。
        // 登录页登录成功后，前端读取 redirect 参数，自动跳转回原页面
        if (!window.location.pathname.includes("/user/login")) {
          window.location.href = `/user/login?redirect=${window.location.href}`;
        }
      }
      return response;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

export default myAxios;
```

### GlobalHeader.vue
以 GlobalHeader.vue 为例，阐明 JS 的用法

```vue
<template>
  <div id="globalHeader">
    <a-row :wrap="false">// wrap=true 响应折叠，即换行
      <a-col flex="200px">
        <div class="title-bar">
          <img src="@/assets/logo.png" alt="logo" class="logo" />
          <div class="title">语雀消息推送</div>
        </div>
      </a-col>
      <a-col flex="auto">
        <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="doMenuClick" />
      </a-col>
      <a-col flex="160px">
        <div class="user-login-status btn-group">
          <template v-if="isLogin">
            <span class="welcome-user">欢迎 {{ username }} 用户</span>
            <a-button @click="logout">退出</a-button>
          </template>
          <template v-else>
            <a-button type="primary" @click="() => router.push('/user/login')" style="margin-top: 16px;">登录</a-button>
            <a-button @click="() => router.push('/user/register')" style="margin-top: 16px;">注册</a-button>
          </template>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
  import { h, ref, watch } from 'vue';
  import { HomeOutlined, CrownOutlined } from '@ant-design/icons-vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const doMenuClick = ({ key }: { key: string }) => {
    router.push({
      path: key,
    });
  };

  const current = ref<string[]>([router.currentRoute.value.path]);
  router.afterEach((to) => {
    current.value = [to.path];
  });

  const items = [
    {
      key: '/',
      icon: () => h(HomeOutlined),
      label: '主页',
      title: '主页',
    },
    {
      key: '/subscriptions',
      icon: () => h(CrownOutlined),
      label: '订阅管理',
      title: '订阅管理',
    },
    {
      key: 'others',
      label: h(
        'a',
        {
          href: 'https://nova.yuque.com/r/organizations/homepage',
          target: '_blank',
        },
        '关于我们',
      ),
      title: '关于我们',
    },
  ];

  const username = ref(localStorage.getItem('username') || '用户');
  const isLogin = ref(!!localStorage.getItem('token'));

  function updateLoginState() {
    isLogin.value = !!localStorage.getItem('token');
    username.value = localStorage.getItem('username') || '用户';
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    updateLoginState();
    router.push('/user/login');
  }

  // 监听路由变化，防止手动跳转后状态不同步
  router.afterEach(() => {
    updateLoginState();
  });
</script>

<style scoped>
  .title-bar {
    display: flex;
    align-items: center;
  }

  .btn-group {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    margin: 0;
  }
  .welcome-user {
    margin-right: 0;
    font-weight: 500;
    font-size: 16px;
    color: #1890ff;
    white-space: nowrap;
  }

  .logo {
    width: 55px;
    height: 55px;
  }

  .title {
    font-size: 18px;
    margin-left: 16px;
    color: black;
  }
</style>
```


