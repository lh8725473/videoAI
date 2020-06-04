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

export function keyFrames(data) {
  return request({
    url: '/video/key_frames',
    method: 'post',
    data
  })
}

export function getKeyFrames(params) {
  return request({
    url: '/keyframe/get_key_frame',
    method: 'get',
    params
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

export function getTemplate(params) {
  return request({
    url: '/template/get_template',
    method: 'get',
    params
  })
}

export function postKeyPeople(data) {
  return request({
    url: '/keypeople/key_people',
    method: 'post',
    data
  })
}

export function getPeoples(params) {
  return request({
    url: '/keypeople/peoples',
    method: 'get',
    params
  })
}

export function updatePeople(data) {
  return request({
    url: '/keypeople/update_people',
    method: 'post',
    data
  })
}

export function savePreClassify(data) {
  return request({
    url: '/task/save_pre_classify',
    method: 'post',
    data
  })
}

export function keyframeSave(data) {
  return request({
    url: '/keyframe/save',
    method: 'post',
    data
  })
}

