import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { addLocale, locale, PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-dark-amber/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import App from './App';
import { ToastProvider } from './components/providers/ToastProvider';
import { store } from './store';
import './index.css';

addLocale('es', {
  accept: 'Sí',
  reject: 'No',
  choose: 'Elegir',
  upload: 'Subir',
  cancel: 'Cancelar',
  emptyFilterMessage: 'Sin resultados',
  emptyMessage: 'Sin registros',
});

locale('es');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PrimeReactProvider>
        <ToastProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </PrimeReactProvider>
    </Provider>
  </StrictMode>,
);
