import request from '@/utils/request'

export function getTestStrategies(params) {
  console.log('getTestStrategies success')
  return request({
    url: 'api/testStrategy',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/testStrategy',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/testStrategy/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/testStrategy',
    method: 'put',
    data
  })
}

export default { add, edit, del }
