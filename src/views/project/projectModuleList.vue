<template>
  <div class="app-container">
    <div class="action-butons">
      <el-button size="small" type="primary" @click="openAddModule()">增加模块</el-button>
    </div>
    <el-table
      :data="moduleList"
      style="width: 100%"
      border
      @expand-change="moduleChange"
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
                <el-link type="primary" @click="toStep4(versionProps.row, versionScope.row)">{{ versionScope.row.version }}</el-link>
              </template>
            </el-table-column>
            <el-table-column property="release_note" label="发布说明" />
            <el-table-column property="creater" label="创建人" />
            <el-table-column property="create_time" label="创建时间" />
            <el-table-column property="update_time" label="更新时间" />
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        label="模块"
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
        prop="description"
        label="描述"
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
          <el-button type="text" size="small" @click="openAddModuleVerison(scope.row)">增加版本</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      :page-size="10"
      :total="moduleTotal"
      @current-change="pageChange"
    />

    <el-dialog title="增加模块" :visible.sync="addModuleVisible">
      <el-form ref="moduleForm" :model="moduleForm" :rules="moduleFormRules" label-width="100px">
        <el-form-item label="模块名称" prop="name">
          <el-input v-model="moduleForm.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="moduleForm.description" type="textarea" :rows="4" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addModuleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addModule()">确 定</el-button>
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
        <el-button type="primary" @click="addModuleVersion()">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getProjectList, getProjectVersions, getModuleList, addModule, getModuleVersion, addModuleVersion } from '@/api/project'
import _ from 'lodash'

export default {
  data() {
    return {
      getListParams: {
        page: 1,
        page_size: 10,
        project_id: null
      },
      moduleList: [],
      moduleTotal: 0,
      addModuleVisible: false,
      addVersionVisible: false,
      moduleForm: {
        name: '',
        description: '',
        project_id: ''
      },
      moduleFormRules: {
        name: [
          { required: true, message: '请输入模块名', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入描述', trigger: 'blur' }
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
    this.project_id = this.$route.query.project_id
    this.getListParams.project_id = this.$route.query.project_id
    this.moduleForm.project_id = this.$route.query.project_id
    this.getModuleList()
  },
  methods: {
    getModuleList() {
      getModuleList(this.getListParams)
        .then(response => {
          _.forEach(response.data, (project) => {
            project.versionList = []
          })
          this.moduleList = response.data
          this.moduleTotal = response.total
        })
    },
    pageChange(page) {
      this.getListParams.page = page
      this.getModuleList()
    },
    openAddModule() {
      this.addModuleVisible = true
      this.$nextTick(() => {
        this.$refs.moduleForm.resetFields()
      })
    },
    addModule() {
      this.$refs.moduleForm.validate((valid) => {
        if (valid) {
          addModule(this.moduleForm).then(response => {
            if (response.code === 0) {
              this.$message.success('创建模块成功')
              this.getModuleList()
              this.addModuleVisible = false
            }
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    moduleChange(row, expandedRows) {
      getModuleVersion({
        project_id: this.project_id,
        module_id: row.module_id
      }).then(response => {
        if (response.code === 0) {
          row.versionList = response.data
        }
      })
    },
    toModuleList(project) {
      this.$router.push('/project/projectModuleList?video_id=' + project.project_id)
    },
    toStep4(row, versionRow) {
      // this.$router.push('/video/step4?video_id=' + row.video_id + '&task_id=' + row.task_id + '&reid=' + row.reid)
      this.$router.push('/video/step4?video_id=' + row.video_id + '&task_id=' + row.task_id + '&reid=' + row.reid + '&version_id=' + versionRow.version_id)
    },
    openAddModuleVerison(module) {
      this.addVersionVisible = true
      this.$nextTick(() => {
        this.$refs.versionForm.resetFields()
        this.versionForm.project_id = this.project_id
        this.versionForm.module_id = module.module_id
      })
    },
    addModuleVersion() {
      this.$refs.versionForm.validate((valid) => {
        if (valid) {
          addModuleVersion(this.versionForm).then(response => {
            if (response.code === 0) {
              this.$message.success('创建版本成功')
              this.getModuleList()
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
