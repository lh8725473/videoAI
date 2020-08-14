<template>
  <div class="app-container">
    <div class="action-butons">
      <el-button size="small" type="primary" @click="openAddProject()">创建项目</el-button>
    </div>
    <el-table
      :data="projectList"
      style="width: 100%"
      border
      @expand-change="projectChange"
    >
      <el-table-column type="expand">
        <template slot-scope="versionProps">
          <el-table
            ref="multipleTable"
            :data="versionProps.row.versionList"
            style="width: 100%"
            border
          >
            <el-table-column property="version" label="版本号">
              <template slot-scope="versionScope">
                <el-link type="primary" @click="toProjectToModule(versionProps.row, versionScope.row)">{{ versionScope.row.version }}</el-link>
              </template>
            </el-table-column>
            <el-table-column property="release_note" label="发布说明" />
            <el-table-column property="creater" label="创建人" />
            <el-table-column property="create_time" label="创建时间" width="160" />
            <el-table-column property="update_time" label="更新时间" width="160" />
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        label="项目名称"
      >
        <template slot-scope="scope">
          <el-link type="primary" @click="toModuleList(scope.row)">{{ scope.row.name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="creater"
        label="创建人id"
        width="100"
      />
      <el-table-column
        prop="project_key"
        label="项目key"
      />
      <el-table-column
        prop="create_time"
        label="创建时间"
        width="160"
      />
      <el-table-column
        prop="update_time"
        label="更新时间"
        width="160"
      />
      <el-table-column
        fixed="right"
        label="操作"
        width="100"
      >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="openAddProjectVerison(scope.row)">增加版本</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      :page-size="10"
      :total="projectTotal"
      @current-change="pageChange"
    />

    <el-dialog title="创建项目" :visible.sync="addProjectVisible">
      <el-form ref="projectForm" :model="projectForm" :rules="projectFormRules" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="projectForm.name" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addProjectVisible = false">取 消</el-button>
        <el-button type="primary" @click="addProject()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="增加版本" :visible.sync="addVersionVisible">
      <el-form ref="versionForm" :model="versionForm" :rules="versionFormRules" label-width="100px">
        <el-form-item label="版本号" prop="version">
          <el-input v-model="versionForm.version" autocomplete="off" />
        </el-form-item>
        <el-form-item label="版本说明" prop="release_note">
          <el-input v-model="versionForm.release_note" type="textarea" :rows="4" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVersionVisible = false">取 消</el-button>
        <el-button type="primary" @click="addProjectVersion()">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getTemplateList, startTemplateMatch, templateMatchTest, getMatchList, getVersions, deleteVersion } from '@/api/templates'
import { getProjectList, addProject, getProjectVersions, addProjectVersion, getModuleList } from '@/api/project'
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
      getListParams: {
        page: 1,
        page_size: 10
      },
      projectList: [],
      projectTotal: 0,
      addProjectVisible: false,
      addVersionVisible: false,
      projectForm: {
        name: ''
      },
      projectFormRules: {
        name: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ]
      },
      versionForm: {
        project_id: null,
        version: '',
        release_note: ''
      },
      versionFormRules: {
        version: [
          { required: true, message: '请输入版本号', trigger: 'blur' }
        ],
        release_note: [
          { required: true, message: '请输入版本说明', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getProjectList()
  },
  methods: {
    getProjectList() {
      getProjectList(this.getListParams)
        .then(response => {
          _.forEach(response.data, (project) => {
            project.versionList = []
          })
          this.projectList = response.data
          this.projectTotal = response.total
        })
    },
    pageChange(page) {
      this.getListParams.page = page
      this.getProjectList()
    },
    openAddProject() {
      this.addProjectVisible = true
      this.$nextTick(() => {
        this.$refs.projectForm.resetFields()
      })
    },
    addProject() {
      this.$refs.projectForm.validate((valid) => {
        if (valid) {
          addProject(this.projectForm).then(response => {
            if (response.code === 0) {
              this.$message.success('创建项目成功')
              this.getProjectList()
              this.addProjectVisible = false
            }
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    projectChange(row, expandedRows) {
      getProjectVersions({
        project_id: row.project_id
      }).then(response => {
        if (response.code === 0) {
          row.versionList = response.data
        }
      })
    },
    toModuleList(project) {
      this.$router.push('/project/projectModuleList?project_id=' + project.project_id)
    },
    toProjectToModule(project, versionRow) {
      console.log(project)
      console.log(versionRow)
      const projectNameVersion = project.name + '-' + versionRow.version
      // this.$router.push('/video/step4?video_id=' + row.video_id + '&task_id=' + row.task_id + '&reid=' + row.reid)
      this.$router.push('/project/projectToModule?project_id=' + project.project_id + '&os_id=' + versionRow.os_id + '&projectNameVersion=' + projectNameVersion)
    },
    openAddProjectVerison(project) {
      this.addVersionVisible = true
      this.$nextTick(() => {
        this.$refs.versionForm.resetFields()
        this.versionForm.project_id = project.project_id
      })
    },
    addProjectVersion() {
      this.$refs.versionForm.validate((valid) => {
        if (valid) {
          addProjectVersion(this.versionForm).then(response => {
            if (response.code === 0) {
              this.$message.success('创建版本成功')
              this.getProjectList()
              this.addVersionVisible = false
            }
          })
        } else {
          console.log('error submit!!')
          return false
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
.inline-input{
  display: block;
}
</style>
