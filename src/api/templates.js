import request from '@/utils/request'

export function getTemplateList(params) {
  return request({
    url: '/template/template_list',
    method: 'get',
    params
  })
}

export function startTemplateMatch(data) {
  return request({
    url: '/template/template_match',
    method: 'post',
    data
  })
}

export function templateMatchTest(data) {
  return request({
    url: '/template/template_match_new',
    method: 'post',
    data
  })
}

export function saveTemplate(data) {
  return request({
    url: '/template/save_template',
    method: 'post',
    data
  })
}

export function getMatchResult(params) {
  return request({
    url: '/template/get_match_result',
    method: 'get',
    params
  })
}

export function getMatchList(params) {
  return request({
    url: '/template/match_list',
    method: 'get',
    params
  })
}

export function getMatchSecond(params) {
  return request({
    url: '/template/match_second',
    method: 'get',
    params
  })
}

export function getMatchTaskDetail(params) {
  return request({
    url: '/template/match_task_detail',
    method: 'get',
    params
  })
}

export function getVersions(params) {
  return request({
    url: '/template/versions',
    method: 'get',
    params
  })
}

export function deleteVersion(data) {
  return request({
    url: '/template/delete_version',
    method: 'post',
    data
  })
}

export function deriveTask(data) {
  return request({
    url: '/task/derive_task',
    method: 'post',
    data
  })
}
