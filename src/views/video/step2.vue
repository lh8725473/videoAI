<template>
  <div class="app-container step2">
    <el-row>
      <el-col :span="12" class="current-frame-index-div">
        <div class="current-frame-index"> 当前帧数: {{ currentFrameIndex }}</div>
        <video ref="video" width="100%" height="480" :src="baseAPI + videoInfo.path" controls="controls">
          your browser does not support the video tag
        </video>
      </el-col>
      <el-col v-show="taskInfo.status === '2'" :offset="1" :span="11">
        <el-button v-show="!isEdit" size="small" type="primary" style="position:absolute;right: 0;top: 2px; z-index: 2;" @click="isEdit = true">编 辑</el-button>
        <el-button v-show="!isEdit" size="small" type="primary" style="position:absolute;right: 66px;top: 2px; z-index: 2;" @click="getPreClassify()">重 置</el-button>
        <el-button v-show="!isEdit" size="small" type="primary" style="position:absolute;right: 132px;top: 2px; z-index: 2;" @click="getPreClassify(0)">还原系统结果</el-button>
        <el-button v-show="isEdit" size="small" type="primary" style="position:absolute;right: 0px;top: 2px; z-index: 2;" @click="savePart()">完 成</el-button>
        <el-button v-show="isEdit" size="small" type="primary" style="position:absolute;right: 66px;top: 2px; z-index: 2;" :disabled="btnsDis.delete" @click="deletePart()">删 除</el-button>
        <el-button v-show="isEdit" size="small" type="primary" style="position:absolute;right: 132px;top: 2px; z-index: 2;" :disabled="btnsDis.merge" @click="mergePart()">合 并</el-button>
        <el-button v-show="isEdit" size="small" type="primary" style="position:absolute;right: 198px;top: 2px; z-index: 2;" @click="addPart()">增 加</el-button>
        <el-tabs v-model="activePeople" type="card" @tab-click="handleClick">
          <el-tab-pane v-for="(item, index) in result" :key="index" :label="'人物ID:' + item.people_number" :name="item.people_number + ''" />
        </el-tabs>
        <el-row>
          <el-col :span="6">动作名</el-col>
          <el-col :offset="1" :span="3">开始帧</el-col>
          <el-col :offset="1" :span="3">结束帧</el-col>
          <el-col :offset="1" :span="7">时间段(秒)</el-col>
        </el-row>
        <draggable
          v-model="part.key_frame"
          :group="{ name: 'people'}"
          ghost-class="ghost"
          handle=".el-icon-sort"
        >
          <el-row v-for="(item, index) in part" :key="index">
            <el-col v-show="isEdit" :span="6">
              <el-col :span="8" style="line-height: 28px;">
                <i class="el-icon-sort" />
                <el-checkbox v-model="item.checked" @change="checkedChange" />
              </el-col>
              <el-col :span="16">
                <el-input v-model="item.name" size="mini" />
              </el-col>
            </el-col>
            <el-col v-show="!isEdit" :span="6">
              <el-input v-model="item.name" size="mini" disabled />
            </el-col>
            <el-col :offset="1" :span="3">
              <el-input v-model="item.start_frame_index" size="mini" :disabled="!isEdit" />
            </el-col>
            <el-col :offset="1" :span="3">
              <el-input v-model="item.end_frame_index" size="mini" :disabled="!isEdit" />
            </el-col>
            <el-col :offset="1" :span="7" style="line-height: 28px;">
              {{ item.start_time | timeFilter(item, fps) }}
            </el-col>
            <el-col :offset="1" :span="1">
              <i v-show="!item.play" class="el-icon-video-play" @click="playVideo(item)" />
              <i v-show="item.play" class="el-icon-video-pause" @click="pauseVideo(item)" />
            </el-col>
          </el-row>
        </draggable>
        <el-image
          style="width: 200px; height: 200px"
          :src="url"
          fit="contain"
        />
        <el-row class="action-buttons">
          <el-col :span="10"><el-button size="small" type="primary" @click="keyPeople()">下一步</el-button></el-col>
        </el-row>
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
      <el-table-column label="动作名">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="开始帧" width="100">
        <template slot-scope="scope">
          {{ scope.row.start_frame_index }}
        </template>
      </el-table-column>
      <el-table-column label="结束帧" width="100">
        <template slot-scope="scope">
          {{ scope.row.end_frame_index }}
        </template>
      </el-table-column>
      <el-table-column label="人物ID" width="100">
        <template slot-scope="scope">
          {{ scope.row.reid }}
        </template>
      </el-table-column>
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
    </el-table>
  </div>
</template>

<script>
import { getPreClassify, getPreClassifyList, getVideoInfo, keyPeople, savePreClassify, keyFrames } from '@/api/video'
import _ from 'lodash'
import draggable from 'vuedraggable'

