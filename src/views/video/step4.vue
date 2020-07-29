<template>
  <div class="app-container">
    <el-button size="medium" type="primary" style="position:absolute;right: 130px;top: 20px; z-index: 2;" @click="openVersionDesVisible()">保存模板</el-button>
    <el-button size="medium" type="primary" style="position:absolute;right: 25px;top: 20px; z-index: 2;" @click="pigeonhole()">归档模板</el-button>
    <el-tabs v-model="activePeopleNumber" type="card" @tab-click="peopleChange">
      <el-tab-pane v-for="people in peoples" :key="people.reid + ''" :label="'人物ID:' + people.reid" :name="people.reid + ''" />
    </el-tabs>
    <el-collapse v-model="activePart" @change="partChange">
      <el-collapse-item v-for="part in parts" :key="part.id" :title="part.name + '(共' + part.key_frame.length + '张)'" :name="part.id">
        <template slot="title">
          {{ part.name }} (共{{ part.key_frame.length }}张)
        </template>
        <div id="partimgs">
          <div v-for="img in part.key_frame" :key="img.frame_index" class="block">
            <el-image
              style="width: 200px; height: 200px"
              :src="img.full_frame_path"
              fit="contain"
              @click="addImg(img, part)"
            />
            <span class="demonstration">帧号：{{ img.frame_index }}</span>
          </div>
        </div>

        <el-tabs v-model="part.activeImg">
          <el-tab-pane v-for="imgDetail in part.templateDetail" :key="imgDetail.frame_index" :label="'人物关键帧:' + imgDetail.frame_index" :name="imgDetail.frame_index + ''">
            <el-row>
              <el-col :span="12">
                <el-image
                  style="width: 100%; height: 400px"
                  :src="imgDetail.full_frame_path"
                  fit="contain"
                />
                <div :ref="'canvasDiv' + imgDetail.frame_index" style="width: 100%; height: 400px" />
                <div style="text-align: center;">
                  <span>人物重心坐标:{{ imgDetail.features.gravity_center }} </span>
                  <el-button size="mini" type="primary" @click="resetData(imgDetail, part)">还原系统结果</el-button>
                </div>
                <el-row>
                  <el-col :span="8">
                    连续帧数:
                  </el-col>
                  <el-col :offset="1" :span="11">
                    <el-input v-model="imgDetail.features.constantly_frame[0]" size="mini" />
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="8">
                    最小出现帧数:
                  </el-col>
                  <el-col :offset="1" :span="11">
                    <el-input v-model="imgDetail.features.constantly_frame[1]" size="mini" />
                  </el-col>
                </el-row>
                <div>关键帧描述: {{ imgDetail.key_frame_desc }}</div>
              </el-col>
              <el-col v-if="imgDetail.features" :span="12">
                <el-tabs v-model="stringdsad" type="card">
                  <!-- <el-tab-pane label="人物重心" name="人物重心">
                    人物重心坐标：{{ imgDetail.features.gravity_center }}
                  </el-tab-pane> -->
                  <el-tab-pane :label="'人物关节点/距离(' + imgDetail.features.inclination_count + ')' " name="人物关节点/距离">
                    <el-row>
                      <el-col :span="8">描述</el-col>
                      <el-col :offset="1" :span="4">距离(px)</el-col>
                      <el-col :offset="1" :span="4">阈值(±0.5)
                        <el-tooltip class="item" effect="dark" content="长度的阈值是一个比值，表示允许的变更后长度与初始长度的差值与初始长度的比值，可选±0.5" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                      <el-col :offset="1" :span="4">权重(0-1)
                        <el-tooltip class="item" effect="dark" content="权重 0-1" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                    </el-row>
                    <el-row v-for="(item, index) in imgDetail.features.inclination" :key="index">
                      <el-col :span="8">
                        <el-input v-model="item.describe" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-input v-model="item.value" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-input v-model="item.threshold" size="mini" @change="computedFeaturesCount(imgDetail.features)" />
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-input v-model="item.weight" size="mini" @change="computedFeaturesCount(imgDetail.features)" />
                      </el-col>
                    </el-row>
                  </el-tab-pane>
                  <el-tab-pane :label="'人物关节点/角度(' + imgDetail.features.vertical_count + ')'" name="人物关节点/角度">
                    <el-row>
                      <el-col :span="8">描述</el-col>
                      <el-col :offset="1" :span="4">角度(度数)</el-col>
                      <el-col :offset="1" :span="4">阈值(±60°)
                        <el-tooltip class="item" effect="dark" content="角度阈值±60°内可选" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                      <el-col :offset="1" :span="4">权重(0-1)
                        <el-tooltip class="item" effect="dark" content="权重 0-1" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                    </el-row>
                    <el-row v-for="(item, index) in imgDetail.features.vertical" :key="index">
                      <el-col :span="8">
                        <el-input v-model="item.describe" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-input v-model="item.value" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-input v-model="item.threshold" size="mini" @change="computedFeaturesCount(imgDetail.features)" />
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-input v-model="item.weight" size="mini" @change="computedFeaturesCount(imgDetail.features)" />
                      </el-col>
                    </el-row>
                  </el-tab-pane>
                  <el-tab-pane :label="'人与静止物体距离(' + imgDetail.features.ob_list_count + ')'" name="人与静止物体距离">
                    <el-row>
                      <el-col :span="8">描述</el-col>
                      <el-col :offset="1" :span="4">距离(px)</el-col>
                      <el-col :offset="1" :span="4">阈值(±0.5)
                        <el-tooltip class="item" effect="dark" content="长度的阈值是一个比值，表示允许的变更后长度与初始长度的差值与初始长度的比值，可选±0.5" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                      <el-col :offset="1" :span="4">权重(0-1)
                        <el-tooltip class="item" effect="dark" content="权重 0-1" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                    </el-row>
                    <el-row v-for="(item, index) in imgDetail.features.ob_list" :key="index">
                      <el-col :span="8">
                        <el-col :span="4" style="line-height: 28px;">
                          <el-checkbox v-model="item.status" :true-label="1" :false-label="0" @change="checkedChange(imgDetail.features.ob_list, imgDetail.frame_path, imgDetail, imgDetail.features)" />
                        </el-col>
                        <el-col :span="20" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="item.describe">
                          <span :style="styleObject(item)">{{ item.describe }}</span>
                        </el-col>
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-input v-model="item.value" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-input v-model="item.threshold" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-input v-model="item.weight" size="mini" />
                      </el-col>
                    </el-row>
                  </el-tab-pane>
                  <el-tab-pane label="非相邻骨骼点距离" name="非相邻骨骼点距离">
                    <el-row>
                      <el-col :span="3">距离(px)</el-col>
                      <el-col :offset="1" :span="4">起始点</el-col>
                      <el-col :offset="1" :span="4">结束点</el-col>
                      <el-col :offset="1" :span="4">阈值(±0.5)
                        <el-tooltip class="item" effect="dark" content="长度的阈值是一个比值，表示允许的变更后长度与初始长度的差值与初始长度的比值，可选±0.5" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                      <el-col :offset="1" :span="4">权重(0-1)
                        <el-tooltip class="item" effect="dark" content="权重 0-1" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                    </el-row>
                    <el-row v-for="(item, index) in imgDetail.features.bone_distance" :key="index">
                      <el-col :span="3">
                        <el-input v-model="item.value" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-select v-model="item.key[0]" placeholder="起始点" size="mini" @change="posePointChange(item, imgDetail)">
                          <el-option v-for="(posePoint, key) in posePoints" :key="key" :label="posePoint" :value="key" />
                        </el-select>
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-select v-model="item.key[1]" placeholder="结束点" size="mini" @change="posePointChange(item, imgDetail)">
                          <el-option v-for="(posePoint, key) in posePoints" :key="key" :label="posePoint" :value="key" />
                        </el-select>
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-input v-model="item.threshold" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-input v-model="item.weight" size="mini" />
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-button size="mini" type="primary" @click="addBoneDistance(imgDetail.features.bone_distance)">增加非相邻骨骼点距离</el-button>
                    </el-row>
                  </el-tab-pane>
                  <el-tab-pane label="骨骼点与区域数据" name="骨骼点与区域数据">
                    <el-row>
                      <el-col :span="3">距离(px)</el-col>
                      <el-col :offset="1" :span="4">骨骼点</el-col>
                      <el-col :offset="1" :span="4">阈值(±0.5)
                        <el-tooltip class="item" effect="dark" content="长度的阈值是一个比值，表示允许的变更后长度与初始长度的差值与初始长度的比值，可选±0.5" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                      <el-col :offset="1" :span="4">权重(0-1)
                        <el-tooltip class="item" effect="dark" content="权重 0-1" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                    </el-row>
                    <el-row v-for="(item, index) in imgDetail.features.bone_area" :key="index">
                      <el-col :span="3">
                        <el-input v-model="item.value" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-select v-model="item.key" placeholder="骨骼点" size="mini" @change="posePointChange(item, imgDetail)">
                          <el-option v-for="(posePoint, key) in posePoints" :key="key" :label="posePoint" :value="key" />
                        </el-select>
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-input v-model="item.threshold" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-input v-model="item.weight" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-button size="mini" type="primary" @click="editBoneArea(item, imgDetail)">编辑</el-button>
                        <el-button size="mini" type="primary" @click="clearBoneArea(item, imgDetail)">重置</el-button>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-button size="mini" type="primary" @click="addBoneArea(imgDetail.features.bone_area)">骨骼点与区域数据</el-button>
                    </el-row>
                  </el-tab-pane>
                </el-tabs>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
    </el-collapse>

    <el-dialog title="模板归档" :visible.sync="pigeonholeVisible">
      <el-form :model="actionForm" label-width="100px">
        <el-form-item label="标签名称">
          <el-select v-model="actionForm.action_id" placeholder="请选择标签名称">
            <el-option
              v-for="actions in actionsList"
              :key="actions.id"
              :label="actions.action_name"
              :value="actions.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="pigeonholeVisible = false">取 消</el-button>
        <el-button type="primary" @click="archive()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="保存模板" :visible.sync="versionDesVisible">
      <el-form :model="versionDesForm">
        <el-form-item label="版本描述">
          <el-input v-model="versionDesForm.version_desc" type="textarea" :autosize="{ minRows: 3, maxRows: 5}" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="versionDesVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveTemplate()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Sortable, Swap } from 'sortablejs/modular/sortable.core.esm'
