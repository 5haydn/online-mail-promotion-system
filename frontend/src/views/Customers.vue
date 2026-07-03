<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import {
  downloadTemplate,
  uploadCustomers,
  listCustomers,
  listGroups,
  createGroup,
} from '@/api'

interface Customer {
  id: number
  email: string
  name: string | null
  company: string | null
  industry: string | null
  product_interest: string | null
  is_valid: boolean
  validation_error: string | null
  created_at: string
}

interface Group {
  id: number
  name: string
  description: string | null
}

const customers = ref<Customer[]>([])
const groups = ref<Group[]>([])
const loading = ref(false)
const uploading = ref(false)
const selectedGroupId = ref<number | undefined>()
const showGroupDialog = ref(false)
const newGroupName = ref('')
const newGroupDesc = ref('')

async function fetchData() {
  loading.value = true
  try {
    const [custRes, groupRes] = await Promise.all([listCustomers(), listGroups()])
    customers.value = custRes.data
    groups.value = groupRes.data
  } finally {
    loading.value = false
  }
}

async function handleDownloadTemplate() {
  const { data } = await downloadTemplate()
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = 'customer_template.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}

async function handleUpload(options: { file: File }) {
  uploading.value = true
  try {
    const { data } = await uploadCustomers(options.file, selectedGroupId.value)
    ElMessage.success(
      `导入完成：有效 ${data.valid_rows} 条，错误 ${data.error_rows} 条`,
    )
    await fetchData()
  } finally {
    uploading.value = false
  }
}

async function handleCreateGroup() {
  if (!newGroupName.value.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }
  await createGroup({ name: newGroupName.value, description: newGroupDesc.value || undefined })
  ElMessage.success('分组创建成功')
  showGroupDialog.value = false
  newGroupName.value = ''
  newGroupDesc.value = ''
  await fetchData()
}

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">客户管理</h2>
      <div class="actions">
        <el-select v-model="selectedGroupId" placeholder="选择分组（可选）" clearable style="width: 180px">
          <el-option v-for="g in groups" :key="g.id" :label="g.name" :value="g.id" />
        </el-select>
        <el-button @click="showGroupDialog = true">新建分组</el-button>
        <el-button @click="handleDownloadTemplate">下载模板</el-button>
        <el-upload :show-file-list="false" :http-request="handleUpload" accept=".xlsx,.xls">
          <el-button type="primary" :loading="uploading" :icon="Upload">上传 Excel</el-button>
        </el-upload>
      </div>
    </div>

    <el-table v-loading="loading" :data="customers" stripe border style="width: 100%">
      <el-table-column prop="email" label="邮箱" min-width="200" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="company" label="公司" width="150" />
      <el-table-column prop="industry" label="行业" width="120" />
      <el-table-column prop="product_interest" label="意向产品" width="140" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.is_valid ? 'success' : 'danger'" size="small">
            {{ row.is_valid ? '有效' : '无效' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="validation_error" label="错误原因" min-width="160" />
    </el-table>

    <el-dialog v-model="showGroupDialog" title="新建客户分组" width="400px">
      <el-form label-width="80px">
        <el-form-item label="分组名称">
          <el-input v-model="newGroupName" placeholder="如：互联网行业" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newGroupDesc" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showGroupDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateGroup">确定</el-button>
      </template>
    </el-dialog>
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
  gap: 10px;
  align-items: center;
}
</style>
