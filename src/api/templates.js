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