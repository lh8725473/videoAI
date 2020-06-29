<template>
  <div class="app-container mathResult">
    <div class="reult-info">{{ reultInfo.task_match_name }}</div>
    <el-tabs v-model="activeTemplateId" type="card" @tab-click="templateChange">
      <el-tab-pane v-for="template in templateList" :key="template.id" :label="'模板:' + template.name" :name="template.id + ''" />
    </el-tabs>
    <el-tabs v-model="activeVideoId" @tab-click="videoChange">
      <el-tab-pane v-for="video in videoList" :key="video.video_id" :label="video.video_name" :name="video.video_id + ''" />
    </el-tabs>
    <el-collapse v-model="activePart" accordion>
      <el-collapse-item v-for="part in match_result" :key="part.partFrames" :name="part.partFrames">
        <template slot="title">
          <span class="tip">动作: {{ part.template_name }}</span>
          <span class="tip">匹配结果: {{ part.status | status }}</span>
          <span class="tip">匹配率: {{ part.value * 100 }}%</span>
        </template>
        <el-row>
          <div class="scroll-warp">
            <p>模版 <i class="el-icon-video-play" @click="previewVideo(part, 'template')" /></p>
            <div v-for="img in part.template_frame_list" :key="img.frame_id" class="block">
              <el-image
                style="width: 200px; height: 200px"
                :src="baseAPI + img.frame_path"
                fit="contain"
              />
              <span class="demonstration">帧号：{{ img.frame_id }} </span>
            </div>
            <template v-for="(match_frame, index) in part.match_frame_list">
              <p>匹配{{ index + 1 }} <i class="el-icon-video-play" @click="previewVideo(match_frame, 'match')" /></p>
              <div v-for="(img, imgIndex) in match_frame.data" :key="imgIndex" class="block">
                <el-image
                  style="width: 200px; height: 200px"
                  :src="baseAPI + img.frame_path"
                  fit="contain"
                />
                <span class="demonstration">帧号：{{ img.frame_id }} </span>
                <el-row>
                  <el-col :span="12">帧间距: {{ img.frame_distance }}</el-col>
                  <el-col :span="12">帧间时间: {{ img.frame_time }}s</el-col>
                  <el-col :span="12">帧间分数: {{ img.interframe_value }}</el-col>
                  <el-col :span="12">相似率: {{ (img.match_rate * 100).toFixed(2) }}%</el-col>
                </el-row>
              </div>
            </template>

          </div>
        </el-row>
      </el-collapse-item>
    </el-collapse>

    <el-drawer
      title="预览"
      :visible.sync="drawer"
      :with-header="false"
      :modal="false"
      size="700px"
      direction="rtl"
    >
      <el-col :span="24" class="current-frame-index-div">
        <div class="current-frame-index"> 当前帧数: {{ currentFrameIndex }}</div>
        <video ref="video" width="100%" height="480" :src="baseAPI + videoInfo.path" controls="controls">
          your browser does not support the video tag
        </video>
      </el-col>
    </el-drawer>
  </div>
</template>

<script>
import { getParts, setParts } from './parts.vm'
import _ from 'lodash'
import { getMatchResult, getMatchSecond, getMatchTaskDetail } from '@/api/templates'
import { getVideoInfo } from '@/api/video'

function ImagePool(size) {
  this.size = size
  this.images = []
  this.counter = 0
}

ImagePool.prototype.next = function() {
  if (this.images.length < this.size) {
    var image = new Image()
    this.images.push(image)
    return image
  } else {
    if (this.counter >= this.size) {
      this.counter = 0
    }
    return this.images[this.counter++ % this.size]
  }
}

let loading = null

