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
                <div :ref="'canvasDiv' + imgDetail.frame_index" style="width: 640px; height: 360px" />
                <div style="text-align: center;">
                  <span>人物重心坐标:{{ imgDetail.features.gravity_center }} </span>
                  <el-button size="mini" type="primary" @click="resetData(imgDetail, part)">还原系统结果</el-button>
                  <el-button size="mini" type="primary" @click="viewData(imgDetail, part)">查看结果</el-button>
                </div>
                <el-row>
                  <el-col :span="8">
                    连续帧数
                    <el-tooltip class="item" effect="dark" content="连续帧数建议小于2 *姿态实时检测频率" placement="top-start">
                      <i class="el-icon-warning-outline" />
                    </el-tooltip>
                  </el-col>
                  <el-col :offset="1" :span="11">
                    <el-input v-model="imgDetail.features.constantly_frame[0]" size="mini" />
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="8">
                    最小出现帧数
                    <el-tooltip class="item" effect="dark" content="最小帧数建议大于连续帧数一半" placement="top-start">
                      <i class="el-icon-warning-outline" />
                    </el-tooltip>
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
                        <el-tooltip class="item" effect="dark" content="权重 0-1，精确两位有效数，-1表示必要条件" placement="top-start">
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
                        <el-tooltip class="item" effect="dark" content="权重 0-1，精确两位有效数，-1表示必要条件" placement="top-start">
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
                        <el-tooltip class="item" effect="dark" content="权重 0-1，精确两位有效数，-1表示必要条件" placement="top-start">
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
                      <el-col :span="4">起始点</el-col>
                      <el-col :offset="1" :span="4">结束点</el-col>
                      <el-col :offset="1" :span="3">距离(px)</el-col>
                      <el-col :offset="1" :span="3">阈值(±5)
                        <el-tooltip class="item" effect="dark" content="长度的阈值是一个绝对值，表示允许的变更后长度与初始长度的差值与初始长度的比值，可选±5" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                      <el-col :offset="1" :span="2">偏差
                        <el-tooltip class="item" effect="dark" content="长度的阈值是一个绝对值，表示允许的变更后长度与初始长度的差值与初始长度的比值，可选±5" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                      <el-col :offset="1" :span="3">权重(0-1)
                        <el-tooltip class="item" effect="dark" content="权重 0-1，精确两位有效数，-1表示必要条件" placement="top-start">
                          <i class="el-icon-warning-outline" />
                        </el-tooltip>
                      </el-col>
                    </el-row>
                    <el-row v-for="(item, index) in imgDetail.features.bone_distance" :key="index">
                      <el-col :span="4">
                        <el-select v-model="item.key[0]" placeholder="起始点" size="mini" @change="startPosePointChange(item, imgDetail)">
                          <el-option v-for="posePoint in posePoints" :key="posePoint.key" :label="posePoint.name" :value="posePoint.key" />
                        </el-select>
                      </el-col>
                      <el-col :offset="1" :span="4">
                        <el-select v-model="item.key[1]" placeholder="结束点" size="mini" @change="posePointChange(item, imgDetail)">
                          <el-option v-for="(posePoint, key) in item.endPointList" :key="key" :label="posePoint" :value="key" />
                        </el-select>
                      </el-col>
                      <el-col :offset="1" :span="3">
                        <el-input v-model="item.value" size="mini" readonly />
                      </el-col>
                      <el-col :offset="1" :span="3">
                        <el-input v-model="item.threshold" size="mini" />
                      </el-col>
                      <el-col :offset="1" :span="2">
                        {{ offset(item) }}
                        <el-tooltip v-show="item.key[0] && item.key[1]" class="item" effect="dark" content="查看" placement="top-start">
                          <i class="el-icon-view" @click="viewPointLine(item, imgDetail)" />
                        </el-tooltip>
                      </el-col>
                      <el-col :offset="1" :span="3">
                        <el-input v-model="item.weight" size="mini" />
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-button size="mini" type="primary" @click="addBoneDistance(imgDetail.features.bone_distance)">增加非相邻骨骼点距离</el-button>
                    </el-row>
                  </el-tab-pane>
                  <el-tab-pane label="骨骼点与区域数据" name="骨骼点与区域数据">
                    <el-row>
                      <el-col :span="4">骨骼点</el-col>
                      <el-col :offset="1" :span="8">点集合</el-col>
                    </el-row>
                    <el-row v-for="(prarentItem, index) in imgDetail.features.bone_area" :key="index">
                      <el-row>
                        区域集合： {{ index + 1 }}
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="deletePrarentBoneArea(index, imgDetail.features.bone_area)" />
                      </el-row>
                      <el-row v-for="(item, itemIndex) in prarentItem" :key="itemIndex">
                        <el-col :span="4">
                          <el-select v-model="item.key" placeholder="骨骼点" size="mini">
                            <el-option v-for="posePoint in posePoints" :key="posePoint.key" :label="posePoint.name" :value="posePoint.key" />
                          </el-select>
                        </el-col>
                        <el-col :offset="1" :span="8">
                          <el-input v-model="item.polyString" size="mini" readonly />
                        </el-col>
                        <el-col :offset="1" :span="6">
                          <el-button size="mini" type="primary" icon="el-icon-plus" @click="addChildBoneArea(prarentItem)" />
                          <el-button v-show="!item.isEdit" size="mini" type="primary" icon="el-icon-edit" @click="editBoneArea(item, imgDetail)" />
                          <el-button v-show="item.isEdit" size="mini" type="primary" icon="el-icon-document-checked" @click="saveBoneArea(item, imgDetail)" />
                          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteChilidBoneArea(itemIndex, prarentItem)" />
                          <!-- <el-button size="mini" type="primary" @click="clearBoneArea(item, imgDetail)">重置</el-button> -->
                        </el-col>
                      </el-row>
                    </el-row>
                    <el-row>
                      <el-button size="mini" type="primary" @click="addBoneArea(imgDetail.features.bone_area)">增加骨骼点与区域数据</el-button>
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

    <el-dialog title="查看有效值" :visible.sync="viewDataVisible">
      <el-row class="row-title">
        人物关节点/距离
      </el-row>
      <el-row>
        <el-col :span="8">描述</el-col>
        <el-col :offset="1" :span="4">距离(px)</el-col>
        <el-col :offset="1" :span="4">阈值(±0.5)
          <el-tooltip class="item" effect="dark" content="长度的阈值是一个比值，表示允许的变更后长度与初始长度的差值与初始长度的比值，可选±0.5" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </el-col>
        <el-col :offset="1" :span="4">权重(0-1)
          <el-tooltip class="item" effect="dark" content="权重 0-1，精确两位有效数，-1表示必要条件" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </el-col>
      </el-row>
      <el-row v-for="(item, index) in dViewData.inclination" :key="index">
        <el-col :span="8">
          <el-input v-model="item.describe" size="mini" readonly />
        </el-col>
        <el-col :offset="1" :span="4">
          <el-input v-model="item.value" size="mini" readonly />
        </el-col>
        <el-col :offset="1" :span="4">
          <el-input v-model="item.threshold" size="mini" readonly />
        </el-col>
        <el-col :offset="1" :span="4">
          <el-input v-model="item.weight" size="mini" readonly />
        </el-col>
      </el-row>
      <el-row class="row-title">
        人物关节点/角度
      </el-row>
      <el-row>
        <el-col :span="8">描述</el-col>
        <el-col :offset="1" :span="4">角度(°)</el-col>
        <el-col :offset="1" :span="4">阈值(±60°)
          <el-tooltip class="item" effect="dark" content="长度的阈值是一个比值，表示允许的变更后长度与初始长度的差值与初始长度的比值，可选±0.5" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </el-col>
        <el-col :offset="1" :span="4">权重(0-1)
          <el-tooltip class="item" effect="dark" content="权重 0-1，精确两位有效数，-1表示必要条件" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </el-col>
      </el-row>
      <el-row v-for="(item, index) in dViewData.vertical" :key="index">
        <el-col :span="8">
          <el-input v-model="item.describe" size="mini" readonly />
        </el-col>
        <el-col :offset="1" :span="4">
          <el-input v-model="item.value" size="mini" readonly />
        </el-col>
        <el-col :offset="1" :span="4">
          <el-input v-model="item.threshold" size="mini" readonly />
        </el-col>
        <el-col :offset="1" :span="4">
          <el-input v-model="item.weight" size="mini" readonly />
        </el-col>
      </el-row>
      <el-row class="row-title">
        人与静止物体距离
      </el-row>
      <el-row>
        <el-col :span="8">描述</el-col>
        <el-col :offset="1" :span="4">距离(px)</el-col>
        <el-col :offset="1" :span="4">阈值(±0.5)
          <el-tooltip class="item" effect="dark" content="长度的阈值是一个比值，表示允许的变更后长度与初始长度的差值与初始长度的比值，可选±0.5" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </el-col>
        <el-col :offset="1" :span="4">权重(0-1)
          <el-tooltip class="item" effect="dark" content="权重 0-1，精确两位有效数，-1表示必要条件" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </el-col>
      </el-row>
      <el-row v-for="(item, index) in dViewData.ob_list" :key="index">
        <el-col :span="8">
          <el-input v-model="item.describe" size="mini" readonly />
        </el-col>
        <el-col :offset="1" :span="4">
          <el-input v-model="item.value" size="mini" readonly />
        </el-col>
        <el-col :offset="1" :span="4">
          <el-input v-model="item.threshold" size="mini" readonly />
        </el-col>
        <el-col :offset="1" :span="4">
          <el-input v-model="item.weight" size="mini" readonly />
        </el-col>
      </el-row>
      <el-row class="row-title">
        非相邻骨骼点距离
      </el-row>
      <el-row>
        <el-col :span="4">起始点</el-col>
        <el-col :offset="1" :span="4">结束点</el-col>
        <el-col :offset="1" :span="3">距离(px)</el-col>
        <el-col :offset="1" :span="3">阈值(±5)
          <el-tooltip class="item" effect="dark" content="长度的阈值是一个绝对值，表示允许的变更后长度与初始长度的差值与初始长度的比值，可选±5" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </el-col>
        <el-col :offset="1" :span="2">偏差
          <el-tooltip class="item" effect="dark" content="长度的阈值是一个绝对值，表示允许的变更后长度与初始长度的差值与初始长度的比值，可选±5" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </el-col>
        <el-col :offset="1" :span="3">权重(0-1)
          <el-tooltip class="item" effect="dark" content="权重 0-1，精确两位有效数，-1表示必要条件" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </el-col>
      </el-row>
      <el-row v-for="(item, index) in dViewData.bone_distance" :key="index">
        <el-col :span="4">
          <el-select v-model="item.key[0]" placeholder="起始点" size="mini" @change="startPosePointChange(item, imgDetail)">
            <el-option v-for="posePoint in posePoints" :key="posePoint.key" :label="posePoint.name" :value="posePoint.key" />
          </el-select>
        </el-col>
        <el-col :offset="1" :span="4">
          <el-select v-model="item.key[1]" placeholder="结束点" size="mini" @change="posePointChange(item, imgDetail)">
            <el-option v-for="(posePoint, key) in item.endPointList" :key="key" :label="posePoint" :value="key" />
          </el-select>
        </el-col>
        <el-col :offset="1" :span="3">
          <el-input v-model="item.value" size="mini" readonly />
        </el-col>
        <el-col :offset="1" :span="3">
          <el-input v-model="item.threshold" size="mini" />
        </el-col>
        <el-col :offset="1" :span="2">
          {{ offset(item) }}
        </el-col>
        <el-col :offset="1" :span="3">
          <el-input v-model="item.weight" size="mini" />
        </el-col>
      </el-row>
      <el-row class="row-title">
        骨骼点与区域数据
      </el-row>
      <el-row>
        <el-col :span="4">骨骼点</el-col>
        <el-col :offset="1" :span="8">点集合</el-col>
      </el-row>
      <el-row v-for="(prarentItem, index) in dViewData.bone_area" :key="index">
        <el-row>
          区域集合： {{ index + 1 }}
        </el-row>
        <el-row v-for="(item, itemIndex) in prarentItem" :key="itemIndex">
          <el-col :span="4">
            <el-select v-model="item.key" placeholder="骨骼点" size="mini">
              <el-option v-for="posePoint in posePoints" :key="posePoint.key" :label="posePoint.name" :value="posePoint.key" />
            </el-select>
          </el-col>
          <el-col :offset="1" :span="8">
            <el-input v-model="item.polyString" size="mini" readonly />
          </el-col>
        </el-row>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewDataVisible = false">取 消</el-button>
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
      posePoints: [],
      dViewData: {
        bone_area: [],
        bone_distance: [],
        ob_list: [],
        inclination: [],
        vertical: []
      },
      viewDataVisible: false
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
          _.forEach(response.data.features.bone_area, (item) => {
            item.isEdit = false
          })
          this.computedFeaturesCount(response.data.features)
          part.templateDetail.push(response.data)
          part.activeImg = response.data.frame_index + ''
          this.templateDetailList.push(response.data)
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
        postTemplateDetail.features.one_vote = []
        _.forEach(postTemplateDetail.features.bone_area, parentItem => {
          _.forEach(parentItem, childeItem => {
            delete childeItem.curPoints
            delete childeItem.group
            delete childeItem.polygon
            delete childeItem.zImage
            delete childeItem.zr
          })
        })
        _.forEach(postTemplateDetail.features.bone_distance, boneItem => {
          delete boneItem.curPoints
          delete boneItem.group
          delete boneItem.polygon
          delete boneItem.zImage
          delete boneItem.zr
          if (boneItem.weight == -1) {
            postTemplateDetail.features.one_vote.push(boneItem)
          }
        })
        _.forEach(postTemplateDetail.features.inclination, inclinationItem => {
          if (inclinationItem.weight == -1) {
            postTemplateDetail.features.one_vote.push(inclinationItem)
          }
        })
        _.forEach(postTemplateDetail.features.ob_list, obItem => {
          if (obItem.weight == -1) {
            postTemplateDetail.features.one_vote.push(obItem)
          }
        })
        _.forEach(postTemplateDetail.features.vertical, verticalItem => {
          if (verticalItem.weight == -1) {
            postTemplateDetail.features.one_vote.push(verticalItem)
          }
        })
      })
      console.log(postTemplateDetailList)
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
        key: [null, null],
        endPointList: []
      })
    },
    startPosePointChange(item, imgDetail) {
      item.endPointList = _.find(this.posePoints, { key: item.key[0] }).points
      if (item.key[0] && item.key[1]) {
        getPointDistance({
          video_id: this.video_id,
          frame_index: imgDetail.frame_index,
          start_point: item.key[0],
          end_point: item.key[1]
        }).then(res => {
          item.value = res.data.distance
        })
      }
    },
    posePointChange(item, imgDetail) {
      if (item.key[0] && item.key[1]) {
        getPointDistance({
          video_id: this.video_id,
          frame_index: imgDetail.frame_index,
          start_point: item.key[0],
          end_point: item.key[1]
        }).then(res => {
          item.value = res.data.distance
          item.start_point = res.data.end_point
          item.end_point = res.data.start_point
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
            textFill: '#fff',
            textPosition: [2, -11],
            text: '[' + parseInt((e.event.zrX * this.videoInfo.width / 640).toFixed(0)) + ',' + parseInt((e.event.zrY * this.videoInfo.height / 360).toFixed(0)) + ']'
          },
          shape: {
            cx: e.event.zrX,
            cy: e.event.zrY,
            r: 3
          },
          draggable: true,
          z: 9
        })
        boneArea.group.add(circle)
        boneArea.curPoints.push(circle)

        circle.on('drag', (e) => {
          // console.log(e.event.zrX, e.event.zrY)
          console.log(e)
          e.target.attr({
            style: {
              stroke: '#f00',
              fill: '#f00',
              fontSize: 12,
              textFill: '#fff',
              textPosition: [2, -11],
              text: '[' + parseInt(((e.target.shape.cx + e.target.position[0]) * this.videoInfo.width / 640).toFixed(0)) + ',' + parseInt(((e.target.shape.cy + e.target.position[1]) * this.videoInfo.height / 360).toFixed(0)) + ']'
            }
          })
          var points = boneArea.curPoints.map(curPoint => {
            return [curPoint.shape.cx + curPoint.position[0], curPoint.shape.cy + curPoint.position[1]]
          })
          boneArea.poly = boneArea.curPoints.map(point => {
            return [parseInt(((point.shape.cx + point.position[0]) * this.videoInfo.width / 640).toFixed(0)), parseInt(((point.shape.cy + point.position[1]) * this.videoInfo.height / 360).toFixed(0))]
          })
          boneArea.polyString = JSON.stringify(boneArea.poly)
          boneArea.polygon.attr({
            shape: {
              points: points
            }
          })
        })

        if (boneArea.curPoints.length > 2) {
          var points = boneArea.curPoints.map(curPoint => {
            return [curPoint.shape.cx + curPoint.position[0], curPoint.shape.cy + curPoint.position[1]]
          })
          boneArea.poly = boneArea.curPoints.map(point => {
            return [parseInt(((point.shape.cx + point.position[0]) * this.videoInfo.width / 640).toFixed(0)), parseInt(((point.shape.cy + point.position[1]) * this.videoInfo.height / 360).toFixed(0))]
          })
          boneArea.polyString = JSON.stringify(boneArea.poly)
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
            z: 8
          })
          boneArea.group.add(boneArea.polygon)
        }
      })
    },
    viewPointLine(item, imgDetail) {
      console.log(item)
      item.zr = zrender.init(this.$refs['canvasDiv' + imgDetail.frame_index][0])
      item.zImage = new zrender.Image({
        scale: [1, 1],
        style: {
          x: 0,
          y: 0,
          image: imgDetail.full_frame_path,
          width: 640,
          height: 360
        }
      })
      item.zr.add(item.zImage)
      item.group = new zrender.Group({
        slient: true // 组内子孙元素是否响应鼠标事件
      })
      item.zr.add(item.group)
      var startCircle = new zrender.Circle({
        style: {
          stroke: '#f00',
          fill: '#f00',
          fontSize: 12,
          textFill: '#fff',
          textPosition: [2, -11],
          text: JSON.stringify(item.start_point)
          // text: '[' + parseInt((e.event.zrX * this.videoInfo.width / 640).toFixed(0)) + ',' + parseInt((e.event.zrY * this.videoInfo.height / 360).toFixed(0)) + ']'
        },
        shape: {
          cx: parseInt((item.start_point[0] * 640 / this.videoInfo.width).toFixed(0)),
          cy: parseInt((item.start_point[1] * 360 / this.videoInfo.height).toFixed(0)),
          r: 3
        },
        z: 9
      })
      item.group.add(startCircle)
      var endCircle = new zrender.Circle({
        style: {
          stroke: '#f00',
          fill: '#f00',
          fontSize: 12,
          textFill: '#fff',
          textPosition: [2, -11],
          text: JSON.stringify(item.end_point)
          // text: '[' + parseInt((e.event.zrX * this.videoInfo.width / 640).toFixed(0)) + ',' + parseInt((e.event.zrY * this.videoInfo.height / 360).toFixed(0)) + ']'
        },
        shape: {
          cx: parseInt((item.end_point[0] * 640 / this.videoInfo.width).toFixed(0)),
          cy: parseInt((item.end_point[1] * 360 / this.videoInfo.height).toFixed(0)),
          r: 3
        },
        z: 9
      })
      item.group.add(endCircle)
      var line = new zrender.Line({
        style: {
          stroke: '#0aead5',
          fill: '#0aead5',
          textFill: '#0aead5',
          lineWidth: 2
        },
        shape: {
          x1: parseInt((item.start_point[0] * 640 / this.videoInfo.width).toFixed(0)),
          y1: parseInt((item.start_point[1] * 360 / this.videoInfo.height).toFixed(0)),
          x2: parseInt((item.end_point[0] * 640 / this.videoInfo.width).toFixed(0)),
          y2: parseInt((item.end_point[1] * 360 / this.videoInfo.height).toFixed(0))
        },
        z: 10
      })
      item.group.add(line)
    },
    addBoneArea(bone_area) {
      bone_area.push([
        {
          describe: '',
          threshold: 0,
          value: 0,
          weight: 0,
          key: null,
          poly: [],
          polyString: '',
          isEdit: false
        }
      ])
    },
    deletePrarentBoneArea(index, prarentItem) {
      prarentItem.splice(index, 1)
    },
    addChildBoneArea(prarentItem) {
      prarentItem.push({
        describe: '',
        threshold: 0,
        value: 0,
        weight: 0,
        key: null,
        poly: [],
        polyString: '',
        isEdit: false
      })
    },
    deleteChilidBoneArea(index, prarentItem) {
      prarentItem.splice(index, 1)
    },
    editBoneArea(boneArea, imgDetail) {
      boneArea.isEdit = true
      boneArea.zr = zrender.init(this.$refs['canvasDiv' + imgDetail.frame_index][0])
      boneArea.curPoints = []
      boneArea.zImage = new zrender.Image({
        scale: [1, 1],
        style: {
          x: 0,
          y: 0,
          image: imgDetail.full_frame_path,
          width: 640,
          height: 360
        }
      })
      boneArea.zr.add(boneArea.zImage)
      boneArea.group = new zrender.Group({
        slient: true // 组内子孙元素是否响应鼠标事件
      })
      boneArea.zr.add(boneArea.group)
      this.operation(boneArea)
    },
    saveBoneArea(boneArea) {
      console.log(boneArea)
      if (boneArea.curPoints.length < 3) {
        this.$message.error('至少要3个点形成区域')
        return
      }
      if (!boneArea.key) {
        this.$message.error('请选择骨骼点')
        return
      }
      boneArea.isEdit = false
    },
    clearBoneArea(boneArea, imgDetail) {
      boneArea.zr.remove(imgDetail.group)
      boneArea.curPoints = []
      boneArea.polygon = null
      boneArea.group = new zrender.Group({
        slient: true // 组内子孙元素是否响应鼠标事件
      })
      boneArea.zr.add(boneArea.group)
    },
    offset(item) {
      if (item.value && item.threshold) {
        return ((item.threshold / item.value) * 100).toFixed(2) + '%'
      } else {
        return '0%'
      }
    },
    viewData(item) {
      this.dViewData.inclination = _.filter(item.features.inclination, (item) => {
        return item.threshold != 0 && item.weight != 0
      })
      this.dViewData.vertical = _.filter(item.features.vertical, (item) => {
        return item.threshold != 0 && item.weight != 0
      })
      this.dViewData.ob_list = _.filter(item.features.ob_list, (item) => {
        return item.status === 1
      })
      this.dViewData.bone_distance = _.filter(item.features.bone_distance, (item) => {
        return item.value != 0
      })
      this.dViewData.bone_area = item.features.bone_area
      console.log(this.dViewData)
      this.viewDataVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.row-title{
  font-size: 16px;
  color: red;
  padding-bottom: 3px;
  border-bottom: 1px solid red;
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

