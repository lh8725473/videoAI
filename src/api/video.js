import request from '@/utils/request'

export function getVideoList(data) {
  return request({
    url: '/video/video_list',
    method: 'post',
    data
  })
}

export function getVideoInfo(data) {
  return request({
    url: '/video/get_video',
    method: 'post',
    data
  })
}

export function preClassify(data) {
  return request({
    url: '/video/pre_classify',
    method: 'post',
    data
  })
}

export function keyPeople(data) {
  return request({
    url: '/video/key_people',
    method: 'post',
    data
  })
}

export function getPreClassify(params) {
  return request({
    url: '/task/get_pre_classify',
    method: 'get',
    params
  })
}

export function getPreClassifyList(data) {
  return request({
    url: '/task/pre_classify_list',
    method: 'post',
    data
  })
}

export function getKeyPeople(params) {
  return request({
    url: '/task/get_key_people',
    method: 'get',
    params
  })
}

export function getKeyFrames(data) {
  return request({
    url: '/video/key_frames',
    method: 'post',
    data
  })
}

export function getImageFeature(params) {
  return request({
    url: '/template/get_image_feature',
    method: 'get',
    params
  })
}

export function createTemplate(data) {
  return request({
    url: '/template/create_template',
    method: 'post',
    data
  })
}

