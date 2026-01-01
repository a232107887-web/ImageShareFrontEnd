<template>
  <div class="home">
    <h1>All Images</h1>
    <div v-if="loading" class="loading">
      <el-loading :loading="loading" />
    </div>
    <div v-else-if="validImages.length > 0" class="image-grid">
      <div v-for="image in validImages" :key="image.id" class="image-card">
        <div class="image-wrapper">
          <img :src="getImageUrl(image.id)" :alt="image.name || 'Image'" @error="() => handleImageError(image.id)" />
        </div>
        <div class="image-info">
          <p class="image-name">{{ image.name || 'Unnamed Image' }}</p>
          <p class="image-author">Uploaded by: {{ image.authorName || 'Unknown' }}</p>
          <p class="image-date">{{ formatDate(image.uploadDate) }}</p>
        </div>
        <div class="image-actions">
          <el-button type="primary" size="small" @click="downloadImage(image.id, image.name)">
            Download
          </el-button>
        </div>
      </div>
    </div>
    <div v-else class="empty">
      <el-empty description="No images available. Upload your first image in the Profile page!" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'
import { ElMessage } from 'element-plus'

const images = ref([])
const loading = ref(false)
const failedImages = ref(new Set()) // 记录加载失败的图片ID

// 只显示有效的图片（未加载失败的）
const validImages = computed(() => {
  return images.value.filter(image => !failedImages.value.has(image.id))
})

const fetchImages = async () => {
  loading.value = true
  try {
    const response = await api.get('/images')
    // 确保返回的是数组，并且过滤掉无效数据
    if (Array.isArray(response.data)) {
      images.value = response.data
    } else {
      images.value = []
    }
  } catch (error) {
    console.error('Failed to load images:', error)
    images.value = []
    ElMessage.error('Failed to load images')
  } finally {
    loading.value = false
  }
}

const getImageUrl = (imageId) => {
  const baseURL = import.meta.env.PROD 
    ? 'https://imagesharebackend-a9bahdacgugcg5bd.francecentral-01.azurewebsites.net/api'
    : '/api'
  return `${baseURL}/images/${imageId}/download`
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
  if (!dateString) return 'Invalid Date'
  try {
    // 处理LocalDateTime格式 (可能包含或不包含时区信息)
    let date
    if (typeof dateString === 'string') {
      // 如果字符串不包含时区信息，添加Z表示UTC
      if (!dateString.includes('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
        date = new Date(dateString + 'Z')
      } else {
        date = new Date(dateString)
      }
    } else {
      date = new Date(dateString)
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

const handleImageError = (imageId) => {
  // 标记该图片加载失败，从列表中移除
  if (imageId) {
    failedImages.value.add(imageId)
  }
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



