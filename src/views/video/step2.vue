<template>
  <div class="app-container">
    <el-row>
      <el-col ref="canvasDiv" :span="16">
        <canvas id="video" :width="canvasWidth" height="480" />
      </el-col>
      <el-col :offset="1" :span="6">
        <el-tabs v-model="activePeople" type="card" @tab-click="handleClick">
          <el-tab-pane v-for="(item, index) in result" :key="index" :label="item.people_number" :name="item.people_number" />
        </el-tabs>
        <el-row>
          <el-col :span="10">开始帧数</el-col>
          <el-col :offset="1" :span="10">结束帧数</el-col>
        </el-row>
        <el-row v-for="(item, index) in part" :key="index">
          <el-col :span="10">
            <el-input v-model="item[0]" size="mini" disabled />
          </el-col>
          <el-col :offset="1" :span="10">
            <el-input v-model="item[1]" size="mini" disabled />
          </el-col>
          <el-col :offset="1" :span="2">
            <i class="el-icon-video-play" @click="playVideo(item)" />
          </el-col>
        </el-row>
        <el-row class="action-buttons">
          <el-col :span="10"><el-button size="small" type="warning" @click="savePart()" disabled>保存片段</el-button></el-col>
          <el-col :offset="1" :span="10"><el-button size="small" type="primary" @click="keyPeople()">下一步</el-button></el-col>
        </el-row>
        <el-image
          style="width: 200px; height: 200px"
          :src="url"
          fit="contain"></el-image>
      </el-col>
    </el-row>
    <!-- <div v-for="people in peoples" :key="people.reid">
      <div>人物ID:{{ people.reid }}</div>
      <div v-for="part in people.parts" :key="part.fragment">
        <div>片段: {{ part.fragment }}</div>
        <div v-for="img in part.imgs" :key="img.frame_index">{{ img.frame_index }}</div>
      </div>
    </div> -->
    <el-form :inline="true" :model="formInline" class="demo-form-inline" size="small">
      <el-form-item label="当前帧:">
        <el-input v-model="formInline.curFrameIndex" placeholder="当前帧" />
      </el-form-item>
      <el-form-item label="帧距:">
        <el-select v-model="formInline.step" placeholder="帧距">
          <el-option label="1" value="1" />
          <el-option label="2" value="2" />
          <el-option label="5" value="5" />
          <el-option label="10" value="10" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button size="small" type="warning" @click="preFrameIndex()">上一帧</el-button>
        <el-button size="small" type="warning" @click="nextFrameIndex()">下一帧</el-button>
        <el-button type="primary" @click="goFrameIndex()">跳转当前帧</el-button>
      </el-form-item>
    </el-form>
    <!-- <canvas id="canvas" width="300" height="300" /> -->
  </div>
</template>

