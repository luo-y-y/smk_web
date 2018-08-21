/* global window */
/* global document */
import React from 'react'
import NProgress from 'nprogress'
import PropTypes from 'prop-types'
import pathToRegexp from 'path-to-regexp'
import { connect } from 'dva'
import {  Loader } from 'components'
import { BackTop,Modal,Form,Input,message } from 'antd'
import { classnames, config } from 'utils'
import { Helmet } from 'react-helmet'
import { withRouter } from 'dva/router'
import '../themes/index.less'
import './app.less'
import Error from './error'

const { prefix, openPages } = config
import { Layout, Menu, Breadcrumb, Icon } from 'antd';
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
let lastHref
const MenuItemGroup = Menu.ItemGroup;
const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
}

const App = ({ children, dispatch, app, loading, location,  form: {
  getFieldDecorator,
  validateFields,
  getFieldsValue,
  setFieldsValue
} }) => {
  const { user, siderFold, darkTheme, isNavbar, menuPopoverVisible, navOpenKeys, menu, permissions,modalVisible } = app
  let { pathname } = location
  pathname = pathname.startsWith('/') ? pathname : `/${pathname}`
  const { iconFontJS, iconFontCSS, logo } = config
  const current = menu.filter(item => pathToRegexp(item.route || '').exec(pathname))
  const hasPermission = current.length ? permissions.visit.includes(current[0].id) : false
  const href = window.location.href

  if (lastHref !== href) {
    NProgress.start()
    if (!loading.global) {
      NProgress.done()
      lastHref = href
    }
  }
  console.log('MENU:',menu)
  const headerProps = {
    menu,
    user,
    location,
    siderFold,
    isNavbar,
    menuPopoverVisible,
    navOpenKeys,
    switchMenuPopover () {
      dispatch({ type: 'app/switchMenuPopver' })
    },
    logout () {
      dispatch({ type: 'app/logout' })
    },
    switchSider () {
      dispatch({ type: 'app/switchSider' })
    },
    changeOpenKeys (openKeys) {
      dispatch({ type: 'app/handleNavOpenKeys', payload: { navOpenKeys: openKeys } })
    },
  }

  const siderProps = {
    menu,
    location,
    siderFold,
    darkTheme,
    navOpenKeys,
    changeTheme () {
      dispatch({ type: 'app/switchTheme' })
    },
    changeOpenKeys (openKeys) {
      window.localStorage.setItem(`${prefix}navOpenKeys`, JSON.stringify(openKeys))
      dispatch({ type: 'app/handleNavOpenKeys', payload: { navOpenKeys: openKeys } })
    },
  }

  const breadProps = {
    menu,
    location,
  }
  if (openPages && openPages.includes(pathname)) {
    return (<div>
      <Loader fullScreen spinning={loading.effects['app/query']} />
      {children}
    </div>)
  }
  return (
    <Layout>
      <Header className="header">
        <div className="logo" />
        <Menu
          theme="white"
          mode="horizontal"
          defaultSelectedKeys={['0']}
          style={{ lineHeight: '64px' }}
          onClick={(e)=>{console.log(e)
            var m = document.querySelectorAll('iframe');
            for(let i in m){
              if(!isNaN(i)){
                m[i].style.display = 'none'
              }
            }
            var target = document.querySelector(`#smkIframe_${e.key}`);
            if(!target.getAttribute('src')){
              target.setAttribute('src',target.getAttribute('data-src'));
            }
            target.style.display = 'block';

          }}
        >
          {
            app.menu.map((item,index) => {
              return <Menu.Item key={index}><Icon type="setting" />{item.label}</Menu.Item>
            })
          }
        </Menu>
        <Modal
          title="修改密码"
          visible={modalVisible}
          onOk={()=>{
            validateFields((errors) => {
              if (errors) {
                return
              }
              var data = getFieldsValue();
              if(data['password'] !== data['password1']){
                message.error('两次输入的密码不一致，请重新输入！');
              }
              else{
                dispatch({ type: 'app/hideModal' })
                message.success('修改成功！');
              }
            })

          }}
          onCancel={()=>{dispatch({ type: 'app/hideModal' })}}
        >
          <Form layout="horizontal">
            <FormItem label="用户名" hasFeedback {...formItemLayout}>
              {getFieldDecorator('title', {
                initialValue: user.userName,
                rules: [
                  {
                    required: true,
                    message:'标题不能为空'
                  },
                ],
              })(<Input disabled />)}
            </FormItem>
            <FormItem label="新密码" hasFeedback {...formItemLayout}>
              {getFieldDecorator('password', {
                initialValue: '',
                rules: [
                  {
                    required: true,
                    message:'密码不能为空'
                  },
                ],
              })(<Input type="password" />)}
            </FormItem>
            <FormItem label="确认新密码" hasFeedback {...formItemLayout}>
              {getFieldDecorator('password1', {
                initialValue: '',
                rules: [
                  {
                    required: true,
                    message:'密码不能为空'
                  },
                ],
              })(<Input type="password" />)}
            </FormItem>
          </Form>
        </Modal>
        <Menu mode="horizontal" style={{ lineHeight: '63px',position:'absolute',right:0,top:0 }} onClick={(e)=>{
          console.log(e.key)
          if(e.key == 'logout'){
            dispatch({ type: 'app/logout' })
          }
          else{
            dispatch({ type: 'app/showModal' })
          }
        }}>
          <SubMenu
            style={{
              float: 'right',
            }}
            title={<span>
              <Icon type="user" />
              欢迎 {user.userName}！
            </span>}
          >

            <Menu.Item key="edit" >
              修改密码
            </Menu.Item>
            <Menu.Item key="logout" >
              退出登录
            </Menu.Item>

          </SubMenu>
        </Menu>
      </Header>
      <Layout>

        {
          app.menu.map((item,index) => {
            var doInvoke = item.doInvoke;
            if(item.doInvoke){
                doInvoke = `${item.doInvoke}?smkToken=${JSON.parse(localStorage.user).token}&smkCatalogId=${item.id}&smkIntroduce=${item.doIntroduce}`;
            }
            if(index == 0){
              return <iframe id={`smkIframe_${index}`} style={{height:window.innerHeight-64,border:'none',display:index == 0 ? 'block' : 'none'}} src={doInvoke} data-src={doInvoke} frameBorder="0"></iframe>
            }
            else{
              return <iframe id={`smkIframe_${index}`} style={{height:window.innerHeight-64,border:'none',display:index == 0 ? 'block' : 'none'}} data-src={doInvoke} frameBorder="0"></iframe>
            }


          })
        }
      </Layout>
    </Layout>
  )
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  app: PropTypes.object,
  loading: PropTypes.object,
}

export default withRouter(connect(({ app, loading }) => ({ app, loading }))(Form.create()(App)))
