import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import Home from './pages/Home';
import Session from './pages/Session';

function App() {

  return (
    <Router>
      <Switch>
        <Route exact={true} path='/'>
          <Home />
        </Route>
        <Route exact={true} path='/session'>
          <Session />
        </Route>
      </Switch>
    </Router> 
  )

}
export default App;
