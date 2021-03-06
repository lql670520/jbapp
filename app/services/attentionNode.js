import request from '../utils/request';

export function list(data) {
  return request({
    url: '/api/user_attention_node',
    type: 'get',
    data: data,
  });
}

export function create(data) {
  return request({
    url: '/api/user_attention_node',
    type: 'post',
    data,
  });
}

export function remove(data) {
  return request({
    url: '/api/user_attention_node',
    type: 'delete',
    data,
  });
}
