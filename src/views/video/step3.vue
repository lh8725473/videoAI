<template>
  <div class="app-container">
    <el-button size="medium" type="primary" style="position:absolute;right: 120px;top: 20px; z-index: 2;" @click="keyframeSave()">保存关键帧</el-button>
    <el-button size="medium" type="primary" style="position:absolute;right: 25px;top: 20px; z-index: 2;" @click="nextStep()">下一步</el-button>
    <el-tabs v-model="activePeoplePeopleNumber" type="card" @tab-click="peopleChange">
      <el-tab-pane v-for="people in peoples" :key="people.reid + ''" :label="'人物ID:' + people.reid" :name="people.reid + ''" />
    </el-tabs>
    <el-collapse v-model="activePart" @change="partChange">
      <el-collapse-item v-for="part in parts" :key="part.id" :name="part.id">
        <template slot="title">
          {{ part.name }} (已经选取关键帧，共{{ part.key_frame.length }}张)
        </template>
        <div class="key_frame">
          <draggable
            v-model="part.key_frame"
            :group="{ name: 'people'}"
            ghost-class="ghost"
          >
            <div v-for="(img, index) in part.key_frame" :key="img.frame_index" class="block">
              <i class="el-icon-circle-close" @click="deleteImg(part.key_frame, index)" />
              <el-image
                style="width: 200px; height: 200px"
                :src="img.frame_path"
                fit="contain"
                @click="previewFrame(img, part)"
              />
              <span class="demonstration">帧号：{{ img.frame_index }}</span>
            </div>
          </draggable>
        </div>

        <div class="previewParts">
          <el-row v-show="part.previewParts.length > 0">
            关键帧附近帧
          </el-row>
          <draggable
            v-model="part.previewParts"
            :group="{ name: 'people', put: false }"
            ghost-class="ghost"
          >
            <div v-for="img in part.previewParts" :key="img.frame_index" class="block">
              <el-image
                style="width: 200px; height: 200px"
                :src="img.frame_path"
                fit="contain"
              />
              <span class="demonstration">帧号：{{ img.frame_index }}</span>
            </div>
          </draggable>
        </div>

        <!-- <el-tabs v-model="part.activeImg">
          <el-tab-pane v-for="imgDetail in part.imgDetails" :key="imgDetail.frame_index" :label="'人物关键帧:' + imgDetail.frame_index" :name="imgDetail.frame_index">
            <el-row>
              <el-col :span="12">
                <el-image
                  style="width: 100%; height: 300px"
                  :src="baseAPI + imgDetail.frame_path"
                  fit="contain"
                  @click="addImg(imgDetail, part)"
                />
              </el-col>
              <el-col :span="12">
                <el-tabs v-model="stringdsad" type="card">
                  <el-tab-pane label="人物重心" name="人物重心">
                    人物重心坐标：{{ imgDetail.gravity_center }}
                  </el-tab-pane>
                  <el-tab-pane label="人物关节点/距离" name="人物关节点/距离">
                    <el-row>
                      <el-col :span="5">描述</el-col>
                      <el-col :offset="1" :span="5">距离(px)</el-col>
                      <el-col :offset="1" :span="5">阈值(±0.5)
                        <el-tooltip class="item" effect="dark" content="长度的阈值是一个比值，表示允许的变更后长度与初始长度的差值与初始长度的比值，可选±0.5" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                      <el-col :offset="1" :span="5">权重(0-1)
                        <el-tooltip class="item" effect="dark" content="权重 0-1" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                    </el-row>
                    <el-row v-for="(item, index) in imgDetail.inclination" :key="index">
                      <el-col :span="5">
                        <el-input v-model="item.describe" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="5">
                        <el-input v-model="item.value" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="5">
                        <el-input v-model="item.threshold" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="5">
                        <el-input v-model="item.weight" size="mini" />
                      </el-col>
                    </el-row>
                  </el-tab-pane>
                  <el-tab-pane label="人物关节点/角度" name="人物关节点/角度">
                    <el-row>
                      <el-col :span="5">描述</el-col>
                      <el-col :offset="1" :span="5">角度(度数)</el-col>
                      <el-col :offset="1" :span="5">阈值(±60°)
                        <el-tooltip class="item" effect="dark" content="角度阈值±60°内可选" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                      <el-col :offset="1" :span="5">权重(0-1)
                        <el-tooltip class="item" effect="dark" content="权重 0-1" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                    </el-row>
                    <el-row v-for="(item, index) in imgDetail.vertical" :key="index">
                      <el-col :span="5">
                        <el-input v-model="item.describe" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="5">
                        <el-input v-model="item.value" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="5">
                        <el-input v-model="item.threshold" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="5">
                        <el-input v-model="item.weight" size="mini" />
                      </el-col>
                    </el-row>
                  </el-tab-pane>
                  <el-tab-pane label="人与静止物体距离" name="人与静止物体距离">
                    <el-row>
                      <el-col :span="5">描述</el-col>
                      <el-col :offset="1" :span="5">距离(px)</el-col>
                      <el-col :offset="1" :span="5">阈值(±0.5)
                        <el-tooltip class="item" effect="dark" content="长度的阈值是一个比值，表示允许的变更后长度与初始长度的差值与初始长度的比值，可选±0.5" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                      <el-col :offset="1" :span="5">权重(0-1)
                        <el-tooltip class="item" effect="dark" content="权重 0-1" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                    </el-row>
                    <el-row v-for="(item, index) in imgDetail.ob" :key="index">
                      <el-col :span="5">
                        <el-input v-model="item.describe" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="5">
                        <el-input v-model="item.value" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="5">
                        <el-input v-model="item.threshold" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="5">
                        <el-input v-model="item.weight" size="mini" />
                      </el-col>
                    </el-row>
                  </el-tab-pane>
                </el-tabs>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs> -->
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { Sortable, Swap } from 'sortablejs/modular/sortable.core.esm'
import { getKeyFrames, getImageFeature, createTemplate, keyframeSave } from '@/api/video'
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
      activePart: []
    }
  },
  created() {
    this.video_id = this.$route.query.video_id
    this.task_id = this.$route.query.task_id
    console.log(this.peoples)
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
      console.log(part)
      part.previewParts.push(data.data)
    })
    // this.$socket.on('key_frame_response', (res) => {
    //   console.log(res)
    //   if (res.code === 0) {
    //     console.log(res)
    //   } else {
    //     this.$message.error(res.message)
    //   }
    // })
  },
  beforeDestroy() {
    this.$socket.removeListener('key_frame_response')
    this.$socket.removeListener('preview_key_frame')
  },
  methods: {
    getKeyFrames() {
      getKeyFrames({
        video_id: this.video_id,
        task_id: this.task_id
      }).then(response => {
        _.forEach(response.data.peoples, (people) => {
          _.forEach(people.data, (partInfo) => {
            partInfo.previewParts = []
          })
        })
        this.peoples = response.data.peoples
        this.activePeople = this.peoples[0]
        this.activePeoplePeopleNumber = this.peoples[0].reid + ''
        // _.forEach(this.peoples, (people) => {
        //   _.forEach(people.data, (partInfo) => {
        //     this.$set(partInfo, 'previewParts', [])
        //   })
        // })
        this.parts = this.peoples[0].data
        console.log(this.peoples)
      })
    },
    deleteImg(part, index) {
      part.splice(index, 1)
    },
    previewFrame(img, part) {
      console.log(img.frame_index)
      this.$socket.emit('preview_frame', {
        start_frame_index: img.frame_index - 10,
        end_frame_index: img.frame_index + 10,
        video_id: this.video_id
      })
      this.cruPartId = part.id
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
        console.log(response)
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
#partimgs{
  padding-top: 10px;
}
.block{
  position: relative;
  text-align: center;
  display: inline-block;
  width: 200px;
  box-sizing: border-box;
  margin-right: 10px;
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
</style>

