import request from '@/utils/request'

export function getCourses(params) {
  console.log('getClasses success')
  return request({
    url: 'api/sysClass',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/sysClass',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/sysClass/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/sysClass',
    method: 'put',
    data
  })
}

export default { getCourses, add, edit, del }
