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
      <el-table-column label="版本个数" width="110" align="center">
        <template slot-scope="scope">
          <el-popover
            placement="right"
            width="550"
            trigger="click"
          >
            <el-table :data="scope.row.templates">
              <el-table-column property="name" label="模板名称" />
              <el-table-column property="version_name" label="版本名称" />
              <el-table-column property="version_desc" label="版本描述" />
              <el-table-column width="170" property="create_time" label="创建时间" />
              <el-table-column width="140" property="reid" label="人物REID" />
            </el-table>
            <el-link slot="reference" type="primary">{{ scope.row.template_count }}</el-link>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="视频个数" width="110" align="center">
        <template slot-scope="scope">
          <el-popover
            placement="right"
            width="500"
            trigger="click"
          >
            <el-table :data="scope.row.videos">
              <el-table-column property="video_name" label="名称" />
              <el-table-column width="170" property="upload_time" label="上传时间" />
              <el-table-column width="80" property="total_time" label="时长(s)" />
            </el-table>
            <el-link slot="reference" type="primary">{{ scope.row.video_count }}</el-link>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="100"
      >
        <template slot-scope="scope">
          <el-button type="text" size="small" :disabled="scope.row.task_match_status !== '2' && scope.row.task_match_status !== '-100'" @click="reRun(scope.row)">重新匹配</el-button>
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

    <el-dialog title="匹配任务" :visible.sync="templateMatchVisible">
      <el-form :model="templateMatchForm" label-width="100px">
        <el-form-item label="匹配名称">
          <el-autocomplete
            v-model="templateMatchForm.task_name"
            class="inline-input"
            autocomplete="off"
            :fetch-suggestions="querySearch"
            value-key="task_match_name"
            placeholder="请输入内容"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="templateMatchVisible = false">取 消</el-button>
        <el-button type="primary" @click="startMath()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getVideoList, preClassify, postKeyPeople } from '@/api/video'
import { getMatchList, templateMatchTest } from '@/api/templates'
import _ from 'lodash'

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
      total: 0,
      templateMatchVisible: false,
      templateMatchForm: {
        task_name: ''
      },
      matchList: []
    }
  },
  created() {
    this.getMatchList()
    this.getAllMatchList()
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
    getAllMatchList() {
      getMatchList({
        type: 'all'
      }).then(response => {
        this.matchList = response.data
      })
    },
    pageChange(page) {
      this.getListParams.page = page
      this.getMatchList()
    },
    reRun(row) {
      this.reRunRow = row
      this.templateMatchForm.task_name = row.task_match_name
      this.templateMatchVisible = true
    },
    querySearch(queryString, cb) {
      console.log(queryString)
      var matchList = this.matchList
      var results = queryString ? matchList.filter(this.createFilter(queryString)) : matchList
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter(queryString) {
      return (match) => {
        return (match.task_match_name.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    startMath() {
      this.loading = this.$loading({
        fullscreen: true,
        text: '匹配模板中...'
      })
      templateMatchTest({
        task_name: this.templateMatchForm.task_name,
        video_id: _.map(this.reRunRow.videos, 'id'),
        template_version_id: _.map(this.reRunRow.templates, 'version_id')
      }).then(response => {
        this.templateMatchVisible = false
        this.loading.close()
        this.$router.push('/templates/mathResult?task_match_id=' + response.data.task_match_id)
      }).catch((response) => {
        this.loading.close()
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
  float: right;
  margin-top: 15px;
}
</style>
