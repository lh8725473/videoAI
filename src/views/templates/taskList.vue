<template>
  <div class="app-container">
    <div class="action-butons">
      <el-button size="small" type="primary" :disabled="buttonDis.deriveTask" @click="onpenDeriveTaskVisible()">模板派生</el-button>
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
        width="55"
      />
      <el-table-column label="任务名称">
        <template slot-scope="scope">
          <span>{{ scope.row.task_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180" align="center">
        <template slot-scope="scope">
          {{ scope.row.create_time }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="180">
        <template slot-scope="scope">
          {{ scope.row.update_time }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="视频预分段" width="110" align="center">
        <template slot-scope="scope">
          <el-link v-show="scope.row.step1 == '1' || scope.row.step1 == '2'" type="primary" :href="'#/video/step1?video_id=' + scope.row.id + '&task_id=' + scope.row.task_id">{{ scope.row.step1 | statusFilter }}</el-link>
          <span v-show="scope.row.step1 != '1' && scope.row.step1 != '2'">{{ scope.row.step1 | statusFilter }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="视频预分段" width="140" align="center">
        <template slot-scope="scope">
          <el-link v-show="scope.row.step1 == '1' || scope.row.step1 == '2'" type="primary" :href="'#/video/step2?video_id=' + scope.row.video_id + '&task_id=' + scope.row.task_id">{{ scope.row.step1 | statusFilter }}</el-link>
          <span v-show="scope.row.step1 != '1' && scope.row.step1 != '2'">{{ scope.row.step1 | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关键帧提取" width="110" align="center">
        <template slot-scope="scope">
          <el-link v-show="scope.row.step2 == '1' || scope.row.step2 == '2'" type="primary" :href="'#/video/step3?video_id=' + scope.row.video_id + '&task_id=' + scope.row.task_id">{{ scope.row.step2 | statusFilter }}</el-link>
          <span v-show="scope.row.step2 != '1' && scope.row.step2 != '2'">{{ scope.row.step2 | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模板提取" width="110" align="center">
        <template slot-scope="scope">
          <el-link v-show="scope.row.step3 == '1' || scope.row.step3 == '2'" type="primary" :href="'#/video/step4?video_id=' + scope.row.video_id + '&task_id=' + scope.row.task_id">{{ scope.row.step3 | statusFilter }}</el-link>
          <span v-show="scope.row.step3 != '1' && scope.row.step3 != '2'">{{ scope.row.step3 | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="归档状态" width="110" align="center">
        <template slot-scope="scope">
          <el-link v-show="scope.row.step4 == '1' || scope.row.step4 == '2'" type="primary" :href="'#/video/step4?video_id=' + scope.row.video_id + '&task_id=' + scope.row.task_id">{{ scope.row.step4 | statusFilter }}</el-link>
          <span v-show="scope.row.step4 != '1' && scope.row.step4 != '2'">{{ scope.row.step4 | statusFilter }}</span>
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

    <el-dialog title="匹配任务" :visible.sync="deriveTaskVisible">
      <el-form :model="deriveTaskForm" label-width="100px">
        <el-form-item label="任务名称">
          <el-input
            v-model="deriveTaskForm.task_name"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="任务名称">
          <el-select v-model="deriveTaskForm.step" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deriveTaskVisible = false">取 消</el-button>
        <el-button type="primary" @click="deriveTask()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getVideoList, preClassify, postKeyPeople, basicData, taskList } from '@/api/video'
import { deriveTask } from '@/api/templates'
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
      total: 0,
      deriveTaskVisible: false,
      deriveTaskForm: {
        task_name: '',
        step: ''
      },
      buttonDis: {
        deriveTask: true
      },
      options: [{
        value: 1,
        label: '视频预分段',
        disabled: false
      }, {
        value: 2,
        label: '关键帧提取',
        disabled: false
      }, {
        value: 3,
        label: '模板提取',
        disabled: false
      }]
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
      taskList(this.getListParams).then(response => {
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
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.buttonDis.deriveTask = this.multipleSelection.length !== 1
    },
    onpenDeriveTaskVisible() {
      this.deriveTaskVisible = true
      var row = _.first(this.multipleSelection)
      this.deriveTaskForm.task_name = row.task_name
      if (row.step3 === '0') {
        this.options[2].disabled = true
      }
      if (row.step2 === '0') {
        this.options[1].disabled = true
      }
    },
    deriveTask() {
      var row = _.first(this.multipleSelection)
      deriveTask({
        task_name: this.deriveTaskForm.task_name,
        task_id: row.task_id,
        step_index: this.deriveTaskForm.step,
        version_id: row.version_id
      }).then(response => {
        if (response.code === 0) {
          if (this.deriveTaskForm.step === 1) {
            this.$router.push('/video/step2?video_id=' + response.data.video_id + '&task_id=' + response.data.task_id)
          }
          if (this.deriveTaskForm.step === 2) {
            this.$router.push('/video/step3?video_id=' + response.data.video_id + '&task_id=' + response.data.task_id)
          }
          if (this.deriveTaskForm.step === 3) {
            this.$router.push('/video/step4?video_id=' + response.data.video_id + '&task_id=' + response.data.task_id + '&version_id=' + response.data.version_id)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-select{
  width: 100%;
}
.action-butons{
  margin-bottom: 10px;
}
.el-pagination{
  float: right;
  margin-top: 15px;
}
</style>
