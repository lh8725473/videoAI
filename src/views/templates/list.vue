<template>
  <div class="app-container">
    <div class="action-butons">
      <el-button size="small" type="primary" :disabled="buttonDis.templateMatch" @click="templateMatch()">模板匹配</el-button>
      <!-- <el-upload
        class="upload-demo"
        :action="uploadUrl"
        :show-file-list="false"
        :on-success="uploadSuccess"
        accept=".mp4"
      >
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload> -->
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="40"
      />
      <el-table-column label="模板名称">
        <template slot-scope="scope">
          {{ scope.row.template_name }}
        </template>
      </el-table-column>
      <el-table-column label="生成类型" width="110">
        <template slot-scope="scope">
          {{ scope.row.operation_type | operationTypeFilter }}
        </template>
      </el-table-column>
      <el-table-column label="视频名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.video_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.create_time }}
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

    <el-dialog title="模板匹配" :visible.sync="videoListVisible" width="70%">
      <el-table
        :data="videoList"
        border
        fit
        highlight-current-row
        @current-change="handleCurrentChange"
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
      </el-table>

      <!-- <el-pagination
        background
        layout="prev, pager, next"
        :page-size="10"
        :total="total"
        @current-change="pageChange"
      /> -->

      <span slot="footer" class="dialog-footer">
        <el-button @click="videoListVisible = false">取 消</el-button>
        <el-button type="primary" @click="startMath" :disabled="selectedVideo === null">开 始 匹 配</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getVideoList, preClassify } from '@/api/video'
import { getTemplateList, startTemplateMatch } from '@/api/templates'
import _ from 'lodash'

export default {
  filters: {
    operationTypeFilter(fun) {
      const operationText = {
        '0': '机器分析',
        '1': '人工修正'
      }
      return operationText[fun]
    },
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
      videoList: [],
      listLoading: true,
      total: 0,
      buttonDis: {
        templateMatch: true
      },
      videoListVisible: false,
      multipleSelection: null,
      selectedVideo: null
    }
  },
  created() {
    this.getTemplateList()
  },
  methods: {
    getTemplateList() {
      this.listLoading = true
      getTemplateList(this.getListParams).then(response => {
      // getTemplateList().then(response => {
        this.list = response.data
        this.total = response.page_info.total
        this.listLoading = false
      })
    },
    getVideoList() {
      getVideoList(this.getListParams).then(response => {
        this.videoList = response.data
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
      this.getTemplateList()
    },
    uploadSuccess() {
      this.$message('上传视频成功')
      this.getListParams.page = 1
      this.fetchData()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.buttonDis.templateMatch = !(this.multipleSelection.length > 0)
    },
    templateMatch() {
      this.getVideoList()
      this.videoListVisible = true
    },
    handleCurrentChange(video) {
      this.selectedVideo = video
    },
    startMath() {
      startTemplateMatch({
        video_id: this.selectedVideo.id,
        template_id: _.map(this.multipleSelection, 'template_id')
      }).then(response => {
        console.log(response)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.action-butons{
  margin-bottom: 10px;
}
.el-pagination{
  text-align: right;
  margin-top: 15px;
}
</style>