import { getKeyFrames, getFrameFeature, createTemplate, getTemplate, drawImage, templateSave, getActionsList, archive, getVideoInfo } from '@/api/video'
import { saveTemplate, getPosePoints, getPointDistance } from '@/api/templates'
// import { fabric } from 'fabric'
import zrender from 'zrender'
import _ from 'lodash'
// const { fabric } = require('fabric')

export default {
  filters: {

  },
  data() {
    return {
      stringdsad: '人物关节点/距离',
      baseAPI: process.env.VUE_APP_BASE_API,
      canvasWidth: 300,
      peoples: [],
      parts: [],
      result: [],
      part: [],
      activePeople: {},
      activePeopleNumber: '',
      taskInfo: {},
      videoInfo: {},
      url: '',
      preClassifyList: [],
      formInline: {
        curFrameIndex: 1,
        step: 1
      },
      activePart: [],
      loading: null,
      pigeonholeVisible: false,
      actionsList: [],
      actionForm: {
        action_id: ''
      },
      templateDetailList: [],
      versionDesVisible: false,
      versionDesForm: {
        version_desc: ''
      },
      posePoints: []
    }
  },
  created() {
    this.video_id = this.$route.query.video_id
    this.task_id = this.$route.query.task_id
    this.version_id = this.$route.query.version_id
    this.reid = this.$route.query.reid
    // this.loading = this.$loading({
    //   fullscreen: true,
    //   text: '模板生成中',
    //   background: 'rgba(0, 0, 0, 0.7)'
    // })
    this.getKeyFrames()
    this.getPosePoints()
    this.getVideoInfo()
  },
  mounted() {
    // this.$socket.on('frame_template', (res) => {
    //   const part = _.find(this.parts, { id: res.data.part_id })
    //   const frame = _.find(part.key_frame, { frame_index: res.data.frame_index })
    //   if (frame.template) {
    //     frame.template.features = res.data.features
    //   }
    // })
    // this.zr = zrender.init(this.$refs.canvasDiv.$el)
    this.$socket.on('template_status', (res) => {
      console.log('template_status')
      console.log(res)
      // if (res.data.status) {
      //   this.loading.close()
      // }
    })
  },
  methods: {
    getVideoInfo() {
      getVideoInfo({
        video_id: this.video_id
      }).then(response => {
        response.data.width = response.data.resolution.split('*')[0]
        response.data.height = response.data.resolution.split('*')[1]
        this.videoInfo = response.data
      })
    },
    getPosePoints() {
      getPosePoints()
        .then(response => {
          this.posePoints = response.data
          console.log(response)
        })
    },
    getKeyFrames() {
      getKeyFrames({
        video_id: this.video_id,
        task_id: this.task_id,
        reid: this.reid
      }).then(response => {
        // console.log(_.last(_.last(_.last(response.data.peoples).data).key_frame).template)
        // if (!_.isEmpty(_.last(_.last(_.last(response.data.peoples).data).key_frame).template)) {
        //   console.log('close')
        //   this.loading.close()
        // }
        _.forEach(response.data.peoples, (people) => {
          _.forEach(people.data, (part) => {
            part.templateDetail = []
            _.forEach(part.key_frame, (frame) => {
              // frame.template.part_id = part.id
              // frame.template.frame_index = frame.frame_index
              // frame.template.frame_path = frame.frame_path
              // frame.template.full_frame_path = process.env.VUE_APP_BASE_API + frame.frame_path
              // part.templateDetail.push(frame.template)
            })
          })
        })
        this.peoples = response.data.peoples
        this.activePeople = this.peoples[0]
        this.activePeopleNumber = this.peoples[0].reid + ''
        this.parts = this.peoples[0].data
        console.log(this.parts)
      })
    },
    getTemplate() {
      getTemplate({
        video_id: this.video_id,
        task_id: this.task_id
      }).then(response => {
        // console.log(_.last(_.last(_.last(response.data.peoples).data).key_frame).template)
        // if (!_.isEmpty(_.last(_.last(_.last(response.data.peoples).data).key_frame).template)) {
        //   console.log('close')
        //   this.loading.close()
        // }
        _.forEach(response.data.peoples, (people) => {
          _.forEach(people.data, (part) => {
            part.templateDetail = []
            _.forEach(part.key_frame, (frame) => {
              frame.template.part_id = part.id
              frame.template.frame_index = frame.frame_index
              frame.template.frame_path = frame.frame_path
              frame.template.full_frame_path = frame.full_frame_path
              // frame.template
              part.templateDetail.push(frame.template)
            })
          })
        })
        this.peoples = response.data.peoples
        this.activePeople = this.peoples[0]
        this.activePeopleNumber = this.peoples[0].reid + ''
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
      if (_.find(part.templateDetail, { frame_index: img.frame_index })) {
        return
      }
      getFrameFeature({
        video_id: this.video_id,
        task_id: this.task_id,
        version_id: this.version_id,
        part_id: part.id,
        frame_index: img.frame_index,
        reid: this.activePeopleNumber
      }).then(response => {
        response.data.frame_path = img.frame_path
        response.data.full_frame_path = img.full_frame_path
        if (response.code === 0) {
          response.data.features.vertical_count = 0
          response.data.features.inclination_count = 0
          response.data.features.ob_list_count = 0
          this.computedFeaturesCount(response.data.features)
          part.templateDetail.push(response.data)
          part.activeImg = response.data.frame_index + ''
          this.templateDetailList.push(response.data)
          // this.$nextTick(() => {
          //   response.data.zr = zrender.init(this.$refs['canvasDiv' + img.frame_index][0])
          //   response.data.curPoints = []
          //   response.data.zImage = new zrender.Image({
          //     scale: [1, 1],
          //     style: {
          //       x: 0,
          //       y: 0,
          //       image: response.data.full_frame_path,
          //       width: 520,
          //       height: 400
          //     }
          //   })
          //   response.data.zr.add(response.data.zImage)
          // })
        }
      })
    },
    computedFeaturesCount(features) {
      console.log('computedFeaturesCount')
      features.inclination_count = _.filter(features.inclination, (item) => {
        return item.threshold != 0 && item.weight != 0
      }).length
      features.vertical_count = _.filter(features.vertical, (item) => {
        return item.threshold != 0 && item.weight != 0
      }).length
      features.ob_list_count = _.filter(features.ob_list, (item) => {
        return item.status === 1
      }).length
    },
    resetData(img, part) {
      getFrameFeature({
        video_id: this.video_id,
        task_id: this.task_id,
        part_id: part.id,
        frame_index: img.frame_index,
        reid: this.activePeopleNumber,
        operation_type: 0
      }).then(response => {
        if (response.code === 0) {
          response.data.features.vertical_count = 0
          response.data.features.inclination_count = 0
          response.data.features.ob_list_count = 0
          img.features = response.data.features
        }
      })
    },
    checkedChange(object_location, frame_path, imgDetail, features) {
      drawImage({
        object_location: object_location,
        frame_path: frame_path
      }).then((response) => {
        imgDetail.full_frame_path = response.data.frame
      })
      this.computedFeaturesCount(features)
    },
    styleObject(item) {
      return {
        color: 'rgb(' + item.color[2] + ',' + item.color[1] + ',' + item.color[0] + ')'
      }
    },
    openVersionDesVisible() {
      this.versionDesVisible = true
    },
    saveTemplate() {
      console.log(this.templateDetailList)
      const postTemplateDetailList = _.cloneDeep(this.templateDetailList)

      _.forEach(postTemplateDetailList, postTemplateDetail => {
        _.forEach(postTemplateDetail.features.bone_area, item => {
          delete item.curPoints
          delete item.group
          delete item.polygon
          delete item.zImage
          delete item.zr
        })
        postTemplateDetail.features.bone_area
      })
      saveTemplate({
        data: postTemplateDetailList,
        version_id: this.version_id,
        task_id: this.task_id,
        version_desc: this.versionDesForm.version_desc
      }).then((response) => {
        if (response.code === 0) {
          this.$message('保存模板成功')
          this.versionDesVisible = false
        }
      })
    },
    pigeonhole() {
      getActionsList(this.getListParams).then(response => {
        this.actionsList = response.data
        this.pigeonholeVisible = true
      })
    },
    archive() {
      archive({
        task_id: this.task_id,
        video_id: this.video_id,
        action_id: this.actionForm.action_id,
        reid: this.activePeopleNumber
      }).then(response => {
        if (response.code === 0) {
          this.$message('模板归档成功')
          this.$router.push('/templates/list')
        }
      })
    },
    addBoneDistance(bone_distance) {
      bone_distance.push({
        describe: '',
        threshold: 0,
        value: 0,
        weight: 0,
        key: [null, null]
      })
    },
    posePointChange(item, imgDetail) {
      if (item.key[0] && item.key[1]) {
        getPointDistance({
          video_id: this.video_id,
          frame_index: imgDetail.frame_index,
          start_point: item.key[0],
          end_point: item.key[1]
        }).then(res => {
          console.log(res)
          item.value = res.data.distance
        })
      }
    },
    operation(boneArea) {
      boneArea.zImage.on('click', (e) => {
        var circle = new zrender.Circle({
          style: {
            stroke: '#f00',
            fill: '#f00',
            fontSize: 12,
            textFill: '#fff'

          },
          shape: {
            cx: e.event.zrX,
            cy: e.event.zrY,
            r: 3
          },
          draggable: true,
          z: 4
        })
        boneArea.group.add(circle)
        boneArea.curPoints.push(circle)

        // circle.on('drag', (e) => {
        //   // console.log(e.event.zrX, e.event.zrY)
        //   boneArea.polygon.attr({
        //     shape: {
        //       points: points
        //     }
        //   })
        // })

        if (boneArea.curPoints.length > 2) {
          var points = boneArea.curPoints.map(curPoint => {
            return [curPoint.shape.cx, curPoint.shape.cy]
          })
          boneArea.poly = points.map(point => {
            return [parseInt((point[0] * this.videoInfo.width / 540).toFixed(0)), parseInt((point[1] * this.videoInfo.height / 400).toFixed(0))]
          })
          if (boneArea.polygon) {
            boneArea.group.remove(boneArea.polygon)
          }
          boneArea.polygon = new zrender.Polygon({
            shape: {
              points: points
            },
            style: {
              opacity: 0.5
            },
            z: 9
          })
          boneArea.group.add(boneArea.polygon)
        }
      })
    },
    addBoneArea(bone_area) {
      bone_area.push({
        describe: '',
        threshold: 0,
        value: 0,
        weight: 0,
        key: null,
        poly: []
      })
    },
    editBoneArea(boneArea, imgDetail) {
      boneArea.zr = zrender.init(this.$refs['canvasDiv' + imgDetail.frame_index][0])
      boneArea.curPoints = []
      boneArea.zImage = new zrender.Image({
        scale: [1, 1],
        style: {
          x: 0,
          y: 0,
          image: imgDetail.full_frame_path,
          width: 520,
          height: 400
        }
      })
      boneArea.zr.add(boneArea.zImage)
      boneArea.group = new zrender.Group({
        slient: true // 组内子孙元素是否响应鼠标事件
      })
      boneArea.zr.add(boneArea.group)
      this.operation(boneArea)
    },
    clearBoneArea(boneArea, imgDetail) {
      boneArea.zr.remove(imgDetail.group)
      boneArea.curPoints = []
      boneArea.polygon = null
      boneArea.group = new zrender.Group({
        slient: true // 组内子孙元素是否响应鼠标事件
      })
      boneArea.zr.add(boneArea.group)
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