export default {
  components: {
    draggable
  },
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
    },
    timeFilter(start_time, item, fps) {
      if (item.start_frame_index === 1) {
        return 0 + '至' + (item.end_frame_index / fps).toFixed(2) + '(共' + (item.end_frame_index / fps - 0).toFixed(2) + ')'
      } else {
        const srartString = item.start_frame_index === 1 ? 0 : (item.start_frame_index / fps).toFixed(2)
        return srartString + '至' + (item.end_frame_index / fps).toFixed(2) + '(共' + (item.end_frame_index / fps - item.start_frame_index / fps).toFixed(2) + ')'
      }
    }
  },
  data() {
    return {
      baseAPI: process.env.VUE_APP_BASE_API,
      isEdit: false,
      form: {

      },
      result: [],
      part: [],
      activePeople: '',
      taskInfo: {},
      nbFrames: 0,
      fps: 0,
      videoInfo: {},
      preClassifyList: [],
      url: '',
      btnsDis: {
        delete: true,
        merge: true
      },
      currentFrameIndex: 1
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
        if (this.result.length > 0) {
          this.activePeople = this.result[0].people_number + ''
          this.part = this.result[0].part
          _.forEach(this.part, (item) => {
            this.$set(item, 'checked', false)
            this.$set(item, 'play', false)
          })
          this.url = process.env.VUE_APP_BASE_API + this.result[0].reid_img
        }

        this.taskInfo = data.data
        this.nbFrames = this.taskInfo.nb_frames
        this.fps = this.taskInfo.fps
      }
    })
  },
  mounted() {
    const videoDom = this.$refs.video
    var fun = () => {
      this.currentFrameIndex = (videoDom.currentTime * this.fps).toFixed(0)
    }
    videoDom.addEventListener('timeupdate', fun)
  },
  methods: {
    getVideoInfo() {
      getVideoInfo({
        video_id: this.video_id
      }).then(response => {
        this.videoInfo = response.data
      })
    },
    getPreClassify(operation_type) {
      getPreClassify({
        video_id: this.video_id,
        task_id: this.task_id,
        operation_type: operation_type
      }).then(response => {
        this.result = response.data.data
        if (this.result.length > 0) {
          this.activePeople = this.result[0].people_number + ''
          this.part = this.result[0].part
          _.forEach(this.part, (item) => {
            this.$set(item, 'checked', false)
            this.$set(item, 'play', false)
          })
          this.url = process.env.VUE_APP_BASE_API + this.result[0].reid_img
        }

        this.taskInfo = response.data
        this.nbFrames = this.taskInfo.nb_frames
        this.fps = this.taskInfo.fps
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
      item.play = true
      const videoDom = this.$refs.video
      const start = (item.start_frame_index / this.fps)
      const end = (item.end_frame_index / this.fps)
      var fun = () => {
        if (videoDom.currentTime >= end) {
          console.log('videoDom.pause()')
          videoDom.pause()
          item.play = false
          videoDom.removeEventListener('timeupdate', fun)
        }
      }
      videoDom.currentTime = start
      videoDom.addEventListener('timeupdate', fun)
      videoDom.play()
    },
    pauseVideo(item) {
      item.play = false
      const videoDom = this.$refs.video
      videoDom.pause()
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
      _.forEach(this.part, (item) => {
        this.$set(item, 'checked', false)
      })
      this.url = process.env.VUE_APP_BASE_API + this.result[tab.index].reid_img
    },
    savePart() {
      savePreClassify(this.taskInfo).then(response => {
        if (response.code === 0) {
          this.$message('保存成功')
          this.isEdit = false
        }
      })
    },
    keyPeople() {
      keyFrames({
        task_id: this.task_id,
        video_id: this.video_id
      }).then(response => {
        this.$router.push('/video/step3?video_id=' + this.video_id + '&task_id=' + this.task_id)
      })
    },
    addPart() {
      this.part.push({
        id: (new Date()).getTime(),
        name: '',
        start_frame_index: '',
        end_frame_index: '',
        start_time: 0,
        end_time: 0,
        checked: false,
        play: false
      })
      this.taskInfo.data[0].part = this.part
    },
    deletePart() {
      this.part = this.part.filter((item) => {
        return !item.checked
      })
      this.taskInfo.data[0].part = this.part
    },
    mergePart() {
      const mergePart = _.filter(this.part, (item) => {
        return item.checked
      })
      mergePart[0].end_frame_index = mergePart[1].end_frame_index
      console.log(mergePart)
      this.part = this.part.filter((item) => {
        return item.id !== mergePart[1].id
      })
      this.taskInfo.data[0].part = this.part
    },
    checkedChange() {
      console.log(_.filter(this.part, { 'checked': true }).length)
      this.btnsDis.delete = !(_.filter(this.part, { 'checked': true }).length > 0)
      this.btnsDis.merge = !(_.filter(this.part, { 'checked': true }).length > 1)
    }
  }
}
</script>

<style lang="scss">
.step2{
  .current-frame-index-div{
    position: relative;
    background-color: #333333;
  }
  .current-frame-index{
    font-size: 20px;
    color: #F56C6C;
    position: absolute;
    right: 10px;
    top: 10px;
  }
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
  .el-icon-video-pause{
    font-size: 20px;
    line-height: 28px;
    color: #F56C6C;
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
  .el-input.is-disabled .el-input__inner{
    color: #606266;
  }
  .el-icon-sort{
    cursor: pointer;
  }
}
</style>

