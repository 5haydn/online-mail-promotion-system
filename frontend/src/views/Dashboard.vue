<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDashboardStats } from '@/api'

interface Stats {
  total_customers: number
  unread_notifications: number
}

const stats = ref<Stats>({
  total_customers: 0,
  unread_notifications: 0,
})
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await getDashboardStats()
    stats.value = data
  } finally {
    loading.value = false
  }
})

const cards = [
  { key: 'total_customers', label: '客户总数', color: '#409eff' },
  { key: 'unread_notifications', label: '未读消息', color: '#f56c6c' },
] as const
</script>

<template>
  <div v-loading="loading">
    <h2 class="page-title">数据看板</h2>
    <el-row :gutter="20">
      <el-col v-for="card in cards" :key="card.key" :span="12">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value" :style="{ color: card.color }">
            {{ stats[card.key] }}
          </div>
          <div class="stat-label">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-card class="welcome-card" shadow="never">
      <h3>欢迎使用在线邮件推广系统</h3>
      <p>上传客户 Excel → AI 生成个性化邮件 → 批量发送 → 自动监听回复</p>
      <el-steps :active="0" finish-status="success" simple style="margin-top: 20px">
        <el-step title="导入客户" />
        <el-step title="AI 生成文案" />
        <el-step title="批量发送" />
        <el-step title="监听回复" />
      </el-steps>
    </el-card>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 20px;
  font-size: 20px;
}
.stat-card {
  text-align: center;
  margin-bottom: 20px;
}
.stat-value {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
}
.stat-label {
  margin-top: 8px;
  color: #909399;
  font-size: 14px;
}
.welcome-card {
  margin-top: 4px;
}
.welcome-card h3 {
  margin: 0 0 8px;
}
.welcome-card p {
  margin: 0;
  color: #606266;
}
</style>
