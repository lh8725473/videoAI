<template>
  <div class="app-container video-list">
    <div class="action-butons">
      <!-- <el-upload
        class="upload-demo"
        :action="uploadUrl"
        :show-file-list="false"
        :on-success="uploadSuccess"
        accept=".mp4"
      >
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload> -->
      <el-button size="small" type="primary" icon="el-icon-upload" @click="openUpload">点击上传</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="视频名称" width="200">
        <template slot-scope="scope">
          <el-link v-show="scope.row.status == '2'" type="primary" :href="'#/video/step1?video_id=' + scope.row.id">{{ scope.row.video_name }}</el-link>
          <span v-show="scope.row.status != '2'">{{ scope.row.video_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分析状态" width="110" align="center">
        <template slot-scope="scope">
          <span :class="'status' + scope.row.status">{{ scope.row.status | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="视频描述" width="110" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.video_desc }}
        </template>
      </el-table-column>
      <el-table-column label="视频大小" width="110">
        <template slot-scope="scope">
          {{ scope.row.file_size }}M
        </template>
      </el-table-column>
      <el-table-column label="码率(kb/s)" width="110">
        <template slot-scope="scope">
          {{ (scope.row.bit_rate / 1000).toFixed(0) }}
        </template>
      </el-table-column>
      <el-table-column label="视频格式" width="110">
        <template slot-scope="scope">
          {{ scope.row.type }}
        </template>
      </el-table-column>
      <el-table-column label="总帧数" width="110">
        <template slot-scope="scope">
          {{ scope.row.nb_frames }}
        </template>
      </el-table-column>
      <el-table-column label="帧率" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.fps }}fps</span>
        </template>
      </el-table-column>
      <el-table-column label="分析类型" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.function | functionFilter }}
        </template>
      </el-table-column>
      <el-table-column label="分辨率" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.resolution }}
        </template>
      </el-table-column>
      <el-table-column label="分析次数" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.count }}
        </template>
      </el-table-column>
      <el-table-column label="时长" width="80" align="center">
        <template slot-scope="scope">
          {{ scope.row.total_time }}s
        </template>
      </el-table-column>
      <el-table-column label="上传时间" width="180" align="center">
        <template slot-scope="scope">
          {{ scope.row.upload_time }}
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="100"
      >
        <template slot-scope="scope">
          <el-button type="text" size="small" :disabled="scope.row.status != '0' && scope.row.status != '-100'" @click="basicData(scope.row)">视频分析</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="prev, pager, next"
      :page-size="10"
      :total="total"
      @current-change="pageChange"
    />

    <el-dialog title="上传文件" :visible.sync="uploadVisible">
      <el-form ref="uploadForm" :rules="uploadRules" :model="uploadForm" label-width="80px">
        <el-form-item label="模板名称" prop="fileName">
          <el-input v-model="uploadForm.fileName" placeholder="请上传一个.MP4格式文件" class="input-with-select" readonly>
            <el-upload
              slot="append"
              ref="upload"
              :data="uploadForm"
              class="upload-demo"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="uploadSuccess"
              :on-change="fileChange"
              :multiple="false"
              :auto-upload="false"
              accept=".mp4"
              :file-list="fileList"
            >
              <el-button size="small" type="primary" icon="el-icon-upload">选择文件</el-button>
            </el-upload>
          </el-input>
        </el-form-item>
        <el-form-item label="分析类型" prop="function">
          <el-checkbox-group v-model="uploadForm.function">
            <el-checkbox label="1" name="type">视频提取</el-checkbox>
            <el-checkbox label="2" name="type">视频匹配</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="视频描述" prop="video_desc">
          <el-input
            v-model="uploadForm.video_desc"
            type="textarea"
            :rows="4"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="uploadVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitUploadVisible()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getVideoList, preClassify, postKeyPeople, basicData } from '@/api/video'
import _ from 'lodash'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        '0': '未开始',
        '1': '检测中',
        '2': '结束',
        '10': '等待中',
        '-100': '异常'
      }
      return statusMap[status]
    },
    functionFilter(fun) {
      const functionText = {
        '1,2': '视频提取/视频匹配',
        '1': '视频提取',
        '2': '视频匹配'
      }
      return functionText[fun]
    }
  },
  data() {
    return {
      uploadUrl: process.env.VUE_APP_BASE_API + '/video/upload',
      getListParams: {
        page: 1,
        per_page: 10
      },
      list: null,
      listLoading: true,
      total: 0,
      uploadVisible: false,
      fileList: [],
      uploadForm: {
        function: [],
        fileName: '',
        video_desc: ''
      },
      uploadRules: {
        fileName: [
          { required: true, message: '请选择文件上传', trigger: 'blur' }
        ],
        function: [
          { type: 'array', required: true, message: '请至少选择一个分析类型', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
    this.$socket.on('video_task', (res) => {
      if (res.code === 0) {
        const video = _.find(this.list, { id: res.data.id })
        if (video) {
          video.status = res.data.status
        }
      }
    })
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getVideoList(this.getListParams).then(response => {
        console.log(response)
        this.list = response.data
        this.total = response.page_info.total
        this.listLoading = false
      })
    },
    basicData(video) {
      basicData({
        video_id: video.id
      }).then(response => {
        console.log(response)
        if (response.code === 0) {
          this.$notify({
            title: '视频开始分析',
            message: '待视频分析完成后,可点击视频名称进行查看结果',
            type: 'success'
          })
          // this.$router.push('/video/step1?video_id=' + video.id)
        }
      })
    },
    preClassify(video) {
      postKeyPeople({
        video_id: video.id
      }).then(response => {
        console.log(response)
        if (response.code === 0) {
          this.$router.push('/video/step1?video_id=' + video.id)
        }
      })
    },
    pageChange(page) {
      this.getListParams.page = page
      this.fetchData()
    },
    uploadSuccess(response) {
      console.log(response)
      if (response.code === 0) {
        this.uploadVisible = false
        this.$message.success('上传视频成功')
        this.getListParams.page = 1
        this.fetchData()
      } else {
        this.$message.error(response.message)
        this.$refs['uploadForm'].resetFields()
      }
    },
    openUpload() {
      this.fileList = []
      this.uploadVisible = true
      this.$nextTick(() => {
        this.$refs['uploadForm'].resetFields()
      })
    },
    fileChange(file, fileList) {
      console.log(fileList)
      this.uploadForm.fileName = file.name
    },
    submitUploadVisible() {
      console.log('submitUploadVisible')
      this.$refs.uploadForm.validate((valid) => {
        if (valid) {
          this.$refs.upload.submit()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
.video-list{
  .status1{
    color: #409EFF
  }
  .status2{
    color: #67C23A;
  }
  .status10{
    color: #E6A23C;
  }
  .status-100{
    color: #F56C6C;
  }
  .action-butons{
    margin-bottom: 10px;
  }
  .el-pagination{
    float: right;
    margin-top: 15px;
  }
}

</style>
