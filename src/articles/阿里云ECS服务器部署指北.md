# 部署前准备
1. **ECS 基础信息**：确认公网 IP、开放端口（至少 80/443/8000），以及可通过 SSH 登录（`ssh root@<ECS_IP>`）。
2. **域名与 DNS**（可选）：如需通过域名访问，提前在 DNS 指向 ECS 公网 IP。
3. **环境变量**：整理 `.env`，确认向量模型路径、LLM 配置、数据库目录等参数，并准备一份用于服务器的副本。

# 前端
## 1. 前端项目构建
### 构建命令
```bash
# 在本地项目目录执行
npm run build
```

**作用**：将源代码编译打包成生产环境可用的静态文件，生成 `dist` 文件夹。

对于 Vue3 而言，vite.config.js 的 base 需要谨慎配置

```plain
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/Blog/', // 决定了最后前端文件部署的目录在哪
  plugins: [
     vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
```

## 2. 服务器连接
### 测试服务器连接
```bash
# 测试网络连通性
ping 服务器IP

# 测试SSH端口（Windows PowerShell）
Test-NetConnection 服务器IP -Port 22
```

**常见问题**：

+ **连接超时**：检查安全组设置，确保22端口开放，目前并不清楚校园网固定的公网 ip 是多少建议直接设置 0.0.0.0/0 允许所有 ip 的 SSH 访问(当然仅限测试

### SSH连接
```bash
ssh username@服务器IP
# 如果使用非标准端口
ssh -p 端口号 username@服务器IP
```

## 3. 文件上传
### 方法一：SCP命令（推荐）
```bash
# 上传dist文件夹内的所有文件
scp -r ./dist/* username@服务器IP:/目标路径/

# 示例：上传到Nginx默认目录
scp -r ./dist/* root@120.26.86.222:/usr/share/nginx/html/Blog
```

**关键点**：

+ 使用 `./dist/*` 而不是 `./dist`，只上传内容而非文件夹本身
+ 确保目标目录存在且有写权限
+ `/usr/share/nginx/html/Blog` 这里的路径要与之前 base 配置一致

### 方法二：RSYNC（增量同步）
```bash
rsync -avz ./dist/ username@服务器IP:/目标路径/
```

**优势**：只传输变化的文件，节省时间和带宽

## 4. 服务器环境配置
### 安装Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 检查Nginx状态
```bash
sudo systemctl status nginx
sudo systemctl start nginx    # 启动
sudo systemctl enable nginx   # 设置开机自启
```

## 5. Nginx配置
### 编辑配置文件
```bash
sudo vim /etc/nginx/sites-available/default
```

### 基础配置模板
```nginx
server {
    listen 80;
    server_name _;  # 可以是域名、IP或_（匹配所有）
    
    # 重要：指定网站根目录
    root /usr/share/nginx/html;
    index index.html;
    
    # 前端路由支持（Vue Router、React Router等）
    location /Blog/ {
        try_files $uri $uri/ /Blog/index.html;
    }
    
    # 静态资源缓存优化
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头设置
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Vim 编辑操作指南
```bash
sudo vim /etc/nginx/nginx.conf

# Vim基本操作：
# i → 进入插入模式（开始编辑）
# Esc → 退出插入模式
# :wq → 保存并退出
# :q! → 不保存强制退出
# :%d → % 全选,d 删除
```

## 6. 文件权限管理
大部分网页空白都是权限问题

### 检查当前权限
```bash
cd /usr/share/nginx/html
ls -la
```

### 修复权限问题
```bash
# 确定Nginx运行用户（通常是www-data或nginx）
ps aux | grep nginx

# 修复所有者和权限(递归修改所有子文件夹权限和所有者)
sudo chmod -R 755 /usr/share/nginx/html
sudo chown -R www-data:www-data /usr/share/nginx/html
```

**权限说明**：

+ 目录：755 (rwxr-xr-x) - 可读可执行
+ 文件：644 (rw-r--r--) - 可读不可执行

## 7. 测试和重启服务
### 配置语法测试
```bash
sudo nginx -t
```

**预期输出**：

`nginx: the configuration file /etc/nginx/nginx.conf syntax is ok`

`nginx: configuration file /etc/nginx/nginx.conf test is successful`

### 重启Nginx服务
```bash
# 重新加载（不中断服务）
sudo systemctl reload nginx

# 完全重启
sudo systemctl restart nginx
```

### 验证服务状态
```bash
sudo systemctl status nginx
```

## 8. 常见问题排查
### 问题1：403 页面空白但文件存在
**检查步骤**：

```bash
# 1. 检查文件权限
ls -la /usr/share/nginx/html/Blog

# 2. 检查Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 3. 本地测试
curl http://localhost
curl http://localhost/Blog

# 4. 检查Nginx配置
sudo nginx -t
```

### 问题2：404
**可能原因**：

+ 前端构建路径配置错误
+ Nginx配置缺失路由规则

**解决方案**：

```nginx
# 在Nginx配置中添加
location /Blog {
    try_files $uri $uri/ /Blog/index.html;
}
```

### 问题3：权限不足
**症状**：`403 Forbidden`  
**解决**：

```bash
sudo chown -R www-data:www-data /usr/share/nginx/html/
sudo chmod -R 755 /usr/share/nginx/html/
```

### 问题4：误删文件
**症状**：`403 Forbidden`  
**解决**：

```bash
echo "<h1>Welcome to Nginx</h1>" > /usr/share/nginx/html/index.html
```

一定要确保根目录下也有 index.html (哭

# 后端
## 1. 本地构建与打包
```powershell
Compress-Archive -Path NRS_backend -DestinationPath backend_src.zip -Force
```

> 若已在仓库中缓存本地模型，可将 `/models` 一并打包，或单独压缩后上传。
>

### 3. 将构建产物上传到 ECS
在本地终端执行（替换 `<ECS_IP>` 为服务器地址）：

```powershell
scp frontend_dist.zip root@<ECS_IP>:/opt/nrs
scp backend_src.zip root@<ECS_IP>:/opt/nrs
# 如有离线模型：
scp bge-small-zh-v1.5.zip root@<ECS_IP>:/opt/nrs
```

### 4. 初始化 ECS 环境
SSH 登录 ECS，执行以下命令安装必要组件：

```bash
ssh root@<ECS_IP>

# 1) 更新系统并安装依赖
apt update && apt upgrade -y
apt install -y python3.11 python3.11-venv python3-pip nginx unzip git

# 2) 创建部署目录
mkdir -p /opt/nrs/{backend,models}
cd /opt/nrs

# 3) 解压后端资源
unzip -o backend_src.zip -d backend

# 4) 若有模型包，解压到后端 models 目录
unzip -o bge-small-zh-v1.5.zip -d backend/NRS_backend/models
```

> 如系统缺失 Python 3.11，可使用 `apt install software-properties-common` 后再添加 `ppa:deadsnakes/ppa` 获取更高版本。
>

### 5. 后端部署（FastAPI + Uvicorn + Systemd）
```bash
cd /opt/nrs/backend/NRS_backend

# 1) 创建专用用户（可选，增强安全性）
useradd -r -d /opt/nrs -s /usr/sbin/nologin nrs
chown -R nrs:nrs /opt/nrs

# 2) 创建虚拟环境并安装依赖
sudo -u nrs python3.11 -m venv .venv
sudo -u nrs /opt/nrs/backend/NRS_backend/.venv/bin/pip install -r requirements.txt

# 3) 配置环境变量
cp /path/to/local/.env /opt/nrs/backend/.env
chown nrs:nrs /opt/nrs/backend/.env
```

创建 systemd 服务 `/etc/systemd/system/nrs-backend.service`：

```properties
[Unit]
Description=NRS FastAPI Backend
After=network.target

[Service]
User=nrs
Group=nrs
WorkingDirectory=/opt/nrs/backend/ # 注意查看主应用位置,不要加 NRS_backend
EnvironmentFile=/opt/nrs/backend/.env
ExecStart=/opt/nrs/backend/NRS_backend/.venv/bin/uvicorn NRS_backend.main:app --host 0.0.0.0 --port 8000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

启用服务：

```bash
systemctl daemon -reload
systemctl enable --now nrs-backend.service # 开机自启
systemctl status nrs-backend.service
```

如需查看日志：`journalctl -u nrs-backend -f`。

### 6. 前端配置更改（Nginx 静态托管）
创建 `/etc/nginx/sites-available/nrs.conf`：

```nginx
server {
    listen 80;
    server_name _;  # 可以是域名、IP或_（匹配所有）
    
    # 重要：指定网站根目录
    root /usr/share/nginx/html;
    index index.html;
    
    # 前端路由支持（Vue Router、React Router等）
    location /Blog/ {
        try_files $uri $uri/ /Blog/index.html;
    }
    
    # 静态资源缓存优化
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 反向代理到 FastAPI（默认 8000）
    location /api/ {
        proxy_pass         http://127.0.0.1:8000/api/;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    location /vectors/ {
        proxy_pass http://127.0.0.1:8000/vectors/;
        proxy_set_header Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
  
    # 安全头设置
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

启用站点并重启 Nginx：

```bash
ln -s /etc/nginx/sites-available/nrs.conf /etc/nginx/sites-enabled/ 
# 创建一个符号链接至/etc/nginx/sites-enabled/ ，里面的文件在主配置文件 /etc/nginx/nginx.conf 中被启用
nginx -t  # 确认配置无误
systemctl reload nginx
```

> 如需 HTTPS，可在域名解析完成后安装 `certbot` 并运行 `certbot --nginx -d example.com`；完成后 Nginx 会生成 443 端口配置。
>

### 7. 验证部署
1. 浏览器访问 `http://<ECS_IP>`（或域名）应能打开前端页面。
2. 前端发起问题时，应命中 `http://<ECS_IP>/api/rag` 并得到响应。
3. 通过 `curl http://127.0.0.1:8000/health` 检查后端状态；`curl http://127.0.0.1:8000/docs` 可打开 Swagger 文档。
4. 若后端依赖本地模型，确认 `/opt/nrs/backend/NRS_backend/models/<model>` 下文件完整，且 `.env` 中 `VECTOR_embedding_model` 指向该路径（例如 `./NRS_backend/models/bge-small-zh-v1.5`）。

若需要拓展到多台机器，可将后端容器化为 Docker 镜像进一步简化上线流程。

