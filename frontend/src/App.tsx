import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import apolloClient from './services/api/apolloClient';
import { AppProvider } from './store';
import ARExperiencePage from './pages/ARExperiencePage';
import POIDetailPage from './pages/POIDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  #root {
    width: 100%;
    height: 100vh;
  }
`;

const HomePage: React.FC = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>AR Tourism App</h1>
      <p style={{ marginTop: '20px' }}>
        Welcome to the AR Tourism Experience! Click the button below to start
        exploring.
      </p>
      <button
        onClick={() => (window.location.href = '/ar')}
        style={{
          marginTop: '30px',
          padding: '15px 30px',
          fontSize: '18px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Start AR Experience
      </button>
    </div>
  );
};

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AppProvider>
        <GlobalStyle />
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/ar" element={<ARExperiencePage />} />
            <Route path="/poi/:id" element={<POIDetailPage />} />
          </Routes>
        </Router>
      </AppProvider>
    </ApolloProvider>
  );
}

export default App;
