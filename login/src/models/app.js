/* global window */
/* global document */
/* global location */
import { routerRedux } from 'dva/router'
import { parse } from 'qs'
import config from 'config'
import { EnumRoleType } from 'enums'
import queryString from 'query-string'

const { prefix } = config
import axios from 'axios'
async function getMenu (params) {
  return axios({
    method: 'post',
    headers: {'token': JSON.parse(localStorage.getItem('user')).token},
    url: $BASE + 'sys/user/getRootTabsByUser.htm',
    data: params
  })
}
export default {
  namespace: 'app',
  state: {
    user: JSON.parse(localStorage.getItem('user') || '{}'),
    permissions: {
      visit: [],
    },
    menu: [
      {
        id: 1,
        icon: 'laptop',
        name: 'Dashboard',
        router: '/dashboard',
      },
    ],
    menuPopoverVisible: false,
    modalVisible: false,
    siderFold: window.localStorage.getItem(`${prefix}siderFold`) === 'true',
    darkTheme: window.localStorage.getItem(`${prefix}darkTheme`) === 'true',
    isNavbar: document.body.clientWidth < 769,
    navOpenKeys: JSON.parse(window.localStorage.getItem(`${prefix}navOpenKeys`)) || [],
    locationPathname: '',
    locationQuery: {},
  },
  subscriptions: {

    setupHistory ({ dispatch, history }) {
      history.listen((location) => {
        dispatch({
          type: 'updateState',
          payload: {
            locationPathname: location.pathname,
            locationQuery: queryString.parse(location.search),
          },
        })
      })
    },

    setup ({ dispatch }) {
      dispatch({ type: 'query' })
      let tid
      window.onresize = () => {
        clearTimeout(tid)
        tid = setTimeout(() => {
          dispatch({ type: 'changeNavbar' })
        }, 300)
      }
    },

  },
  effects: {

    * query ({
      payload,
    }, { call, put, select }) {
      var user_ = JSON.parse(localStorage.getItem('user') || '{}');
      var {token} = user_;
      if(token){
        const data = yield call(getMenu);
        if (data.data.code == 0) {

          yield put({ type: 'updateState', payload:{
            menu:data.data.response
          }})
        } else {
          throw data
        }

        /*

        const list = [
          {
            id: '1',
            icon: 'laptop',
            name: '效果分析',
            route: '/dashboard',
          },
          {
            id: '3',
            name: '帮助文档',
            icon: 'laptop',
            route: '/help',
          },
          {
            id: '21',
            mpid: '-1',
            bpid: '2',
            name: 'User Detail',
            route: '/user/:id',
          },
          {
            id: '5',
            name: '图表',
            icon: 'code-o',
          },
          {
            id: '52',
            bpid: '5',
            mpid: '5',
            name: 'highCharts',
            icon: 'bar-chart',
            route: '/chart/highCharts',
          },
          {
            id: '53',
            bpid: '5',
            mpid: '5',
            name: 'Rechartst',
            icon: 'area-chart',
            route: '/chart/Recharts',
          }
        ];
        const permissions = {
          role:'admin'
        };
        let menu = list
        if (permissions.role === EnumRoleType.ADMIN || permissions.role === EnumRoleType.DEVELOPER) {
          permissions.visit = list.map(item => item.id)
          console.log(' permissions.visit', permissions.visit)
        } else {
          menu = list.filter((item) => {
            const cases = [
              permissions.visit.includes(item.id),
              item.mpid ? permissions.visit.includes(item.mpid) || item.mpid === '-1' : true,
              item.bpid ? permissions.visit.includes(item.bpid) : true,
            ]
            return cases.every(_ => _)
          })
        }
        yield put({
          type: 'updateState',
          payload: {
            permissions,
            menu,
          },
        })

        */
        if (location.pathname === '/login') {
          yield put(routerRedux.replace({
            pathname: '/dashboard',
          }))
        }
        return


      }
      const { locationPathname } = yield select(_ => _.app)
       if (config.openPages && config.openPages.indexOf(locationPathname) < 0) {
        yield put(routerRedux.replace({
          pathname: '/login',
          search: queryString.stringify({
            from: locationPathname,
          }),
        }))
      }
    },

    * logout ({
      payload,
    }, { call, put }) {
    //  const data = yield call(logout, parse(payload))
      localStorage.setItem('user','{}');//清空localstorage，后续要增加yield接口
      yield put({ type: 'query' })
    },

    * changeNavbar (action, { put, select }) {
      const { app } = yield (select(_ => _))
      const isNavbar = document.body.clientWidth < 769
      if (isNavbar !== app.isNavbar) {
        yield put({ type: 'handleNavbar', payload: isNavbar })
      }
    },

  },
  reducers: {
    updateState (state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
    showModal (state, { payload }) {
      return {
        ...state,
        modalVisible:true
      }
    },
    hideModal (state, { payload }) {
      return {
        ...state,
        modalVisible:false
      }
    },
    switchSider (state) {
      window.localStorage.setItem(`${prefix}siderFold`, !state.siderFold)
      return {
        ...state,
        siderFold: !state.siderFold,
      }
    },

    switchTheme (state) {
      window.localStorage.setItem(`${prefix}darkTheme`, !state.darkTheme)
      return {
        ...state,
        darkTheme: !state.darkTheme,
      }
    },

    switchMenuPopver (state) {
      return {
        ...state,
        menuPopoverVisible: !state.menuPopoverVisible,
      }
    },

    handleNavbar (state, { payload }) {
      return {
        ...state,
        isNavbar: payload,
      }
    },

    handleNavOpenKeys (state, { payload: navOpenKeys }) {
      return {
        ...state,
        ...navOpenKeys,
      }
    },
  },
}
