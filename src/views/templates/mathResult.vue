<template>
  <div class="app-container">
    <el-collapse v-model="activePart" accordion>
      <el-collapse-item v-for="part in parts" :key="part.partFrames" :name="part.partFrames">
        <template slot="title">
          <span class="tip">动作: {{ part.template_name }}</span>
          <span class="tip">匹配结果: {{ part.status | status }}</span>
          <span class="tip">匹配率: {{ part.value * 100 }}%</span>
        </template>
        <el-row>
          <div class="scroll-warp">
            <p>模版</p>
            <div v-for="img in part.template_frame_list" :key="img.frame_id" class="block">
              <el-image
                style="width: 200px; height: 200px"
                :src="baseAPI + img.frame_path"
                fit="contain"
              />
              <span class="demonstration">帧号：{{ img.frame_id }}</span>
            </div>
            <template v-for="(match_frame, index) in part.match_frame_list">
              <p>匹配{{ index + 1 }}</p>
              <div v-for="(img, index) in match_frame" :key="index" class="block">
                <el-image
                  style="width: 200px; height: 200px"
                  :src="baseAPI + img.frame_path"
                  fit="contain"
                />
                <span class="demonstration">帧号：{{ img.frame_id }}</span>
              </div>
            </template>

          </div>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { getParts, setParts } from './parts.vm'

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
      baseAPI: process.env.VUE_APP_BASE_API,
      activePart: [],
      parts: []
    }
  },
  created() {
    this.$socket.on('template_match', resp => {
      console.log(resp)
      if (resp.code === 0) {
        setParts(resp.data)
      }
      this.parts = getParts()
    })
    this.parts = getParts()
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
  height: 230px;
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

</style>

