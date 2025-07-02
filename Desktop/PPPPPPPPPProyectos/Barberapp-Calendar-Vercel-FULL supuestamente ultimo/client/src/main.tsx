
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('🚀 Starting BarberApp Calendar...');

// Clear any existing React errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('🔥 Global error caught:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('🔥 Unhandled promise rejection:', event.reason);
  });
}

// Proper Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          fontFamily: 'system-ui, sans-serif',
          background: '#f5f5f5',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>
            ¡Ups! Algo salió mal
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Ha ocurrido un error inesperado en la aplicación
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: system-ui;">
      <h1 style="color: #dc2626;">Error de inicialización</h1>
      <p>No se pudo encontrar el elemento root. Por favor, recarga la página.</p>
    </div>
  `;
} else {
  console.log('Root element found, creating React app...');
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}
