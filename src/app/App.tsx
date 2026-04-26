import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { PageActionsProvider } from '../shared/contexts/PageActionsContext';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <PageActionsProvider>
        <RouterProvider router={router} />
      </PageActionsProvider>
    </ErrorBoundary>
  );
}
