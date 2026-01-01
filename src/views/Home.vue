<template>
  <div class="home">
    <h1>All Images</h1>
    <div v-if="loading" class="loading">
      <el-loading :loading="loading" />
    </div>
    <div v-else class="image-grid">
      <div v-for="image in images" :key="image.id" class="image-card">
        <div class="image-wrapper">
          <img :src="getImageUrl(image.id)" :alt="image.name" @error="handleImageError" />
        </div>
        <div class="image-info">
          <p class="image-name">{{ image.name }}</p>
          <p class="image-author">Uploaded by: {{ image.authorName }}</p>
          <p class="image-date">{{ formatDate(image.uploadDate) }}</p>
        </div>
        <div class="image-actions">
          <el-button type="primary" size="small" @click="downloadImage(image.id, image.name)">
            Download
          </el-button>
        </div>
      </div>
    </div>
    <div v-if="images.length === 0 && !loading" class="empty">
      <el-empty description="No images available" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { ElMessage } from 'element-plus'

const images = ref([])
const loading = ref(false)

const fetchImages = async () => {
  loading.value = true
  try {
    const response = await api.get('/images')
    images.value = response.data
  } catch (error) {
    ElMessage.error('Failed to load images')
  } finally {
    loading.value = false
  }
}

const getImageUrl = (imageId) => {
  return `/api/images/${imageId}/download`
}

const downloadImage = async (imageId, imageName) => {
  try {
    const response = await api.get(`/images/${imageId}/download`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', imageName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    ElMessage.success('Download successful')
  } catch (error) {
    ElMessage.error('Download failed')
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US')
}

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage load failed%3C/text%3E%3C/svg%3E'
}

onMounted(() => {
  fetchImages()
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.loading {
  min-height: 400px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.image-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-info {
  padding: 15px;
}

.image-name {
  font-weight: bold;
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #333;
}

.image-author,
.image-date {
  font-size: 12px;
  color: #999;
  margin: 4px 0;
}

.image-actions {
  padding: 0 15px 15px 15px;
}

.empty {
  margin-top: 50px;
}
</style>



