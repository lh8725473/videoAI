// 模拟数据
const baseParts = {
  'create_time': '2020-06-09 09:21:41', 'id': 10, 'match_task_detail': [{ 'action_id': 1, 'create_time': '2020-06-04 18:22:01', 'id': 1, 'name': '\u642c\u6c34002', 'reid': 1, 'task_id': '3cdae90f-0afc-4f45-95b4-01072bfbca43', 'video_id': 3, 'video_list': [{ 'action_template_id': 1, 'assessment_result': '1', 'create_time': '2020-06-09 09:21:41', 'id': 30, 'match_rate': null, 'match_result': null, 'task_match_id': 'd2e6f166-3f85-43a5-8bb8-f33a59aee2ed', 'update_time': '2020-06-09 09:21:41', 'video_id': 1, 'video_name': '010(1)' }, { 'action_template_id': 1, 'assessment_result': '1', 'create_time': '2020-06-09 09:21:41', 'id': 31, 'match_rate': null, 'match_result': null, 'task_match_id': 'd2e6f166-3f85-43a5-8bb8-f33a59aee2ed', 'update_time': '2020-06-09 09:21:41', 'video_id': 3, 'video_name': '1590032121716419.mp4' }] }, { 'action_id': 1, 'create_time': '2020-06-05 09:40:34', 'id': 2, 'name': '\u642c\u6c34002', 'reid': 1, 'task_id': '3cdae90f-0afc-4f45-95b4-01072bfbca43', 'video_id': 3, 'video_list': [{ 'action_template_id': 2, 'assessment_result': '1', 'create_time': '2020-06-09 09:21:41', 'id': 32, 'match_rate': null, 'match_result': null, 'task_match_id': 'd2e6f166-3f85-43a5-8bb8-f33a59aee2ed', 'update_time': '2020-06-09 09:21:41', 'video_id': 1, 'video_name': '010(1)' }, { 'action_template_id': 2, 'assessment_result': '1', 'create_time': '2020-06-09 09:21:41', 'id': 33, 'match_rate': null, 'match_result': null, 'task_match_id': 'd2e6f166-3f85-43a5-8bb8-f33a59aee2ed', 'update_time': '2020-06-09 09:21:41', 'video_id': 3, 'video_name': '1590032121716419.mp4' }] }, { 'action_id': 1, 'create_time': '2020-06-05 09:58:25', 'id': 3, 'name': '\u642c\u6c34002', 'reid': 1, 'task_id': '3cdae90f-0afc-4f45-95b4-01072bfbca43', 'video_id': 3, 'video_list': [{ 'action_template_id': 3, 'assessment_result': '1', 'create_time': '2020-06-09 09:21:41', 'id': 34, 'match_rate': null, 'match_result': null, 'task_match_id': 'd2e6f166-3f85-43a5-8bb8-f33a59aee2ed', 'update_time': '2020-06-09 09:21:41', 'video_id': 1, 'video_name': '010(1)' }, { 'action_template_id': 3, 'assessment_result': '1', 'create_time': '2020-06-09 09:21:42', 'id': 35, 'match_rate': null, 'match_result': null, 'task_match_id': 'd2e6f166-3f85-43a5-8bb8-f33a59aee2ed', 'update_time': '2020-06-09 09:21:42', 'video_id': 3, 'video_name': '1590032121716419.mp4' }] }], 'task_match_id': 'd2e6f166-3f85-43a5-8bb8-f33a59aee2ed', 'task_match_name': '1591687188.0267644', 'task_match_status': '0', 'user_id': 1
}

// 暂存数据
let store = []
/**
 * 获取ports
 */
export function getParts() {
  if (store.length === 0) {
    store = JSON.parse(JSON.stringify(baseParts))
  }
  return store
}
/**
 * 存储parts
 * @param {*} parts response
 */
export function setParts(parts) {
  if (Array.isArray(parts)) {
    store = parts
  }
}
