import React from 'react';
import Home from './views/Home';
import Crawling from './views/Crawler';
import Nav from './components/nav';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css'; // Importa tu archivo de estilos CSS aquí

function App() {
  return (
    <div className="app-container">
      <Nav />
      <Router>
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/crawler' exact component={Crawling} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
