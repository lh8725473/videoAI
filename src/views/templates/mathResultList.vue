<template>
  <div class="app-container">
    <!-- <div class="action-butons">
      <el-upload
        class="upload-demo"
        :action="uploadUrl"
        :show-file-list="false"
        :on-success="uploadSuccess"
        accept=".mp4"
      >
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
    </div> -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="匹配名称">
        <template slot-scope="scope">
          <el-link type="primary" :href="'#/templates/mathResult?task_match_id=' + scope.row.task_match_id">{{ scope.row.task_match_name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template slot-scope="scope">
          {{ scope.row.create_time }}
        </template>
      </el-table-column>
      <el-table-column label="匹配状态" width="110">
        <template slot-scope="scope">
          {{ scope.row.task_match_status | statusFilter }}
        </template>
      </el-table-column>
      <el-table-column label="模板个数" width="110">
        <template slot-scope="scope">
          {{ scope.row.template_count }}
        </template>
      </el-table-column>
      <el-table-column label="视频个数" width="110">
        <template slot-scope="scope">
          {{ scope.row.video_count }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="prev, pager, next"
      :page-size="10"
      :total="total"
      @current-change="pageChange"
    />
  </div>
</template>

<script>
import { getVideoList, preClassify, postKeyPeople } from '@/api/video'
import { getMatchList } from '@/api/templates'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        '0': '创建任务完成',
        '1': '开始任务',
        '2': '任务正常结束',
        '-100': '任务异常结束'
      }
      return statusMap[status]
    },
    functionFilter(fun) {
      const functionText = {
        '0': '视频提取，视频匹配',
        '1': '视频提取',
        '2': '视频提取'
      }
      return functionText[fun]
    }
  },
  data() {
    return {
      uploadUrl: process.env.VUE_APP_BASE_API + '/video/upload',
      getListParams: {
        page: 1,
        per_page: 10
      },
      list: null,
      listLoading: true,
      total: 0
    }
  },
  created() {
    this.getMatchList()
  },
  methods: {
    getMatchList() {
      this.listLoading = true
      getMatchList(this.getListParams).then(response => {
        this.list = response.data
        this.total = response.page_info.total
        this.listLoading = false
      })
    },
    pageChange(page) {
      this.getListParams.page = page
      this.getMatchList()
    }
  }
}
</script>

<style lang="scss" scoped>
.action-butons{
  margin-bottom: 10px;
}
.el-pagination{
  float: right;
  margin-top: 15px;
}
</style>
