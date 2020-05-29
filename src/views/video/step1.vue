<template>
  <div class="app-container">
    <el-row>
      <el-col :span="16">
        <video ref="video" width="100%" height="480" :src="baseAPI + videoInfo.path" controls="controls">
          your browser does not support the video tag
        </video>
      </el-col>
      <el-col v-show="taskInfo.status === '2'" :offset="1" :span="6">
        <el-tabs v-model="activePeople" type="card" @tab-click="handleClick">
          <el-tab-pane v-for="(item, index) in result" :key="index" :label="item.people_number" :name="item.people_number" />
        </el-tabs>
        <el-row>
          <el-col :span="10">开始时间</el-col>
          <el-col :offset="1" :span="10">结束时间</el-col>
        </el-row>
        <el-row v-for="(item, index) in part" :key="index">
          <el-col :span="10">
            <el-input v-model="item[0]" size="mini" />
          </el-col>
          <el-col :offset="1" :span="10">
            <el-input v-model="item[1]" size="mini" />
          </el-col>
          <el-col :offset="1" :span="2">
            <i class="el-icon-video-play" @click="playVideo(item)" />
          </el-col>
        </el-row>
        <el-row class="action-buttons">
          <el-col :span="10"><el-button size="small" type="warning" disabled @click="savePart()">保存片段</el-button></el-col>
          <el-col :offset="1" :span="10"><el-button size="small" type="primary" @click="keyPeople()">下一步</el-button></el-col>
        </el-row>
        <el-image
          style="width: 200px; height: 200px"
          :src="url"
          fit="contain"
        />
      </el-col>
      <el-col v-show="taskInfo.status === '1'" :offset="1" :span="6">
        <div class="loading-div">
          <i class="el-icon-loading" />
          <div>结果分析中...</div>
        </div>
      </el-col>
      <el-col v-show="taskInfo.status === '-100'" :offset="1" :span="6">
        <div class="warning-div">
          <i class="el-icon-warning-outline" />
          <div>分析失败</div>
        </div>
      </el-col>
    </el-row>

    <el-row>
      视频历史预分类
    </el-row>
    <el-table
      :data="preClassifyList"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="创建时间" width="180">
        <template slot-scope="scope">
          {{ scope.row.create_time }}
        </template>
      </el-table-column>
      <el-table-column label="操作类型" width="110">
        <template slot-scope="scope">
          {{ scope.row.operation_type | operationTypeFilter }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.status | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分析结果" align="center">
        <template slot-scope="scope">
          {{ scope.row.result }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getPreClassify, getPreClassifyList, getVideoInfo, keyPeople } from '@/api/video'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        '0': '未开始 ',
        '1': '进行中',
        '2': '正常结束',
        '-100': '分析异常'
      }
      return statusMap[status]
    },
    operationTypeFilter(fun) {
      const operationText = {
        '0': '机器分析',
        '1': '人工修正'
      }
      return operationText[fun]
    }
  },
  data() {
    return {
      baseAPI: process.env.VUE_APP_BASE_API,
      form: {

      },
      result: [],
      part: [],
      activePeople: '',
      taskInfo: {},
      videoInfo: {},
      preClassifyList: [],
      url: ''
    }
  },
  created() {
    this.video_id = this.$route.query.video_id
    this.task_id = this.$route.query.task_id
    this.getPreClassify()
    this.getPreClassifyList()
    this.getVideoInfo()
    this.$socket.on('pre_classfily_response', (data) => {
      if (data.data.task_id === this.task_id) {
        this.result = data.data.data
        if (this.result) {
          this.activePeople = this.result[0].people_number
          this.part = this.result[0].part
          this.url = process.env.VUE_APP_BASE_API + this.result[0].reid_img
          this.taskInfo.status = data.data.status
        }
      }
    })
  },
  methods: {
    getVideoInfo() {
      getVideoInfo({
        video_id: this.video_id
      }).then(response => {
        this.videoInfo = response.data
      })
    },
    getPreClassify() {
      getPreClassify({
        video_id: this.video_id,
        task_id: this.task_id
      }).then(response => {
        this.result = response.data.result
        if (this.result) {
          this.activePeople = this.result[0].people_number
          this.part = this.result[0].part
          this.url = process.env.VUE_APP_BASE_API + this.result[0].reid_img
        }

        this.taskInfo = response.data
      })
    },
    getPreClassifyList() {
      getPreClassifyList({
        video_id: this.video_id,
        page: 1,
        per_page: 10
      }).then(response => {
        this.preClassifyList = response.data
      })
    },
    playVideo(item) {
      const videoDom = this.$refs.video
      var fun = function() {
        if (videoDom.currentTime >= item[1]) {
          videoDom.pause()
          videoDom.removeEventListener('timeupdate', fun)
        }
      }
      videoDom.currentTime = item[0]
      videoDom.addEventListener('timeupdate', fun)
      videoDom.play()
    },
    onSubmit() {
      this.$message('submit!')
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    },
    handleClick(tab) {
      this.part = this.result[tab.index].part
      this.url = process.env.VUE_APP_BASE_API + this.result[tab.index].reid_img
    },
    savePart() {
      console.log(this.result)
    },
    keyPeople() {
      this.$router.push('/video/step3?video_id=' + this.video_id + '&task_id=' + this.task_id)
      // keyPeople({
      //   task_id: this.task_id,
      //   video_id: this.video_id
      // }).then(response => {
      //   console.log(response)
      //   this.$router.push('/video/step2?video_id=' + this.video_id + '&task_id=' + this.task_id)
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
.line{
  text-align: center;
}
.el-row{
  margin-bottom: 5px;
}
.el-icon-video-play{
  font-size: 20px;
  line-height: 28px;
  color: #409EFF;
  cursor: pointer;
}
.loading-div{
  text-align: center;
  margin-top: 50px;
  font-size: 25px;
  color: #E6A23C;
  .el-icon-loading{
    margin-bottom: 10px;
  }
}
.warning-div{
  text-align: center;
  margin-top: 50px;
  font-size: 25px;
  color: #F56C6C;
  .el-icon-warning-outline{
    margin-bottom: 10px;
  }
}
.action-buttons{
  .el-button{
    width: 100%;
  }
}
</style>

