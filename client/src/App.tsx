import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import Home from './pages/Home';

function App() {

  return (
    <Router>
      <Switch>
        <Route exact={true} path='/'>
          <Home />
        </Route>
        <Route exact={true} path='/users'>
       </Route>
      </Switch>
    </Router> 
  )

}
export default App;