<script>
import { getPreClassify, getKeyPeople } from '@/api/video'
import { fabric } from 'fabric'
import _ from 'lodash'
// const { fabric } = require('fabric')

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
      canvasWidth: 300,
      peoples: [],
      result: [],
      part: [],
      activePeople: '',
      taskInfo: {},
      videoInfo: {},
      url: '',
      preClassifyList: [],
      formInline: {
        curFrameIndex: 1,
        step: 1
      }
    }
  },
  created() {
    this.video_id = this.$route.query.video_id
    this.task_id = this.$route.query.task_id
    this.getKeyPeople()
    // this.$socket.on('key_people_response', (data) => {
    //   console.log(data)
    //   const people = _.find(this.peoples, { 'reid': data.data.reid })
    //   if (people) {
    //     const fragment = _.find(people.parts, { 'fragment': data.data.part.toString() })
    //     if (fragment) {
    //       fragment.imgs.push({
    //         frame_index: data.data.frame_index,
    //         url: data.data.image,
    //         rect: data.data.pose_result.bbox
    //       })
    //     } else {
    //       people.parts.push({
    //         fragment: data.data.part.toString(),
    //         imgs: [{
    //           frame_index: data.data.frame_index,
    //           url: data.data.image,
    //           rect: data.data.pose_result.bbox
    //         }]
    //       })
    //     }
    //   } else {
    //     this.peoples.push({
    //       reid: data.data.reid,
    //       parts: []
    //     })
    //     const people = _.find(this.peoples, { 'reid': data.data.reid })
    //     people.parts.push({
    //       fragment: data.data.part.toString(),
    //       imgs: [{
    //         frame_index: data.data.frame_index,
    //         url: data.data.image,
    //         rect: data.data.pose_result.bbox
    //       }]
    //     })
    //   }
    // })
  },
  mounted() {
    // 设置canvasWidth
    console.log(this.$refs.canvasDiv.$el.clientWidth)
    this.canvasWidth = this.$refs.canvasDiv.$el.clientWidth
    this.imgPoolMap = new ImagePool(10)
    var canvasBox = document.getElementById('video').getContext('2d')
    this.$socket.on('key_people_response', (res) => {
      if (res.code === 0) {
        this.formInline.curFrameIndex = res.data.frame_index
        console.log(res.data.frame_index)
        this.renderVideo(canvasBox, res.data)
      } else {
        this.$message.error(res.message)
      }
    })
    // var canvas = new fabric.Canvas('canvas')

    // var rect = new fabric.Rect({
    //   top: 100,
    //   left: 100,
    //   width: 60,
    //   height: 70,
    //   strokeWidth: 2,
    //   stroke: '#880E4F',
    //   fill: 'rgba(255,0,0,0)',
    //   hasControls: false,
    //   // evented: false
    //   lockMovementX: true,
    //   lockMovementY: true
    // })

    // console.log(rect)
    // function objMousedown(a) {
    //   console.log(a)
    // }

    // canvas.add(rect)
    // // setTimeout(() => {
    // //   canvas.remove(rect)
    // // }, 5000)
    // rect.on({
    //   'mousedown': objMousedown
    // })

    // var mouseDownPoint = {}

    // function mouseDown(e) {
    //   console.log(e)
    //   mouseDownPoint = e.pointer
    // }
    // function mouseUp(e) {
    //   console.log(e)
    //   var tempRect = new fabric.Rect({
    //     top: mouseDownPoint.y,
    //     left: mouseDownPoint.x,
    //     width: e.pointer.x - mouseDownPoint.x,
    //     height: e.pointer.y - mouseDownPoint.y,
    //     strokeWidth: 2,
    //     stroke: '#880E4F',
    //     fill: 'rgba(255,0,0,0)'
    //   })
    //   console.log(tempRect)
    //   canvas.add(tempRect)
    // }
    // setInterval(() => {
    //   console.log(canvas.getActiveObject())
    // }, 5000)
    // // canvas.on({
    // //   'mouse:down': mouseDown,
    // //   'mouse:up': mouseUp
    // // })
  },
  methods: {
    renderVideo(ctx, data) {
      console.info(data)
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
    getKeyPeople() {
      getKeyPeople({
        video_id: this.video_id,
        task_id: this.task_id
      }).then(response => {
        console.log(response)
        this.result = response.data
        this.activePeople = this.result[0].people_number
        this.part = this.result[0].part
        this.url = process.env.VUE_APP_BASE_API + this.result[0].reid_img
        this.taskInfo = response.data
      })
    },
    handleClick(tab) {
      this.part = this.result[tab.index].part
      this.url = process.env.VUE_APP_BASE_API + this.result[tab.index].reid_img
    },
    playVideo(item) {
      this.$socket.emit('play', {
        'step': parseInt(this.formInline.step),
        'task_id': this.task_id,
        'video_id': this.video_id,
        'reid': this.activePeople,
        'part': item
      })
    },
    preFrameIndex() {
      this.formInline.curFrameIndex = parseInt(this.formInline.curFrameIndex) - parseInt(this.formInline.step)
      this.$socket.emit('show_frame', {
        'task_id': this.task_id,
        'video_id': this.video_id,
        'reid': this.activePeople,
        'frame_index': parseInt(this.formInline.curFrameIndex)
      })
    },
    nextFrameIndex() {
      this.formInline.curFrameIndex = parseInt(this.formInline.curFrameIndex) + parseInt(this.formInline.step)
      this.$socket.emit('show_frame', {
        'task_id': this.task_id,
        'video_id': this.video_id,
        'reid': this.activePeople,
        'frame_index': parseInt(this.formInline.curFrameIndex)
      })
    },
    goFrameIndex() {
      this.$socket.emit('show_frame', {
        'task_id': this.task_id,
        'video_id': this.video_id,
        'reid': this.activePeople,
        'frame_index': parseInt(this.formInline.curFrameIndex)
      })
    },
    keyPeople() {
      this.$router.push('/video/step3?video_id=' + this.video_id + '&task_id=' + this.task_id)
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
.el-input.is-disabled .el-input__inner{
  color: #303133;
}
</style>

