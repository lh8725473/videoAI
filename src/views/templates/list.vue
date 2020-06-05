<template>
  <div class="app-container">
    <div class="action-butons">
      <el-button size="small" type="primary" @click="addActionVisible = true">增加动作</el-button>
      <el-button size="small" type="primary" :disabled="buttonDis.templateMatch" @click="templateMatch()">模板匹配</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @expand-change="expandChange"
    >
      <!-- <el-table-column
        type="selection"
        width="40"
      /> -->
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table
            ref="multipleTable"
            :data="props.row.templateList"
            style="width: 100%"
            border
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="55"
            />
            <el-table-column
              label="模板名称"
            >
              <template slot-scope="scope">{{ scope.row.name }}</template>
            </el-table-column>
            <el-table-column
              prop="create_time"
              label="创建时间"
              width="160"
            />
            <el-table-column
              prop="video_name"
              label="模板来源"
              width="180"
            />
            <el-table-column
              prop="reid"
              label="人物REID"
              width="120"
            />
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="动作名称" width="110">
        <template slot-scope="scope">
          {{ scope.row.action_name }}
        </template>
      </el-table-column>
      <el-table-column label="动作描述">
        <template slot-scope="scope">
          {{ scope.row.action_desc }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160" align="center">
        <template slot-scope="scope">
          {{ scope.row.create_time }}
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
        <el-button type="primary" :disabled="selectedVideo === null" @click="startMath">开 始 匹 配</el-button>
      </span>
    </el-dialog>

    <el-dialog title="增加动作" :visible.sync="addActionVisible">
      <el-form :model="actionForm" label-width="100px">
        <el-form-item label="动作名称">
          <el-input v-model="actionForm.action_name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="动作描述">
          <el-input v-model="actionForm.action_desc" type="textarea" :rows="3" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addActionVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAction()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getVideoList, preClassify, getActionsList, addAction, getTemplateAction } from '@/api/video'
import { getTemplateList, startTemplateMatch } from '@/api/templates'
import { setParts } from './parts.vm'
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
      addActionVisible: false,
      multipleSelection: null,
      selectedVideo: null,
      // element $loading()
      loading: null,
      actionForm: {
        action_name: '',
        action_desc: ''
      }
    }
  },
  created() {
    this.getActionsList()
  },
  methods: {
    getActionsList() {
      this.listLoading = true
      getActionsList(this.getListParams).then(response => {
        console.log(response)
        _.forEach(response.data, (atcion) => {
          atcion.templateList = []
        })
        this.list = response.data
        this.total = response.page_info.total
        this.listLoading = false
      })
    },
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
      // this.buttonDis.templateMatch = !(this.multipleSelection.length > 0)
      this.buttonDis.templateMatch = !(this.multipleSelection.length === 1)
    },
    templateMatch() {
      this.getVideoList()
      this.videoListVisible = true
    },
    handleCurrentChange(video) {
      this.selectedVideo = video
    },
    startMath() {
      this.loading = this.$loading({
        fullscreen: true,
        text: '匹配模板中...'
      })
      startTemplateMatch({
        video_id: this.selectedVideo.id,
        action_template_id: _.map(this.multipleSelection, 'id')
      }).then(response => {
        setParts(response.data)
        this.loading.close()
        this.$router.push({ name: 'mathResult' })
      })
    },
    addAction() {
      addAction(this.actionForm).then(response => {
        if (response.code === 0) {
          this.$message('增加动作成功')
          this.getActionsList()
          this.addActionVisible = false
        }
      })
    },
    expandChange(row, expandedRows) {
      getTemplateAction({
        action_id: row.id
      }).then(response => {
        console.log(response)
        if (response.code === 0) {
          row.templateList = response.data
        }
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
