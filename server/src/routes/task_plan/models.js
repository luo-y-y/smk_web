
import modelExtend from 'dva-model-extend'
import { config } from 'utils'
import { pageModel } from '../common'
import {Ajax} from '../../utils/index'
import { message } from 'antd';


var api = {
  doQuery:'pbTaskPlanWeb/findPageList',//查询
  doSave:'pbTaskPlanWeb/doSave',       //增加和修改，增加的时候不传入ID，修改的时候传入ID
  doDelete:'pbTaskPlanWeb/doDelete',   //删除，ids:'1,2,3,4'
}

var dataFormat = {
  nameSpace:'task_plan',
  data:[
    {
      title: '用户Id',
      dataIndex: 'userId',
    }, {
    title: '组织ID',
    dataIndex: 'orgId',
    rules: [
      {
        required: true,
        message:'真实姓名不能为空'
      }
      ]
  }, {
    title: '岗位ID',
    dataIndex: 'stationId',
    rules: [
      {
        required: true,
        message:'手机号码不能为空'
      },
      ]
  }, {
    title: '类型',
    dataIndex: 'type',
    type:'select',
    options:[
      {value:'week', text:'周任务'},
      {value:'month',text:'月任务'},
      {value:'quarter',text:'季度任务'},
      {value:'halfyear',text:'半年任务'},
      {value:'year',text:'年任务'},
      ],
    render:(text, record, index)=>{
      if(text=='week'){
        return (<span>周任务</span>);
      }else if(text=='month') {
        return (<span>月任务</span>);
      }else if(text=='quarter') {
        return (<span>季度任务</span>);
      }else if(text=='halfyear') {
        return (<span>半年任务</span>);
      }else if(text=='year') {
        return (<span>年任务</span>);
      }
    },
    rules: [{
        required: true,
        message:'类型不能为空'
      }]
  }, {
    title: '任务名称',
    dataIndex: 'name',
  },
    {
      title: '任务内容',
      dataIndex: 'content',
      type: 'textarea',
      rows:4,
      noRender:true,
    }, {
      title: '状态',
      dataIndex: 'status',
      type: 'select',
      options: [
        {
          value: 'y',
          text: '有效'
        },
        {
          value: 'n',
          text: '无效'
        },
      ],
      render: (text, record, index) => {
        return (
          <span>{text == 'y' ? '有效' : '无效'}</span>
        )
      }
    },{
    title: '创建时间',
    dataIndex: 'createTime',
    noEdit:true,//是否渲染到编辑字段
  }
    ]
}

for(let i in api){
  api[i] = Ajax(api[i])
}
export default modelExtend(pageModel, {
  namespace: dataFormat.nameSpace,
  state: {
    dataFormat
  },

  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === `/${dataFormat.nameSpace}`) {
          if(location.query){
            dispatch({
              type: 'query',
              payload:{
                ...location.query,
                page:location.query.page || 1,
                rows:location.query.rows || 10
              },
            })
          }
          else{
            dispatch({
              type: 'query',
              payload:{
                page:1,
                rows:10
              },
            })
          }
        }
      })
    },
  },

  effects: {
    * doSave({ payload }, { call, put, select }) {
      const data = yield call(api.doSave,payload)
      if (data.statusText == 'OK') {
        message.success('添加/修改成功！');
        yield put({
          type: 'query',
          payload:{
            page:1,
            rows:10
          },
        })
        yield put({
          type: 'updateState',
          payload:{
            selectedRows:!payload.id ? [] : [{...payload}],
          },
        })

      } else {
        throw data.data.msg
      }
    },

    * query ({ payload = {} }, { call, put }) {
      const data = yield call(api.doQuery, payload)
      console.log('个人用户请求参数',data)
      if (data) {
        yield put({
          type: 'querySuccess',
          payload: {
            list: data.data.response.searchData,
            pagination: {
              current: Number(payload.page) || 1,
              pageSize: Number(payload.rows) || 10,//默认一页三个元素
              total: data.data.response.totalNum,
            },
          },
        })
      }
    },

    * doDelete ({ payload }, { call, put, select }) {
      const data = yield call(api.doDelete, { ids: payload.ids.join(',') })
      if (data.data.code == '0') {
        message.success('删除成功！');
        yield put({ type: 'updateState', payload: { selectedRows: [] } })
        yield put({ type: 'query' })
      } else {
        throw data
      }
    },

  },

  reducers: {


  },
})
