import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { PageActionsProvider } from '../shared/contexts/PageActionsContext';

export function App() {
  return (
    <PageActionsProvider>
      <RouterProvider router={router} />
    </PageActionsProvider>
  );
}
