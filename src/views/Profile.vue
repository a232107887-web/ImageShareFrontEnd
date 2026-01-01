<template>
  <div class="profile">
    <h1>My Images</h1>
    <div class="upload-section">
      <el-upload
        class="upload-demo"
        :action="uploadUrl"
        :headers="uploadHeaders"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        :show-file-list="false"
      >
        <el-button type="primary">Upload Image</el-button>
        <template #tip>
          <div class="el-upload__tip">Supports jpg/png/gif format, max size 10MB</div>
        </template>
      </el-upload>
    </div>
    <div v-if="loading" class="loading">
      <el-loading :loading="loading" />
    </div>
    <div v-else class="image-grid">
      <div v-for="image in images" :key="image.id" class="image-card">
        <div class="image-wrapper">
          <img :src="getImageUrl(image.id)" :alt="image.name" @error="handleImageError" />
        </div>
        <div class="image-info">
          <el-input
            v-if="editingId === image.id"
            v-model="editingName"
            @blur="saveEdit(image.id)"
            @keyup.enter="saveEdit(image.id)"
            size="small"
          />
          <p v-else class="image-name" @dblclick="startEdit(image.id, image.name)">
            {{ image.name }}
          </p>
          <p class="image-date">{{ formatDate(image.uploadDate) }}</p>
        </div>
        <div class="image-actions">
          <el-button type="primary" size="small" @click="downloadImage(image.id, image.name)">
            Download
          </el-button>
          <el-button type="danger" size="small" @click="deleteImage(image.id)">
            Delete
          </el-button>
        </div>
      </div>
    </div>
    <div v-if="images.length === 0 && !loading" class="empty">
      <el-empty description="No images uploaded yet. Upload now!" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'
import { useAuthStore } from '../stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'

const authStore = useAuthStore()
const images = ref([])
const loading = ref(false)
const editingId = ref(null)
const editingName = ref('')

const uploadUrl = computed(() => {
  return import.meta.env.PROD 
    ? 'https://imagesharebackend-a9bahdacgugcg5bd.francecentral-01.azurewebsites.net/api/images/upload'
    : '/api/images/upload'
})

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${authStore.token}`
  }
})

const fetchImages = async () => {
  loading.value = true
  try {
    const response = await api.get('/images/my')
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

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('Only image files are allowed!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('Image size cannot exceed 10MB!')
    return false
  }
  return true
}

const handleUploadSuccess = (response) => {
  ElMessage.success('Upload successful')
  fetchImages()
}

const handleUploadError = () => {
  ElMessage.error('Upload failed')
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

const startEdit = (id, name) => {
  editingId.value = id
  editingName.value = name
}

const saveEdit = async (id) => {
  if (editingName.value.trim() === '') {
    ElMessage.warning('Image name cannot be empty')
    editingId.value = null
    return
  }
  try {
    await api.put(`/images/${id}`, { name: editingName.value })
    ElMessage.success('Update successful')
    editingId.value = null
    fetchImages()
  } catch (error) {
    ElMessage.error('Update failed')
    editingId.value = null
  }
}

const deleteImage = async (id) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this image?', 'Confirm', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
    await api.delete(`/images/${id}`)
    ElMessage.success('Delete successful')
    fetchImages()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Delete failed')
    }
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

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage load failed%3C/text%3E%3C/svg%3E'
}

onMounted(() => {
  fetchImages()
})
</script>

<style scoped>
.profile {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.upload-section {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  cursor: pointer;
}

.image-name:hover {
  color: #409eff;
}

.image-date {
  font-size: 12px;
  color: #999;
  margin: 4px 0;
}

.image-actions {
  padding: 0 15px 15px 15px;
  display: flex;
  gap: 10px;
}

.empty {
  margin-top: 50px;
}
</style>



