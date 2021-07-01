import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import lodable from '@loadable/component';
const LogIn = lodable(() => import('@pages/LogIn'));
const SignUp = lodable(() => import('@pages/SignUp'));

const App = () => {
  return (
    <Switch>
      <Redirect exact path="/" to="/login" />
      <Route path="/login" component={LogIn} />
      <Route path="/signup" component={SignUp} />
    </Switch>
  );
};

export default App;
