import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route, Redirect, routerRedux } from 'dva/router'
import dynamic from 'dva/dynamic'
import App from 'routes/app'
import {queryURL} from './utils/index'

const { ConnectedRouter } = routerRedux

const Routers = function ({ history, app }) {
  const error = dynamic({
    app,
    component: () => import('./routes/error'),
  })
  // const routesConfig = ['dashboard','user_list','role_list','role_power','menu_list','login','smkApp'];
  const routesConfig = ['task_plan','pb_user','pb_org','pb_station'];

  const routes = [];
  routesConfig.map((i)=>{
    routes.push({
      path: `/${i}`,
      models: () => [import(`./routes/${i}/models.js`)],
      component: () => import(`./routes/${i}`),
    })
  })

  const smkIntroduce = queryURL('smkIntroduce');

//return(<Avatar src={`http://192.168.23.212/${text}`} />);
  return (
    <ConnectedRouter history={history}>
      <App>
        <Switch>

          <Route exact path="/" render={() => (<Redirect to={`${smkIntroduce}`} />)} />
          {
            routes.map(({ path, ...dynamics }, key) => (
              <Route key={key}
                exact
                path={path}
                component={dynamic({
                  app,
                  ...dynamics,
                })}
              />
            ))
          }
          <Route component={error} />
        </Switch>
      </App>
    </ConnectedRouter>
  )
}

Routers.propTypes = {
  history: PropTypes.object,
  app: PropTypes.object,
}

export default Routers
