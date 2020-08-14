<template>
  <div class="app-container">
    <el-row>
      <el-col ref="canvasDiv" :span="16" style="height: 480px;">
        <!-- <canvas id="video" :width="canvasWidth" height="480" /> -->
      </el-col>
      <el-col :offset="1" :span="6">
        <el-tabs v-model="activePeople" type="card" @tab-click="handleClick">
          <el-tab-pane v-for="(item, index) in result" :key="index" :label="item.reid + ''" :name="item.reid + ''" />
        </el-tabs>
        <el-row>
          <el-col :span="10">
            人物ID:
          </el-col>
          <el-col :offset="1" :span="10">
            {{ part.reid }}
          </el-col>
          <el-col :offset="1" :span="2">
            <i v-show="btnStatus === 0" class="el-icon-video-play" @click="playVideo()" />
            <i v-show="btnStatus === 1" class="el-icon-video-pause" @click="pauseVideo()" />
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8" class="reid-name" style="line-height: 36px;">
            模板名称:
          </el-col>
          <el-col :offset="1" :span="12">
            <el-input v-model="part.action_name" size="medium" />
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8" class="reid-name" style="line-height: 36px;">
            人物别名:
          </el-col>
          <el-col :offset="1" :span="12">
            <el-input v-model="part.another_name" size="medium" />
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8" style="line-height: 36px;">
            重要人物:
          </el-col>
          <el-col :offset="1" :span="12" style="line-height: 36px;">
            <el-radio-group v-model="part.status">
              <el-radio :label="'0'">是</el-radio>
              <el-radio :label="'1'">否</el-radio>
            </el-radio-group>
          </el-col>
        </el-row>
        <!-- <el-row class="action-buttons">
          <el-col :span="10"><el-button size="small" type="warning" @click="savePart()" disabled>保存片段</el-button></el-col>
          <el-col :offset="1" :span="10"><el-button size="small" type="primary" @click="keyPeople()">下一步</el-button></el-col>
        </el-row> -->
        <el-image
          style="width: 200px; height: 200px"
          :src="url"
          fit="contain"
        />
        <el-row>
          <el-col :span="24">
            <el-button size="medium" type="warning" @click="updatePeople()">保 存</el-button>
            <el-button v-show="!isEdit" size="medium" type="primary" @click="editPeopleFrame()">编 辑</el-button>
            <el-button v-show="isEdit" size="medium" type="primary" @click="isEdit = false">退出编辑</el-button>
          </el-col>
        </el-row>
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
        <el-button type="primary" @click="preClassify()">下一步</el-button>
      </el-form-item>
    </el-form>
    <el-radio-group v-show="isEdit" v-model="mot_manual.index" size="small" @change="changeMotManual">
      <el-radio v-for="(peopleFrame, index) in peopleFrameList" :key="index" :label="index" border>
        <span>TRACKER_ID:{{ peopleFrame.NO }} & RE_ID:{{ peopleFrame.NO2 }}</span>
      </el-radio>
    </el-radio-group>

    <!-- <canvas id="canvas" width="300" height="300" /> -->
  </div>
</template>

