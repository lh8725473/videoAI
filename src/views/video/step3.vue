<template>
  <div class="app-container">
    <el-image
      ref="elImage"
      style="width: 0; height: 0"
      :src="srcUrl"
      :preview-src-list="srcList"
    />
    <el-button size="medium" type="primary" style="position:absolute;right: 245px;top: 20px; z-index: 2;" @click="getKeyFrames(0)">还原系统结果</el-button>
    <el-button size="medium" type="primary" style="position:absolute;right: 120px;top: 20px; z-index: 2;" @click="keyframeSave()">保存关键帧</el-button>
    <el-button size="medium" type="primary" style="position:absolute;right: 25px;top: 20px; z-index: 2;" @click="nextStep()">下一步</el-button>
    <el-tabs v-model="activePeoplePeopleNumber" type="card" @tab-click="peopleChange">
      <el-tab-pane v-for="people in peoples" :key="people.reid + ''" :label="'人物ID:' + people.reid" :name="people.reid + ''" />
    </el-tabs>
    <el-collapse v-model="activePart" @change="partChange">
      <el-collapse-item v-for="part in parts" :key="part.id" :name="part.id">
        <template slot="title">
          {{ part.name }} (已经选取关键帧，共{{ part.key_frame.length }}张)
          <span class="frame-range">帧数范围: {{ part.start_frame_index }}至{{ part.end_frame_index }}</span>
          <el-tooltip class="item" effect="dark" content="预览关键帧" placement="top">
            <i class="el-icon-picture" @click.stop="previewKeyFrame(part.key_frame)" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="预览原视频" placement="top">
            <i class="el-icon-video-play" @click.stop="previewVideo(part)" />
          </el-tooltip>
        </template>
        <div class="key_frame">
          <draggable
            v-model="part.key_frame"
            :group="{ name: 'people'}"
            ghost-class="ghost"
          >
            <div v-for="(img, index) in part.key_frame" :key="img.frame_index" class="block" :class="{'cru-frame-index': img.frame_index === part.cruframe_index}">
              <i class="el-icon-circle-close" @click="deleteImg(part.key_frame, index)" />
              <el-image
                style="width: 198px; height: 200px"
                :src="img.full_frame_path"
                fit="contain"
                @click="previewFrame(img, part)"
              />
              <span class="demonstration">
                帧号：{{ img.frame_index }}
                <i class="el-icon-edit" @click.stop="editFrameDesc(img, part)" />
                <el-tooltip class="item" effect="dark" :content="img.key_frame_desc" placement="top">
                  <i v-show="img.key_frame_desc" class="el-icon-question" />
                </el-tooltip>
              </span>
            </div>
          </draggable>
        </div>

        <div class="previewParts">
          <el-row v-show="part.previewParts.length > 0">
            <span class="el-pagination__jump">
              当前
              <div class="el-input el-pagination__editor is-in-pagination"><el-input v-model="part.cruframe_index" @keyup.enter.native="previewPartsChange(part)" /></div>
              帧
            </span>(前后各10帧)
            <el-button-group>
              <el-button size="mini" type="primary" icon="el-icon-arrow-left" @click="previewPartsChange(part, -2)">上一页</el-button>
              <el-button size="mini" type="primary" @click="previewPartsChange(part, 2)">下一页<i class="el-icon-arrow-right el-icon--right" /></el-button>
            </el-button-group>
          </el-row>
          <draggable
            v-model="part.previewParts"
            :group="{ name: 'people', put: false }"
            ghost-class="ghost"
          >
            <div v-for="img in part.previewParts" :key="img.frame_index" class="block" :class="{'cru-frame-index': img.frame_index === part.cruframe_index}">
              <el-image
                style="width: 198px; height: 200px"
                :src="img.frame_path"
                fit="contain"
              />
              <span class="demonstration">帧号：{{ img.frame_index }}</span>
            </div>
          </draggable>
        </div>
      </el-collapse-item>
    </el-collapse>

    <el-dialog :title="dialogFormtitle" :visible.sync="dialogFormVisible">
      <el-form :model="frameDesForm">
        <el-form-item label="关键帧描述">
          <el-input v-model="frameDesForm.key_frame_desc" type="textarea" :autosize="{ minRows: 3, maxRows: 5}" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateKeyframeDesc()">确 定</el-button>
      </div>
    </el-dialog>

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
import { Sortable, Swap } from 'sortablejs/modular/sortable.core.esm'
import { getKeyFrames, getImageFeature, createTemplate, keyframeSave, getVideoInfo, updateKeyframeDesc } from '@/api/video'
import { fabric } from 'fabric'
import draggable from 'vuedraggable'
import _ from 'lodash'
// const { fabric } = require('fabric')

