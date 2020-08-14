<template>
  <div class="app-container">
    <el-row>
      <span class="name-version">{{ projectNameVersion }}</span>
    </el-row>
    <el-row>
      <el-col :span="4">
        模块
      </el-col>
      <el-col :offset="1" :span="4">
        模块版本
      </el-col>
    </el-row>
    <el-row v-for="(curModule, index) in curModuleList" :key="index" class="padding-10">
      <el-col :span="4">
        <el-select v-model="curModule.module_id" placeholder="模块" size="small" @change="curModuleChange(curModule)">
          <el-option v-for="module in moduleList" :key="module.module_id" :label="module.name" :value="module.module_id" />
        </el-select>
      </el-col>
      <el-col :offset="1" :span="4">
        <el-select v-model="curModule.mv_id" placeholder="模块版本" size="small">
          <el-option v-for="version in curModule.versionList" :key="version.mv_id" :label="version.version" :value="version.mv_id" />
        </el-select>
      </el-col>
      <el-col :offset="1" :span="2" style="line-height: 32px;">
        <i class="el-icon-delete" @click="deleteCurModule(index)" />
      </el-col>
    </el-row>
    <el-row>
      <el-button size="small" type="primary" @click="addModule()">增加模块</el-button>
      <el-button size="small" type="primary" @click="save()">保 存</el-button>
    </el-row>
  </div>
</template>

<script>
import { getModuleList, getModuleVersionModule, getModuleVersion, updateModuleOsVersion } from '@/api/project'
import _ from 'lodash'

export default {
  data() {
    return {
      projectNameVersion: '',
      curModuleList: [],
      moduleList: []
    }
  },
  created() {
    this.project_id = this.$route.query.project_id
    this.os_id = this.$route.query.os_id
    this.projectNameVersion = this.$route.query.projectNameVersion
    this.getModuleVersionModule()
    this.getModuleList()
  },
  methods: {
    getModuleList() {
      getModuleList({
        project_id: this.project_id
      })
        .then(response => {
          this.moduleList = response.data
          this.moduleTotal = response.total
        })
    },
    getModuleVersionModule() {
      getModuleVersionModule({
        project_id: this.project_id,
        os_id: this.os_id
      }).then(response => {
        _.forEach(response.data, (module) => {
          module.versionList = []
          getModuleVersion({
            project_id: this.project_id,
            module_id: module.module_id
          }).then(response => {
            if (response.code === 0) {
              module.versionList = response.data
            }
          })
        })
        this.curModuleList = response.data
        console.log(response)
      })
    },
    addModule() {
      this.curModuleList.push({
        module_id: '',
        mv_id: '',
        versionList: []
      })
    },
    deleteCurModule(index) {
      this.curModuleList.splice(index, 1)
    },
    curModuleChange(curModule) {
      curModule.mv_id = ''
      getModuleVersion({
        project_id: this.project_id,
        module_id: curModule.module_id
      }).then(response => {
        if (response.code === 0) {
          curModule.versionList = response.data
        }
      })
    },
    save() {
      updateModuleOsVersion({
        project_id: this.project_id,
        os_id: this.os_id,
        data: this.curModuleList.map(curModule => {
          return {
            module_id: curModule.module_id,
            mv_id: curModule.mv_id
          }
        })
      }).then(response => {
        if (response.code === 0) {
          this.$message.success('保存成功')
          this.$router.push('/project/projectList')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.name-version{
  display: block;
  font-size: 25px;
  margin-bottom: 30px;
  color: #409EFF;
}
.padding-10{
  padding-top: 10px;
  padding-bottom: 10px;
}
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
.el-icon-delete{
  color: #F56C6C;
  cursor: pointer;
}
</style>
