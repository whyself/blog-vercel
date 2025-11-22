<template>
  <div class="articles-view">
    <header class="articles-header">
      <div class="header-inner">
        <h1 class="site-title">Articles</h1>
        <nav class="header-nav" aria-label="Main navigation">
          <router-link to="/" class="nav-link">Home</router-link>
        </nav>
      </div>
    </header>

    <aside class="sidebar">
      <router-link to="/" class="logo" aria-label="Back to home">
        <img src="/avatar.jpg" alt="WhySelf logo" class="logo-image">
        <div class="logo-text">
          <span class="brand">WhySelf</span>
          <span class="brand-tagline">Restart.</span>
        </div>
      </router-link>

      <div class="sidebar-divider" role="presentation"></div>

      <div class="sidebar-block">
        <h2 class="sidebar-title">Connect</h2>
        <div class="social-links">
          <a href="https://github.com/whyself" class="social-link" target="_blank" rel="noopener" aria-label="GitHub">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0.5C5.37 0.5 0 5.87 0 12.5c0 5.29 3.44 9.78 8.21 11.38.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.07-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.35-1.75-1.35-1.75-1.1-.75.08-.73.08-.73 1.21.09 1.85 1.25 1.85 1.25 1.08 1.86 2.83 1.32 3.52 1.01.11-.79.43-1.32.78-1.62-2.66-.3-5.46-1.33-5.46-5.9 0-1.3.47-2.36 1.24-3.19-.12-.31-.54-1.58.12-3.29 0 0 1.01-.32 3.3 1.22a11.46 11.46 0 0 1 6 0c2.28-1.54 3.29-1.22 3.29-1.22.67 1.71.25 2.98.13 3.29.77.83 1.23 1.89 1.23 3.19 0 4.58-2.81 5.59-5.49 5.89.44.38.83 1.13.83 2.28 0 1.64-.01 2.97-.01 3.38 0 .32.22.7.83.58C20.56 22.28 24 17.79 24 12.5 24 5.87 18.63 0.5 12 0.5Z"/></svg>
          </a>
          <a href="mailto:1158820305@qq.com" class="social-link" aria-label="Email">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm16 2-8 5-8-5v12h16V6Zm-8 7 8-5H4l8 5Z"/></svg>
          </a>
        </div>
      </div>
    </aside>

    <div class="layout" role="main">
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <component :is="Component" :articles="renderedArticles" />
        </router-view>
      </main>
    </div>

    <footer class="footer" aria-label="Footer">
      <p>© {{ currentYear }} whyself. All rights reserved.</p>
      <a href="mailto:1158820305@qq.com" class="footer-link">Contact: 1158820305@qq.com</a>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { articlesMeta } from '../articles/metadata'

const route = useRoute()

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const renderedArticles = computed(() =>
  [...articlesMeta]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((article) => ({
      ...article,
      displayDate: dateFormatter.format(new Date(article.date))
    }))
)

const currentYear = new Date().getFullYear()

const withAnime = (callback) => {
  if (typeof window === 'undefined') {
    return
  }

  if (window.anime) {
    callback(window.anime)
  } else {
    window.setTimeout(() => withAnime(callback), 80)
  }
}

const runLayoutAnimations = () => {
  withAnime((anime) => {
    anime({
      targets: '.articles-header',
      translateY: [-40, 0],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutExpo'
    })

    anime({
      targets: '.sidebar',
      translateX: [-40, 0],
      opacity: [0, 1],
      duration: 600,
      delay: 200,
      easing: 'easeOutExpo'
    })
  })
}

const animateMainContent = () => {
  withAnime((anime) => {
    anime({
      targets: '.main-content',
      translateY: [24, 0],
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutCubic'
    })
  })
}

onMounted(() => {
  runLayoutAnimations()
  animateMainContent()
})

watch(
  () => route.fullPath,
  () => {
    animateMainContent()
  }
)
</script>

<style scoped>
.articles-view {
  position: relative;
  min-height: 100vh;
  padding: 120px 2.5rem 4rem;
  color: #f5f6f7;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.articles-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 20;
  background: rgba(12, 12, 14, 0.82);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1.2rem 2.5rem;
}

.site-title {
  font-size: 3rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
}

.header-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  position: relative;
  color: #f5f6f7;
  text-decoration: none;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  transition: color 0.3s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.3rem;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease;
}

.nav-link:hover,
.nav-link:focus {
  color: #ffffff;
}

.nav-link:hover::after,
.nav-link:focus::after {
  transform: scaleX(1);
}

.layout {
  max-width: 1400px;
  margin-left: calc(260px + 2rem);
  margin-right: auto;
  display: flex;
  gap: 2rem;
  padding: 0 1rem 0 0;
}

.sidebar {
  width: 260px;
  position: fixed;
  top: 120px;
  left: 2.5rem;
  align-self: flex-start;
  background: rgba(20, 20, 24, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 2rem 1.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  z-index: 15;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  margin-bottom: 1.8rem;
}

.logo-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  object-fit: cover;
}

.brand {
  font-size: 1.2rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand-tagline {
  display: block;
  font-size: 0.75rem;
  opacity: 0.7;
  letter-spacing: 0.06em;
}

.sidebar-divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0));
  margin: 1.5rem 0;
}

.sidebar-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-title {
  font-size: 0.9rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.8;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(40, 40, 45, 0.55);
  transition: transform 0.3s ease, border-color 0.3s ease, background 0.3s ease;
}

.social-link svg {
  width: 18px;
  height: 18px;
  fill: #f5f6f7;
}

.social-link:hover,
.social-link:focus {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.12);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.main-content > * {
  flex: 1;
}

.footer {
  margin-top: 3rem;
  align-self: center;
  width: calc(100% - (260px + 2rem));
  max-width: 960px;
  padding: 2.5rem 0 0rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  letter-spacing: 0.05em;
}

.footer-link {
  display: inline-block;
  margin-top: 0.6rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover,
.footer-link:focus {
  color: #ffffff;
}

@media (max-width: 1100px) {
  .articles-view {
    padding: 120px 1.8rem 3rem;
  }

  .sidebar {
    position: static;
    width: 100%;
    margin-bottom: 2rem;
  }

  .layout {
    max-width: 100%;
    margin: 0;
    padding: 0;
  }

  .footer {
    margin-left: 0;
    padding: 2.5rem 1.8rem 2.8rem;
  }
}

@media (max-width: 768px) {
  .articles-view {
    padding: 110px 1.5rem 2.5rem;
  }

  .header-inner {
    padding: 1rem 1.5rem;
  }

  .header-nav {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .site-title {
    font-size: 1.4rem;
  }

  .brand-tagline {
    font-size: 0.7rem;
  }
}
</style>
