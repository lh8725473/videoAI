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
      <el-table-column label="视频名称" width="200">
        <template slot-scope="scope">
          <el-link v-show="scope.row.status == '2'" type="primary" :href="'#/video/step1?video_id=' + scope.row.id">{{ scope.row.video_name }}</el-link>
          <span v-show="scope.row.status != '2'">{{ scope.row.video_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分析状态" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.status | statusFilter }}
        </template>
      </el-table-column>
      <el-table-column label="视频大小" width="110">
        <template slot-scope="scope">
          {{ scope.row.file_size }}M
        </template>
      </el-table-column>
      <el-table-column label="码率(kb/s)" width="110">
        <template slot-scope="scope">
          {{ (scope.row.bit_rate / 1000).toFixed(0) }}
        </template>
      </el-table-column>
      <el-table-column label="视频大小" width="110">
        <template slot-scope="scope">
          {{ scope.row.file_size }}M
        </template>
      </el-table-column>
      <el-table-column label="视频格式" width="110">
        <template slot-scope="scope">
          {{ scope.row.type }}
        </template>
      </el-table-column>
      <el-table-column label="总帧数" width="110">
        <template slot-scope="scope">
          {{ scope.row.nb_frames }}
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
          <el-button type="text" size="small" :disabled="scope.row.status != '0' && scope.row.status != '-100'" @click="basicData(scope.row)">视频分析</el-button>
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
import { getVideoList, preClassify, postKeyPeople, basicData } from '@/api/video'
import _ from 'lodash'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        '0': '未开始',
        '1': '检测中',
        '2': '结束',
        '10': '等待中',
        '-100': '异常'
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
    this.$socket.on('video_task', (res) => {
      if (res.code === 0) {
        const video = _.find(this.list, { id: res.data.id })
        if (video) {
          video.status = res.data.status
        }
      }
    })
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
    basicData(video) {
      basicData({
        video_id: video.id
      }).then(response => {
        console.log(response)
        if (response.code === 0) {
          // this.$router.push('/video/step1?video_id=' + video.id)
        }
      })
    },
    preClassify(video) {
      postKeyPeople({
        video_id: video.id
      }).then(response => {
        console.log(response)
        if (response.code === 0) {
          this.$router.push('/video/step1?video_id=' + video.id)
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