<script>
import { getKeyPeople, getPeoples, getVideoInfo, updatePeople, preClassify, keyPeopleLatestFrame, keypeopleGetFrame, keypeopleUpdateFrame, batchUpdate } from '@/api/video'
// import { fabric } from 'fabric'
import zrender from 'zrender'
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
      canvasHeight: 480,
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
      },
      playStatus: 0,
      btnStatus: 0,
      mot_manual: {},
      peopleFrameList: [],
      isEdit: false,
      curImg: null
    }
  },
  created() {
    this.video_id = this.$route.query.video_id
    this.task_id = this.$route.query.task_id
    this.getVideoInfo()
    this.getPeoples()
  },
  mounted() {
    // 设置canvasWidth
    console.log(this.$refs.canvasDiv.$el.clientWidth)
    this.canvasWidth = this.$refs.canvasDiv.$el.clientWidth
    this.imgPoolMap = new ImagePool(10)
    this.zr = zrender.init(this.$refs.canvasDiv.$el)
    // var canvasBox = document.getElementById('video').getContext('2d')
    // this.$socket.on('key_people_response', (res) => {
    //   if (res.code === 0) {
    //     this.formInline.curFrameIndex = res.data.frame_index
    //     console.log(res.data.frame_index)
    //     this.renderVideo(canvasBox, res.data)
    //   } else {
    //     this.$message.error(res.message)
    //   }
    // })
    this.$socket.on('key_people_response', (res) => {
      if (res.code === 0) {
        this.formInline.curFrameIndex = res.data.frame_index
        console.log(res.data.frame_index)
        this.renderVideo(this.zr, res.data)
      } else {
        this.$message.error(res.message)
      }
    })
    this.$socket.on('key_people_list', (res) => {
      if (res.code === 0) {
        this.result = res.data
        this.activePeople = this.result[0].reid + ''
        this.people_id = this.result[0].id + ''
        this.part = this.result[0]
        this.url = process.env.VUE_APP_BASE_API + this.result[0].reid_path
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

    this.$socket.emit('show_frame', {
      'task_id': this.task_id,
      'key_people_id': this.people_id,
      'video_id': this.video_id,
      'reid': this.activePeople,
      'frame_index': parseInt(this.formInline.curFrameIndex)
    })
  },
  methods: {
    // renderVideo(ctx, data) {
    //   const blob = new Blob([data.image], { type: 'image/jpeg' })
    //   let url = window.URL.createObjectURL(blob)

    //   let img = this.imgPoolMap.next()
    //   img.src = url
    //   img.onload = () => {
    //     ctx.drawImage(img, 0, 0, img.width, img.height)
    //     img.onload = img.onerror = null
    //     img.src = ''
    //     img = null
    //     URL.revokeObjectURL(url)
    //   }
    //   img.onerror = (err) => {
    //     console.log(err)
    //     img.onload = img.onerror = null
    //     img = null
    //     URL.revokeObjectURL(url)
    //     url = null
    //   }
    // },
    getVideoInfo() {
      getVideoInfo({
        video_id: this.video_id
      }).then(response => {
        this.videoInfo = response.data
      })
    },
    renderVideo(zr, data) {
      this.curImg = data.image
      const blob = new Blob([data.image], { type: 'image/jpeg' })
      let url = window.URL.createObjectURL(blob)
      console.log(url)

      let img = this.imgPoolMap.next()
      img.src = url
      img.onload = () => {
        var x = 0
        var y = 0
        var width = 0
        var height = 0
        if (img.width < this.canvasWidth) {
          this.canvasWidth = img.width
        }
        if (img.width > img.height) { // 款的(横着)
          x = 0
          width = this.canvasWidth
          height = width / (img.width / img.height)
          y = (480 - height) / 2
        } else { // 高的(竖着)
          height = 480
          width = height / (img.height / img.width)
          x = (this.canvasWidth - width) / 2
          y = 0
        }
        var image = new zrender.Image({
          position: [1, 1],
          scale: [1, 1],
          style: {
            x: x,
            y: y,
            image: url,
            width: width,
            height: height
          }
        })
        zr.add(image)
        var bbox = null
        if (data.pose_result) {
          bbox = data.pose_result.bbox
        } else {
          if (data.index === -1) {
            this.$message.error('当前帧未跟踪到人')
            return
          } else {
            bbox = data.pose[data.index].bbox
          }
        }
        var rectX = 0
        var rectY = 0
        var rectW = 0
        var rectH = 0
        if (img.width > img.height) {
          rectX = bbox[0] * (this.canvasWidth / img.width) + 2
          rectY = y + bbox[1] * ((this.canvasHeight - 2 * y) / img.height) + 2
          rectW = (bbox[2] - bbox[0]) * (this.canvasWidth / img.width)
          rectH = (bbox[3] - bbox[1]) * ((this.canvasHeight - 2 * y) / img.height)
        } else {
          rectX = x + bbox[0] * ((this.canvasWidth - 2 * x) / this.canvasWidth) + 2
          rectY = bbox[1] * (this.canvasHeight / img.height) + 2
          rectW = (bbox[2] - bbox[0]) * ((this.canvasWidth - 2 * x) / img.width)
          rectH = (bbox[3] - bbox[1]) * (this.canvasHeight / img.height)
        }

        var rect = new zrender.Rect({
          style: {
            fill: 'transparent',
            stroke: 'red',
            opacity: 1,
            lineWidth: 2
          },
          shape: {
            x: rectX,
            y: rectY,
            width: rectW,
            height: rectH
          }
        })
        zr.add(rect)
        setTimeout(() => {
          img.onload = img.onerror = null
          img.src = ''
          img = null
          URL.revokeObjectURL(url)
        }, 1000)
        // img.onload = img.onerror = null
        // img.src = ''
        // img = null
        // URL.revokeObjectURL(url)
      }
      img.onerror = (err) => {
        console.log(err)
        img.onload = img.onerror = null
        img = null
        URL.revokeObjectURL(url)
        url = null
      }
    },
    getPeoples() {
      getPeoples({
        video_id: this.video_id
      }).then(response => {
        this.result = response.data
        this.activePeople = this.result[0].reid + ''
        this.keyPeopleId = this.result[0].id
        this.part = this.result[0]
        this.url = process.env.VUE_APP_BASE_API + this.result[0].reid_path
        // this.taskInfo = response.data
      })
    },
    handleClick(tab) {
      this.activePeople = this.result[tab.index].reid + ''
      this.keyPeopleId = this.result[tab.index].id
      this.part = this.result[tab.index]
      this.url = process.env.VUE_APP_BASE_API + this.result[tab.index].reid_path
    },
    playVideo() {
      console.log(this.playStatus)
      this.btnStatus = 1
      if (this.playStatus === 1) {
        this.formInline.curFrameIndex = 1
      }
      this.$socket.emit('play', {
        'step': parseInt(this.formInline.step),
        'video_id': this.video_id,
        'reid': this.activePeople,
        'start_frame_index': this.formInline.curFrameIndex
      })
    },
    pauseVideo() {
      this.btnStatus = 0
      this.$socket.emit('pause', {
        task_id: this.task_id
      })
    },
    preFrameIndex() {
      if ((parseInt(this.formInline.curFrameIndex) - parseInt(this.formInline.step)) < 1) {
        return
      }
      this.formInline.curFrameIndex = parseInt(this.formInline.curFrameIndex) - parseInt(this.formInline.step)
      // this.$socket.emit('show_frame', {
      //   'task_id': this.task_id,
      //   'video_id': this.video_id,
      //   'reid': this.activePeople,
      //   'frame_index': parseInt(this.formInline.curFrameIndex)
      // })
      if (this.isEdit) {
        this.keypeopleGetFrame()
      } else {
        this.$socket.emit('show_frame', {
          'key_people_id': this.people_id,
          'video_id': this.video_id,
          'reid': this.activePeople,
          'frame_index': parseInt(this.formInline.curFrameIndex)
        })
      }
    },
    nextFrameIndex() {
      this.formInline.curFrameIndex = parseInt(this.formInline.curFrameIndex) + parseInt(this.formInline.step)
      // this.$socket.emit('show_frame', {
      //   'task_id': this.task_id,
      //   'video_id': this.video_id,
      //   'reid': this.activePeople,
      //   'frame_index': parseInt(this.formInline.curFrameIndex)
      // })
      if (this.isEdit) {
        this.keypeopleUpdateFrame()
        this.keypeopleGetFrame()
      } else {
        this.$socket.emit('show_frame', {
          'key_people_id': this.people_id,
          'task_id': this.task_id,
          'video_id': this.video_id,
          'reid': this.activePeople,
          'frame_index': parseInt(this.formInline.curFrameIndex)
        })
      }
    },
    goFrameIndex() {
      // this.$socket.emit('show_frame', {
      //   'task_id': this.task_id,
      //   'video_id': this.video_id,
      //   'reid': this.activePeople,
      //   'frame_index': parseInt(this.formInline.curFrameIndex)
      // })
      if (this.isEdit) {
        this.batchUpdate(parseInt(this.formInline.curFrameIndex))
        this.keypeopleGetFrame()
      } else {
        this.$socket.emit('show_frame', {
          'key_people_id': this.people_id,
          'task_id': this.task_id,
          'video_id': this.video_id,
          'reid': this.activePeople,
          'frame_index': parseInt(this.formInline.curFrameIndex)
        })
      }
    },
    batchUpdate(frame_index) {
      batchUpdate({
        video_id: this.video_id,
        reid: this.activePeople,
        frame_index: frame_index,
        mot_manual_id: this.keyPeopleLatestFrame.mot_manual_id
      }).then(response => {
      })
    },
    keyPeople() {
      this.$router.push('/video/step3?video_id=' + this.video_id + '&task_id=' + this.task_id)
    },
    updatePeople() {
      if (!this.part.action_name) {
        this.$message.error('模板名称不能为空')
        return
      }
      if (!this.part.another_name) {
        this.$message.error('人物别名不能为空')
        return
      }
      updatePeople(this.part).then(response => {
        if (response.code === 0) {
          this.$message('保存关键人物成功！')
        }
      })
    },
    preClassify() {
      if (this.keyPeopleLatestFrame) {
        this.batchUpdate(this.videoInfo.nb_frames)
      } else {
        keyPeopleLatestFrame({
          video_id: this.video_id,
          key_people_id: this.keyPeopleId,
          reid: this.activePeople
        }).then(response => {
          console.log(response)
          this.keyPeopleLatestFrame = response.data
          this.batchUpdate(this.videoInfo.nb_frames)
        })
      }
      updatePeople(this.part).then(response => {
        if (response.code === 0) {
          preClassify({
            video_id: this.video_id
          }).then(response => {
            console.log(response)
            if (response.code === 0) {
              this.$router.push('/video/step2?video_id=' + this.video_id + '&task_id=' + response.data.task_id)
            }
          })
        }
      })
    },
    editPeopleFrame() {
      this.isEdit = true
      keyPeopleLatestFrame({
        video_id: this.video_id,
        key_people_id: this.keyPeopleId,
        reid: this.activePeople
      }).then(response => {
        console.log(response)
        this.keyPeopleLatestFrame = response.data
        if (response.code === 0) {
          keypeopleGetFrame({
            reid: this.activePeople,
            video_id: this.video_id,
            mot_manual_id: response.data.mot_manual_id,
            frame_index: response.data.frame_index
          }).then(response => {
            if (response.code === 0) {
              this.mot_manual = response.data
              this.peopleFrameList = response.data.pose
            }
          })
        }
      })
    },
    keypeopleGetFrame() {
      keypeopleGetFrame({
        reid: this.activePeople,
        video_id: this.video_id,
        mot_manual_id: this.keyPeopleLatestFrame.mot_manual_id,
        frame_index: parseInt(this.formInline.curFrameIndex)
      }).then(response => {
        if (response.code === 0) {
          this.mot_manual = response.data
          this.peopleFrameList = response.data.pose
        }
      })
    },
    styleObject(item) {
      return {
        color: 'rgb(' + item.color[2] + ',' + item.color[1] + ',' + item.color[0] + ')'
      }
    },
    changeMotManual() {
      this.mot_manual.video_id = this.video_id
      this.mot_manual.image = this.curImg
      this.renderVideo(this.zr, this.mot_manual)
      console.log(this.mot_manual)
      keypeopleUpdateFrame(this.mot_manual)
        .then(response => {
          console.log(response)
          if (response.code === 0) {
            // this.mot_manual = response.data
            // this.peopleFrameList = response.data.pose
          }
        })
    },
    keypeopleUpdateFrame() {
      this.mot_manual.video_id = this.video_id
      this.mot_manual.image = this.curImg
      keypeopleUpdateFrame(this.mot_manual)
        .then(response => {
          console.log(response)
          if (response.code === 0) {
            // this.mot_manual = response.data
            // this.peopleFrameList = response.data.pose
          }
        })
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
  color: #303133;
}
.reid-name:before{
  content: '*';
  color: #F56C6C;
  margin-right: 1px;
}
</style>

