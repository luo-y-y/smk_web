import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Button, Row, Form, Input, Col} from 'antd'
import {config} from 'utils'
import styles from './index.less'

const FormItem = Form.Item

const Login = ({
                 loading,
                 dispatch,
                 login,
                 form: {
                   getFieldDecorator,
                   validateFieldsAndScroll,
                 },
               }) => {

  if(login.msgSendSuccess && !login.countStart) {
    countDown()
    setTimeout(() => {
      dispatch({type: 'login/updateLogin', payload: {countStart: true}})
    }, 0)
  }

  function countDown() {
    let time = 60
    let t = setInterval(() => {
      time--
      dispatch({
        type: 'login/updateLogin',
        payload: {
          msgButtonCoolDown: time,
          msgButton: t,
        }
      })
      if(time === 0) {
        clearInterval(t)
        dispatch({
          type: 'login/updateLogin', payload: {
            countStart: false,
            msgSendSuccess: false
          }
        })
      }
    }, 1000)
  }

  function handleOk() {

    validateFieldsAndScroll((errors, values) => {
      console.log('debug values', values)
      if(errors) {
        return
      }
      dispatch({type: 'login/login', payload: Object.assign({}, values, {sendType: login.sendType || 'login'}), values})
    })
  }


  function handleSendMsg() {
    validateFieldsAndScroll(['tel'], {force: true}, (errors, values) => {
        if(errors) {
          return
        }
        dispatch({type: 'login/fetchAuthMsg', payload: values})
      }
    );
  }


  return (
    <div className={styles.form}>
      <div className={styles.logo}>
        <img alt={'logo'} src={config.logo}/>
        <span>{config.name}</span>
      </div>
      <form>
        <FormItem hasFeedback>
          {getFieldDecorator('tel', {
            // setFieldsValue: '123123',
            rules: [
              {
                required: true,
                message: '请输入手机号',
              },
            ],
          })(<Input type={'tel'} size="large" placeholder="请输入手机号"/>)}
        </FormItem>


        <Row type="flex" justify="space-between">
          <Col span={14}>
            <FormItem hasFeedback>
              {getFieldDecorator('code', {
                rules: [
                  {
                    required: true,
                    pattern: /\d{6}/,
                    message: '请输入六位验证码'
                  },
                ],
              })(<Input maxLength="6" size="large" type="text" onPressEnter={handleSendMsg} placeholder="请短信验证码"/>)}
            </FormItem>
          </Col>
          <Col span={2}>

          </Col>
          <Col span={8}>
            <Button
              disabled={login.countStart}
              type="primary" size="large" onClick={handleSendMsg} loading={loading.effects.login}>
              发送 {login.countStart ? login.msgButtonCoolDown : ''}
            </Button>
          </Col>
        </Row>


        <Row>
          <Button type="primary" size="large" onClick={handleOk} loading={loading.effects.login}>
            登录
          </Button>
        </Row>

      </form>
    </div>
  )
}

Login.propTypes = {
  form: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
}

export default connect(({login, loading}) => ({login, loading}))(Form.create()(Login))
