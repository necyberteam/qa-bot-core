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
      qaEndpoint={props.qaEndpoint}
      ratingEndpoint={props.ratingEndpoint}
      welcomeMessage={props.welcomeMessage}
      primaryColor={props.primaryColor}
      secondaryColor={props.secondaryColor}
      botName={props.botName}
      logo={props.logo}
      placeholder={props.placeholder}
      errorMessage={props.errorMessage}
    />
  );
});

App.displayName = 'App';

export default App;
