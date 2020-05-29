<template>
  <div class="app-container">
    <div class="action-butons">
      <el-upload
        class="upload-demo"
        :action="uploadUrl"
        :show-file-list="false"
        :on-success="uploadSuccess"
        accept=".mp4"
      >
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="视频名称">
        <template slot-scope="scope">
          {{ scope.row.video_name }}
        </template>
      </el-table-column>
      <el-table-column label="视频大小" width="110">
        <template slot-scope="scope">
          {{ scope.row.file_size }}M
        </template>
      </el-table-column>
      <el-table-column label="帧率" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.fps }}fps</span>
        </template>
      </el-table-column>
      <el-table-column label="分析类型" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.function | functionFilter }}
        </template>
      </el-table-column>
      <el-table-column label="分辨率" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.resolution }}
        </template>
      </el-table-column>
      <el-table-column label="分析次数" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.count }}
        </template>
      </el-table-column>
      <el-table-column label="时长" width="80" align="center">
        <template slot-scope="scope">
          {{ scope.row.total_time }}s
        </template>
      </el-table-column>
      <el-table-column label="上传时间" width="180" align="center">
        <template slot-scope="scope">
          {{ scope.row.upload_time }}
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="100"
      >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="preClassify(scope.row)">视频分析</el-button>
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
import { getVideoList, preClassify } from '@/api/video'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
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
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getVideoList(this.getListParams).then(response => {
        console.log(response)
        this.list = response.data
        this.total = response.page_info.total
        this.listLoading = false
      })
    },
    preClassify(video) {
      preClassify({
        video_id: video.id
      }).then(response => {
        if (response.code === 0) {
          this.$router.push('/video/step1?video_id=' + video.id + '&task_id=' + response.data.task_id)
        }
      })
    },
    pageChange(page) {
      this.getListParams.page = page
      this.fetchData()
    },
    uploadSuccess() {
      this.$message('上传视频成功')
      this.getListParams.page = 1
      this.fetchData()
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