export default {
  components: {
    draggable
  },
  filters: {

  },
  data() {
    return {
      stringdsad: '人物重心',
      srcUrl: '',
      srcList: [],
      baseAPI: process.env.VUE_APP_BASE_API,
      canvasWidth: 300,
      peoples: [],
      parts: [],
      result: [],
      cruPartId: '',
      activePeople: {},
      activePeoplePeopleNumber: '',
      taskInfo: {},
      videoInfo: {},
      url: '',
      preClassifyList: [],
      formInline: {
        curFrameIndex: 1,
        step: 1
      },
      activePart: [],
      drawer: false,
      currentFrameIndex: 0,
      dialogFormVisible: false,
      dialogFormtitle: '关键帧说明',
      frameDesForm: {
        key_frame_desc: ''
      }
    }
  },
  created() {
    this.video_id = this.$route.query.video_id
    this.task_id = this.$route.query.task_id
    this.getVideoInfo()
    this.getKeyFrames()
    let people = {}
    let part = {}
    this.peoples = []
    this.$socket.on('key_frame_response', (res) => {
      people = _.find(this.peoples, { reid: res.data.reid })
      part = _.find(people.data, { id: res.data.id })
      part.key_frame = res.data.key_frame
    })
  },
  mounted() {
    this.$socket.on('preview_key_frame', (data) => {
      const part = _.find(this.parts, { id: this.cruPartId })
      data.data.full_frame_path = data.data.frame_path
      part.previewParts.push(data.data)
    })
  },
  beforeDestroy() {
    this.$socket.removeListener('key_frame_response')
    this.$socket.removeListener('preview_key_frame')
  },
  methods: {
    getVideoInfo() {
      getVideoInfo({
        video_id: this.video_id
      }).then(response => {
        this.videoInfo = response.data
      })
    },
    getKeyFrames(operation_type) {
      getKeyFrames({
        video_id: this.video_id,
        task_id: this.task_id,
        operation_type: operation_type
      }).then(response => {
        _.forEach(response.data.peoples, (people) => {
          _.forEach(people.data, (partInfo) => {
            partInfo.previewParts = []
            partInfo.cruframe_index = 0
          })
        })
        this.peoples = response.data.peoples
        this.activePeople = this.peoples[0]
        this.activePeoplePeopleNumber = this.peoples[0].reid + ''
        this.parts = this.peoples[0].data
        console.log(this.peoples)
      })
    },
    deleteImg(part, index) {
      part.splice(index, 1)
    },
    previewFrame(img, part) {
      this.$socket.emit('preview_frame', {
        start_frame_index: img.frame_index - 10,
        end_frame_index: img.frame_index + 10,
        video_id: this.video_id
      })
      this.cruPartId = part.id
      part.cruframe_index = img.frame_index
      const cruPart = _.find(this.parts, { id: this.cruPartId })
      cruPart.previewParts = []
    },
    peopleChange(tab) {
      this.activePeople = this.peoples[tab.index]
      console.log(tab)
    },
    partChange(part) {
      console.log(part)
    },
    addImg(img, part) {
      getImageFeature({
        video_id: this.video_id,
        task_id: this.task_id,
        frame_id: img.frame_index
      }).then(response => {
        if (!_.find(part.imgDetails, { frame_index: img.frame_index })) {
          part.imgDetails.push(response.data)
          part.activeImg = img.frame_index
        }
      })
    },
    saveDom(part) {
      this.$prompt('请输入模板名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        const postPart = _.clone(part)
        postPart.templateName = value
        postPart.partFrames = postPart.partFrames.split(',')
        postPart.reId = this.activePeoplePeopleNumber + ''
        createTemplate({
          task_id: this.task_id,
          video_id: this.video_id,
          type: '1',
          data: postPart
        }).then(response => {
          if (response.code === 0) {
            this.$message('模板保存成功')
          }
        })
      }).catch(() => {

      })
    },
    keyframeSave() {
      keyframeSave({
        task_id: this.task_id,
        video_id: this.video_id,
        peoples: this.peoples
      }).then(response => {
        if (response.code === 0) {
          this.$message('保存关键帧成功')
        }
      })
    },
    nextStep() {
      createTemplate({
        task_id: this.task_id,
        video_id: this.video_id
      }).then(response => {
        if (response.code === 0) {
          this.$message('模板生成成功')
          this.$router.push('/video/step4?video_id=' + this.video_id + '&task_id=' + this.task_id)
        }
      })
    },
    previewPartsChange(part, num) {
      if (num) {
        part.cruframe_index = part.cruframe_index + num * 10
      }
      part.cruframe_index = parseInt(part.cruframe_index)
      this.$socket.emit('preview_frame', {
        start_frame_index: parseInt(part.cruframe_index) - 10,
        end_frame_index: parseInt(part.cruframe_index) + 10,
        video_id: this.video_id
      })
      this.cruPartId = part.id
      const cruPart = _.find(this.parts, { id: this.cruPartId })
      cruPart.previewParts = []
    },
    previewKeyFrame(key_frame_list) {
      console.log(key_frame_list)
      this.srcList = []
      this.srcUrl = key_frame_list[0].full_frame_path
      _.forEach(key_frame_list, (key_frame) => {
        this.srcList.push(key_frame.full_frame_path)
      })
      console.log(this.srcList)
      this.$refs.elImage.showViewer = true
    },
    previewVideo(part) {
      this.drawer = true
      this.$nextTick(() => {
        const videoDom = this.$refs.video
        const start = part.start_time
        const end = part.end_time
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
    },
    editFrameDesc(frame, part) {
      this.editDescCurFrame = frame
      this.dialogFormtitle = frame.frame_index + '帧说明'
      this.dialogFormVisible = true
      this.frameDesForm.key_frame_desc = frame.key_frame_desc
    },
    updateKeyframeDesc() {
      updateKeyframeDesc({
        video_id: this.video_id,
        task_id: this.task_id,
        frame_index: this.editDescCurFrame.frame_index,
        desc: this.frameDesForm.key_frame_desc
      }).then(response => {
        this.dialogFormVisible = false
        this.editDescCurFrame.key_frame_desc = this.frameDesForm.key_frame_desc
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-icon-edit{
  cursor: pointer;
  &:hover{
    color: #409EFF;
  }
}
.el-icon-question{
  cursor: pointer;
  &:hover{
    color: #409EFF;
  }
}
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
.frame-range{
  margin-left: 10px;
}
.el-icon-picture{
  margin-left: 10px;
  font-size: 20px;
  color: #409EFF;
}
.el-icon-video-play{
  margin-left: 10px;
  font-size: 20px;
  color: #409EFF;
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
#partimgs{
  padding-top: 10px;
}
.block{
  position: relative;
  text-align: center;
  display: inline-block;
  width: 200px;
  box-sizing: border-box;
  margin-right: 20px;
  .el-icon-circle-close{
    position: absolute;
    right: -12px;
    font-size: 25px;
    top: -10px;
    z-index: 2;
    cursor: pointer;
  }
  .el-image{
    background-color: #f2f6fc;
  }
  &.cru-frame-index{
    border: 1px solid #409EFF;
  }
}
.el-image{
  cursor: pointer;
}
.el-collapse-item__content{
  padding-top: 25px;
}
.key_frame{
  padding-top: 10px;
}
.previewParts{
  margin-top: 10px;
  .el-button-group{
    margin-left: 15px;
  }
  .el-pagination__jump{
    margin-left: 10px;
  }
}
</style>

