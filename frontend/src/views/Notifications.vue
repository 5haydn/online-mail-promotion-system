<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '@/api'

interface Notification {
  id: number
  title: string
  content: string
  is_read: boolean
  created_at: string
}

const notifications = ref<Notification[]>([])
const loading = ref(false)
const unreadOnly = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const { data } = await listNotifications({ unread_only: unreadOnly.value })
    notifications.value = data
  } finally {
    loading.value = false
  }
}

async function handleRead(id: number) {
  await markNotificationRead(id)
  await fetchData()
}

async function handleReadAll() {
  await markAllNotificationsRead()
  await fetchData()
}

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">消息中心</h2>
      <div class="actions">
        <el-switch v-model="unreadOnly" active-text="仅未读" @change="fetchData" />
        <el-button @click="handleReadAll">全部标为已读</el-button>
      </div>
    </div>

    <el-empty v-if="!loading && notifications.length === 0" description="暂无消息" />

    <el-timeline v-else v-loading="loading">
      <el-timeline-item
        v-for="item in notifications"
        :key="item.id"
        :timestamp="item.created_at"
        placement="top"
      >
        <el-card :class="{ unread: !item.is_read }" shadow="hover">
          <div class="notif-header">
            <strong>{{ item.title }}</strong>
            <el-tag v-if="!item.is_read" type="danger" size="small">未读</el-tag>
          </div>
          <p class="notif-content">{{ item.content }}</p>
          <el-button v-if="!item.is_read" size="small" text type="primary" @click="handleRead(item.id)">
            标为已读
          </el-button>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.page-title {
  margin: 0;
  font-size: 20px;
}
.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.unread {
  border-left: 3px solid #f56c6c;
}
.notif-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.notif-content {
  margin: 0 0 8px;
  color: #606266;
}
</style>
