<template>
  <div class="app-container">
    <el-tabs v-model="activePeoplePeopleNumber" type="card" @tab-click="peopleChange">
      <el-tab-pane v-for="people in peoples" :key="people.reid + ''" :label="'人物ID:' + people.reid" :name="people.reid + ''" />
    </el-tabs>
    <el-collapse v-model="activePart" @change="partChange">
      <el-collapse-item v-for="part in parts" :key="part.id" :title="part.name + '(共' + part.key_frame.length + '张)'" :name="part.id">
        <template slot="title">
          {{ part.name }} (共{{ part.key_frame.length }}张)
          <el-button type="primary" size="mini" style="margin-left: 20px" @click.stop="saveDom(part)">保存片段</el-button>
        </template>
        <div id="partimgs">
          <div v-for="img in part.key_frame" :key="img.frame_index" class="block">
            <el-image
              style="width: 200px; height: 200px"
              :src="baseAPI + img.frame_path"
              fit="contain"
              @click="addImg(img, part)"
            />
            <span class="demonstration">帧号：{{ img.frame_index }}</span>
          </div>
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
import { getKeyFrames, getImageFeature, createTemplate, getTemplate } from '@/api/video'
// import { fabric } from 'fabric'
import _ from 'lodash'
// const { fabric } = require('fabric')

export default {
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
      part: [],
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
    this.getTemplate()
    this.$socket.on('key_frame_response', (res) => {
      const people = _.find(this.peoples, { people_number: res.data.reid })
      console.log(people)
      const part = _.find(people.parts, { partFrames: res.data.part.toString() })
      _.forEach(res.data.key_frmae, (img) => {
        part.imgs.push(img)
        // this.$set(part.imgs, part.imgs.length + 1, img)
      })
      // part.imgs = _.concat(part.imgs, res.data.key_frmae)
    })
  },
  mounted() {
    // this.$socket.on('key_frame_response', (res) => {
    //   console.log(res)
    //   if (res.code === 0) {
    //     console.log(res)
    //   } else {
    //     this.$message.error(res.message)
    //   }
    // })
  },
  methods: {
    getTemplate() {
      getTemplate({
        video_id: this.video_id,
        task_id: this.task_id
      }).then(response => {
        _.forEach(response.data.peoples, (people) => {
          _.forEach(people.data, (part) => {
            part.templateDetail = []
            _.forEach(part.key_frame, (frame) => {
              part.templateDetail.push(frame.template)
            })
          })
        })
        this.peoples = response.data.peoples
        this.activePeople = this.peoples[0]
        this.activePeoplePeopleNumber = this.peoples[0].reid + ''
        this.parts = this.peoples[0].data
      })
    },
    peopleChange(tab) {
      this.activePeople = this.peoples[tab.index]
      console.log(tab)
    },
    partChange(part) {
      console.log(part)
    },
    addImg(img, part) {
      console.log(img)

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
        postPart.reId = this.activePeoplePeopleNumber
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
.block{
  text-align: center;
  display: inline-block;
  width: 200px;
  box-sizing: border-box;
  margin-right: 10px;
}
.el-image{
  cursor: pointer;
}
</style>

