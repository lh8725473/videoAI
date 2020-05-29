// 模拟数据
const baseParts = [
  {
    'match_frame_list': [

    ],
    'status': null,
    'template_frame_list': [
      {
        'frame_id': 21,
        'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/0_5.62/21_edit.png'
      },
      {
        'frame_id': 70,
        'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/0_5.62/70_edit.png'
      },
      {
        'frame_id': 98,
        'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/0_5.62/98_edit.png'
      },
      {
        'frame_id': 126,
        'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/0_5.62/126_edit.png'
      }
    ],
    'template_id': 'eb1a4f16-08ae-44f0-9a29-88f7dd98196d',
    'template_name': '抬桶',
    'value': null
  },
  {
    'match_frame_list': [

    ],
    'status': null,
    'template_frame_list': [
      {
        'frame_id': 142,
        'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/5.67_6.67/142_edit.png'
      }
    ],
    'template_id': 'b893a8b2-229e-4e9a-b751-914f884ea56e',
    'template_name': '行走',
    'value': null
  },
  {
    'match_frame_list': [

    ],
    'status': null,
    'template_frame_list': [
      {
        'frame_id': 169,
        'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/6.71_9.96/169_edit.png'
      },
      {
        'frame_id': 218,
        'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/6.71_9.96/218_edit.png'
      },
      {
        'frame_id': 231,
        'frame_path': '/sources/keyFrames/5967db89-63bc-477e-bb7a-6f860e7dd30f/1/6.71_9.96/231_edit.png'
      }
    ],
    'template_id': '940ee67c-3d7f-4aa4-92cb-d1f6b36b0825',
    'template_name': '起跳',
    'value': null
  }
]

// 暂存数据
let store = []
/**
 * 获取ports
 */
export function getParts() {
  if (store.length === 0 ) {
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
