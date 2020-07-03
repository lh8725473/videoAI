<template>
  <div class="app-container">
    <div class="action-butons">
      <el-select v-model="getListParams.action_id" clearable size="small" placeholder="请选择标签" @change="actionChange()">
        <el-option
          v-for="action in actionList"
          :key="action.id"
          :label="action.action_name"
          :value="action.id"
        />
      </el-select>
      <el-button size="small" type="primary" @click="addActionVisible = true">增加标签</el-button>
      <el-button size="small" type="primary" :disabled="buttonDis.templateMatch" @click="templateMatch()">模板匹配</el-button>
      <el-button size="small" type="primary" :disabled="buttonDis.templateMatch" @click="deleteTemplate()">删除</el-button>
    </div>
    <el-table
      :data="templateList"
      style="width: 100%"
      border
      @expand-change="templateChange"
    >
      <el-table-column type="expand">
        <template slot-scope="versionProps">
          <el-table
            ref="multipleTable"
            :data="versionProps.row.versionList"
            style="width: 100%"
            border
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="55"
            />
            <el-table-column property="version_name" label="版本号">
              <template slot-scope="versionScope">
                <el-link type="primary" @click="toStep4(versionProps.row, versionScope.row)">{{ versionScope.row.version_name }}</el-link>
              </template>
            </el-table-column>
            <el-table-column property="version_desc" label="描述" />
            <el-table-column property="create_time" label="创建时间" />
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        label="模板名称"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
        <!-- <template slot-scope="scope">
          <el-link type="primary" @click="toStep4(scope.row)">{{ scope.row.name }}</el-link>
        </template> -->
      </el-table-column>
      <el-table-column
        prop="action_name"
        label="标签"
        width="120"
      >
        <template slot-scope="scope">
          <el-tooltip
            placement="top"
            width="200"
            effect="dark"
            :content="scope.row.action_desc"
          >
            <span style="cursor: pointer;">{{ scope.row.action_name }}<i class="el-icon-question" /></span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="video_name"
        label="模板来源"
        width="180"
      />
      <el-table-column
        prop="reid"
        label="人物ID"
        width="120"
      />
      <el-table-column
        prop="version_count"
        label="版本数"
        width="120"
      />
      <el-table-column
        prop="create_time"
        label="创建时间"
        width="160"
      />
      <!-- <template slot-scope="scope">
        <el-popover
          placement="right"
          width="500"
          trigger="click"
        >
          <el-table :data="versionList">
            <el-table-column property="version_name" label="版本号">
              <template slot-scope="versionScope">
                <el-link type="primary" @click="toStep4(scope.row, versionScope.row)">{{ versionScope.row.version_name }}</el-link>
              </template>
            </el-table-column>
            <el-table-column property="version_desc" label="描述" />
            <el-table-column property="create_time" label="创建时间" />
          </el-table>
          <el-link slot="reference" type="primary" @click="getVersionList(scope.row)">{{ scope.row.version_count }}</el-link>
        </el-popover>
      </template> -->
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
        @selection-change="videoSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
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

      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="10"
        :total="videoTotal"
        @current-change="videopageChange"
      />

      <span slot="footer" class="dialog-footer">
        <el-button @click="videoListVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="selectedVideoList.length === 0" @click="onpenMath">开 始 匹 配</el-button>
      </span>
    </el-dialog>

    <el-dialog title="增加标签" :visible.sync="addActionVisible">
      <el-form :model="actionForm" :rules="actionRules" label-width="100px">
        <el-form-item label="标签名称">
          <el-input v-model="actionForm.action_name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="标签描述">
          <el-input v-model="actionForm.action_desc" type="textarea" :rows="3" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addActionVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAction()">确 定</el-button>
      </div>
    </el-dialog>

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
import { getVideoList, preClassify, getActionsList, addAction, getTemplateAction } from '@/api/video'
import { getTemplateList, startTemplateMatch, templateMatchTest, getMatchList, getVersions, deleteVersion } from '@/api/templates'
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
        per_page: 10,
        action_id: ''
      },
      getVideoListParams: {
        page: 1,
        per_page: 10
      },
      templateList: [],
      actionList: [],
      list: null,
      videoList: [],
      videoTotal: 0,
      listLoading: true,
      total: 0,
      buttonDis: {
        templateMatch: true
      },
      videoListVisible: false,
      addActionVisible: false,
      templateMatchVisible: false,
      multipleSelection: null,
      selectedVideo: null,
      // element $loading()
      loading: null,
      actionForm: {
        action_name: '',
        action_desc: ''
      },
      actionRules: {
        action_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ],
        action_desc: [
          { required: true, message: '请输入分类描述', trigger: 'blur' }
        ]
      },
      templateMatchForm: {
        task_name: ''
      },
      selectedVideoList: [],
      matchList: [],
      versionList: []
    }
  },
  created() {
    this.getActionsList()
    this.getMatchList()
    this.getTemplateAction()
  },
  methods: {
    getMatchList() {
      getMatchList({
        type: 'all'
      }).then(response => {
        this.matchList = response.data
      })
    },
    getActionsList() {
      this.listLoading = true
      getActionsList().then(response => {
        this.actionList = response.data
        this.listLoading = false
      })
    },
    getTemplateAction() {
      getTemplateAction(this.getListParams).then(response => {
        console.log(response)
        if (response.code === 0) {
          _.forEach(response.data, (template) => {
            template.versionList = []
          })
          this.templateList = response.data
        }
      })
    },
    actionChange() {
      this.getTemplateAction()
    },
    getVideoList() {
      getVideoList(this.getVideoListParams).then(response => {
        this.videoList = response.data
        this.videoTotal = response.page_info.total
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
    videopageChange(page) {
      this.getVideoListParams.page = page
      this.getVideoList()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.buttonDis.templateMatch = !(this.multipleSelection.length > 0)
      // this.buttonDis.templateMatch = !(this.multipleSelection.length === 1)
    },
    templateMatch() {
      this.getVideoList()
      this.videoListVisible = true
    },
    handleCurrentChange(video) {
      this.selectedVideo = video
    },
    videoSelectionChange(val) {
      this.selectedVideoList = val
    },
    onpenMath() {
      this.templateMatchVisible = true
    },
    startMath() {
      this.templateMatchVisible = true
      this.templateMatchLoading = this.$loading({
        fullscreen: true,
        text: '匹配模板中...'
      })
      templateMatchTest({
        task_name: this.templateMatchForm.task_name,
        video_id: _.map(this.selectedVideoList, 'id'),
        // action_template_id: _.map(this.multipleSelection, 'id'),
        template_version_id: _.map(this.multipleSelection, 'version_id')
      }).then(response => {
        console.log(response)
        this.templateMatchVisible = false
        // setParts(response)
        this.templateMatchLoading.close()
        this.$router.push('/templates/mathResult?task_match_id=' + response.data.task_match_id)
        // this.$router.push({ name: 'mathResult' })
      }).catch((response) => {
        this.templateMatchLoading.close()
      })
    },
    addAction() {
      this.$refs.uploadForm.validate((valid) => {
        if (valid) {
          addAction(this.actionForm).then(response => {
            if (response.code === 0) {
              this.$message('增加分类成功')
              this.getActionsList()
              this.addActionVisible = false
            }
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    templateChange(row, expandedRows) {
      getVersions({
        task_id: row.task_id
      }).then(response => {
        if (response.code === 0) {
          row.versionList = response.data
        }
      })
    },
    toStep4(row, versionRow) {
      // this.$router.push('/video/step4?video_id=' + row.video_id + '&task_id=' + row.task_id + '&reid=' + row.reid)
      this.$router.push('/video/step4?video_id=' + row.video_id + '&task_id=' + row.task_id + '&reid=' + row.reid + '&version_id=' + versionRow.version_id)
    },
    querySearch(queryString, cb) {
      console.log(queryString)
      var matchList = this.matchList
      var results = queryString ? matchList.filter(this.createFilter(queryString)) : matchList
      // 调用 callback 返回建议列表的数据
      console.log(results)
      cb(results)
    },
    createFilter(queryString) {
      return (match) => {
        return (match.task_match_name.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    getVersionList(row) {
      getVersions({
        task_id: row.task_id
      }).then(response => {
        console.log(response)
        if (response.code === 0) {
          this.versionList = response.data
        }
      })
    },
    deleteTemplate() {
      this.$confirm('此操作将永久模板版本, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteVersion({
          version_id: _.map(this.multipleSelection, 'version_id')
        }).then(response => {
          if (response.code === 0) {
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.getTemplateAction()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
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
.inline-input{
  display: block;
}
</style>
