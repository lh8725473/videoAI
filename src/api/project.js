import request from '@/utils/request'

export function getProjectList(params) {
  return request({
    url: '/project/list',
    method: 'get',
    params
  })
}

export function addProject(data) {
  return request({
    url: '/project/add',
    method: 'post',
    data
  })
}

export function getProjectVersions(params) {
  return request({
    url: '/os_version/list',
    method: 'get',
    params
  })
}

export function addProjectVersion(data) {
  return request({
    url: '/os_version/add',
    method: 'post',
    data
  })
}

export function getModuleList(params) {
  return request({
    url: '/module/list',
    method: 'get',
    params
  })
}

export function addModule(data) {
  return request({
    url: '/module/add',
    method: 'post',
    data
  })
}

export function getModuleVersion(params) {
  return request({
    url: '/module_version/list',
    method: 'get',
    params
  })
}

export function addModuleVersion(data) {
  return request({
    url: '/module_version/add',
    method: 'post',
    data
  })
}

export function getModuleVersionModule(params) {
  return request({
    url: '/module/list_module',
    method: 'get',
    params
  })
}

export function updateModuleOsVersion(data) {
  return request({
    url: '/module_os_version/update',
    method: 'post',
    data
  })
}
