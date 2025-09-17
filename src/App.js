/**
 * Wrapper component used by the qaBot() JavaScript API
 */
import React from 'react';
import './App.css';
import QABot from './components/QABot';

const App = React.forwardRef((props, ref) => {
  return (
    <QABot
      ref={ref}
      apiKey={props.apiKey}
      defaultOpen={props.defaultOpen}
      embedded={props.embedded}
      enabled={props.enabled}
      loginUrl={props.loginUrl}
      onClose={props.onClose}
      welcome={props.welcome}
      userEmail={props.userEmail}
      userName={props.userName}
    />
  );
});

App.displayName = 'App';

export default App;
