<template>
  <div class="app-container">
    <el-collapse v-model="activePart">
      <el-collapse-item v-for="part in parts" :key="part.partFrames" :name="part.partFrames">
        <template slot="title">
          {{ part.template_name }}
          <span>{{ part.status }}</span>
          <span>{{ part.value }}</span>
        </template>
        <div v-for="img in part.template_frame_list" :key="img.frame_id" class="block">
          <el-image
            style="width: 200px; height: 200px"
            :src="baseAPI + img.frame_path"
            fit="contain"
            @click="addImg(img, part)"
          />
          <span class="demonstration">帧号：{{ img.frame_id }}</span>
        </div>
        <div v-for="img in part.match_frame_list" :key="img.frame_id" class="block">
          <el-image
            style="width: 200px; height: 200px"
            :src="baseAPI + img.frame_path"
            fit="contain"
            @click="addImg(img, part)"
          />
          <span class="demonstration">帧号：{{ img.frame_id }}</span>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { getKeyFrames, getImageFeature, createTemplate } from '@/api/video'
import { fabric } from 'fabric'
import _ from 'lodash'
// const { fabric } = require('fabric')

export default {
  filters: {

  },
  data() {
    return {
      baseAPI: process.env.VUE_APP_BASE_API,
      activePart: [],
      parts: [
        {
          'match_frame_list': [

          ],
          'status': null,
          'template_frame_list': [
            {
              'frame_id': 21,
              'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/0_5.62/21_edit.png'
            },
            {
              'frame_id': 70,
              'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/0_5.62/70_edit.png'
            },
            {
              'frame_id': 98,
              'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/0_5.62/98_edit.png'
            },
            {
              'frame_id': 126,
              'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/0_5.62/126_edit.png'
            }
          ],
          'template_id': 'eb1a4f16-08ae-44f0-9a29-88f7dd98196d',
          'template_name': '抬桶',
          'value': null
        },
        {
          'match_frame_list': [

          ],
          'status': null,
          'template_frame_list': [
            {
              'frame_id': 142,
              'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/5.67_6.67/142_edit.png'
            }
          ],
          'template_id': 'b893a8b2-229e-4e9a-b751-914f884ea56e',
          'template_name': '行走',
          'value': null
        },
        {
          'match_frame_list': [

          ],
          'status': null,
          'template_frame_list': [
            {
              'frame_id': 169,
              'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/6.71_9.96/169_edit.png'
            },
            {
              'frame_id': 218,
              'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/6.71_9.96/218_edit.png'
            },
            {
              'frame_id': 231,
              'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/6.71_9.96/231_edit.png'
            }
          ],
          'template_id': '940ee67c-3d7f-4aa4-92cb-d1f6b36b0825',
          'template_name': '起跳',
          'value': null
        }
      ]
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
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

