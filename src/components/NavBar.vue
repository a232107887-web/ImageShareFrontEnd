<template>
  <div class="navbar">
    <div class="navbar-left">
      <h2>Image Share Platform</h2>
    </div>
    <div class="navbar-right">
      <el-menu
        mode="horizontal"
        :default-active="activeIndex"
        background-color="#409eff"
        text-color="#fff"
        active-text-color="#ffd04b"
        @select="handleSelect"
      >
        <el-menu-item v-if="authStore.isAuthenticated" index="home">
          <router-link to="/">Home</router-link>
        </el-menu-item>
        <el-menu-item v-if="authStore.isAuthenticated" index="profile">
          <router-link to="/profile">Profile</router-link>
        </el-menu-item>
        <el-menu-item v-if="!authStore.isAuthenticated" index="login">
          <router-link to="/login">Login</router-link>
        </el-menu-item>
        <el-menu-item v-if="!authStore.isAuthenticated" index="register">
          <router-link to="/register">Register</router-link>
        </el-menu-item>
        <el-menu-item v-if="authStore.isAuthenticated" index="logout" @click="handleLogout">
          Logout
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeIndex = computed(() => {
  if (route.path === '/') return 'home'
  if (route.path === '/profile') return 'profile'
  if (route.path === '/login') return 'login'
  if (route.path === '/register') return 'register'
  return 'home'
})

const handleSelect = (key) => {
  if (key === 'home') router.push('/')
  else if (key === 'profile') router.push('/profile')
  else if (key === 'login') router.push('/login')
  else if (key === 'register') router.push('/register')
}

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('Logged out successfully')
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.navbar-left h2 {
  margin: 0;
  color: white;
}

.navbar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.navbar-right a {
  color: inherit;
  text-decoration: none;
}

.el-menu--horizontal {
  border-bottom: none;
}
</style>