export default {
  filters: {
    status: s => {
      if (s === 0) {
        return '匹配成功'
      } else if (s === 1) {
        return '跳过'
      } else if (s === -100) {
        return '匹配失败'
      } else {
        return '匹配中'
      }
    }
  },
  data() {
    return {
      reultInfo: {},
      activeTemplateId: null,
      activeReid: null,
      templateList: [],
      templateVideoId: null,
      activeVideoId: null,
      videoList: [],
      baseAPI: process.env.VUE_APP_BASE_API,
      activePart: [],
      parts: [],
      match_result: [],
      drawer: false,
      canvasWidth: 300,
      canvasBox: null,
      paly_frame_path: null,
      curFrameIndex: 0,
      btnStatus: 0,
      videoInfo: {},
      currentFrameIndex: 1
    }
  },
  created() {
    this.task_match_id = this.$route.query.task_match_id
    this.getMatchSecond()
  },
  mounted() {
    this.imgPoolMap = new ImagePool(10)
    this.$socket.on('key_people_response', (res) => {
      if (res.code === 0) {
        this.curFrameIndex = res.data.frame_index
        this.renderVideo(this.canvasBox, res.data)
      } else {
        this.$message.error(res.message)
      }
    })
    this.$socket.on('play_msg', (res) => {
      this.playStatus = res.code
      if (res.code === 0) {
        this.task_id = res.data.task_id
      }
      if (this.playStatus === 1) {
        this.btnStatus = 0
      }
    })
    this.$socket.on('template_match', (res) => {
      console.log(res)
      if (res.task_match_status === '2') {
        console.log(loading)
        loading.close()
        this.getMatchSecond()
      }
    })
    // this.$socket.on('preview_key_frame', res => {
    //   if (res.code === 0) {
    //     this.paly_frame_path = res.data.frame_path
    //     // this.renderVideo(this.canvasBox, res.data)
    //   } else {
    //     this.$message.error(res.message)
    //   }
    // })
  },
  beforeDestroy() {
    this.$socket.removeListener('preview_key_frame')
  },
  methods: {
    getMatchSecond() {
      getMatchSecond({
        task_match_id: this.task_match_id
      }).then(response => {
        if (response.code === 0) {
          console.log(response)
          if (response.data.task_match_status !== '2') {
            loading = this.$loading({
              fullscreen: true,
              text: '匹配结果生成中...'
            })
            console.log(loading)
          } else {
            this.reultInfo = response.data
            this.templateList = this.reultInfo.match_task_detail
            this.activeTemplateId = this.templateList[0].id + ''
            this.templateVideoId = this.templateList[0].video_id
            this.activeReid = this.templateList[0].reid
            this.videoList = this.templateList[0].video_list
            this.activeVideoId = this.videoList[0].video_id + ''
            this.getVideoInfo(this.activeVideoId, 'match')
            this.getVideoInfo(this.templateVideoId, 'template')
            this.getMatchTaskDetail()
          }
        }
      })
    },
    getVideoInfo(video_id, type) {
      getVideoInfo({
        video_id: video_id
      }).then(response => {
        if (type === 'match') {
          this.matchVideoInfo = response.data
        } else {
          this.templateVideoInfo = response.data
        }
      })
    },
    templateChange(template) {
      this.activeTemplateId = this.templateList[template.index].id + ''
      this.templateVideoId = this.templateList[template.index].video_id
      this.activeReid = this.templateList[template.index].reid
      this.videoList = this.templateList[template.index].video_list
      this.activeVideoId = this.videoList[0].video_id + ''
      this.getVideoInfo(this.activeVideoId, 'match')
      this.getVideoInfo(this.templateVideoId, 'template')
      this.getMatchTaskDetail()
    },
    videoChange(video) {
      this.activeVideoId = this.videoList[video.index].video_id + ''
      this.getVideoInfo(this.activeVideoId, 'match')
      this.getMatchTaskDetail()
    },
    getMatchTaskDetail() {
      console.log('getMatchTaskDetail')
      getMatchTaskDetail({
        task_match_id: this.reultInfo.task_match_id,
        action_template_id: this.activeTemplateId,
        video_id: this.activeVideoId
      }).then(response => {
        console.log(response)
        if (response.code === 0) {
          this.match_result = response.data.match_result
        }
      })
    },
    playVideo(frameList) {
      this.drawer = true
      this.start_frame_index = _.first(frameList).frame_id
      this.end_frame_index = _.last(frameList).frame_id
      this.btnStatus = 1
      this.$nextTick(() => {
        this.canvasBox = document.getElementById('video').getContext('2d')
        this.$socket.emit('play', {
          'video_id': this.activeVideoId,
          'reid': this.activeReid,
          'start_frame_index': this.start_frame_index,
          'end_frame_index': this.end_frame_index
        })
        // this.$socket.emit('preview_frame', {
        //   'start_frame_index': _.first(frameList).frame_id,
        //   'end_frame_index': _.last(frameList).frame_id,
        //   'video_id': parseInt(this.activeVideoId)
        // })
      })
    },
    renderVideo(ctx, data) {
      const blob = new Blob([data.image], { type: 'image/jpeg' })
      let url = window.URL.createObjectURL(blob)

      let img = this.imgPoolMap.next()
      img.src = url
      img.onload = () => {
        ctx.drawImage(img, 0, 0, img.width, img.height)
        img.onload = img.onerror = null
        img.src = ''
        img = null
        URL.revokeObjectURL(url)
      }
      img.onerror = (err) => {
        console.log(err)
        img.onload = img.onerror = null
        img = null
        URL.revokeObjectURL(url)
        url = null
      }
    },
    partPlay() {
      this.btnStatus = 1
      if (this.playStatus === 1) {
        this.curFrameIndex = this.start_frame_index
      }
      this.$socket.emit('play', {
        'video_id': this.activeVideoId,
        'reid': this.activeReid,
        'start_frame_index': this.curFrameIndex,
        'end_frame_index': this.end_frame_index
      })
    },
    partPause() {
      this.btnStatus = 0
      this.$socket.emit('pause', {
        task_id: this.task_id
      })
    },
    previewVideo(part, type) {
      if (type === 'template') {
        this.videoInfo = this.templateVideoInfo
      } else {
        this.videoInfo = this.matchVideoInfo
      }
      this.drawer = true
      this.$nextTick(() => {
        const videoDom = this.$refs.video
        const start = part.template_start_time || part.start_time
        const end = part.template_end_time || part.end_time
        console.log(start)
        console.log(end)
        var fun = () => {
          this.currentFrameIndex = (videoDom.currentTime * this.videoInfo.fps).toFixed(0)
          if (videoDom.currentTime >= end) {
            videoDom.pause()
            videoDom.removeEventListener('timeupdate', fun)
          }
        }
        videoDom.currentTime = start
        videoDom.addEventListener('timeupdate', fun)
        videoDom.play()
      })
    }
  }
}
</script>

<style lang="scss">
.mathResult{
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
  .el-drawer__body{
    text-align: center;
  }
  .reult-info{
    color: #409EFF;
    font-size: 20px;
    margin-bottom: 10px;
    font-weight: bold;
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
  .block{
    text-align: center;
    display: inline-block;
    width: 200px;
    height: 270px;
    box-sizing: border-box;
    margin-right: 10px;
  }
  .el-image{
    cursor: pointer;
    background: #F5F7FA;
  }
  .tip{
    margin-right: 20px;
    padding: 0 20px 0 0;
    font-size: 14px;
  }
  .app-container {
    p {
      margin: 0;
    }
    hr{
      opacity: 0.2;
    }
  }
  .scroll-warp{
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap
  }
  .demonstration{
    display: block;
  }
}

</style>

