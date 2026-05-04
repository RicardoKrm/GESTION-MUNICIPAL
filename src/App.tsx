/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StoreProvider, useStore } from './lib/StoreContext';
import Login from './components/Login';
import FuncionarioDashboard from './components/FuncionarioDashboard';
import AlcaldeDashboard from './components/AlcaldeDashboard';
import VecinoDashboard from './components/VecinoDashboard';

function AppContent() {
  const { currentUser } = useStore();

  if (!currentUser) {
    return <Login />;
  }

  if ('role' in currentUser && currentUser.role === 'alcalde') {
    return <AlcaldeDashboard />;
  }

  if ('role' in currentUser && currentUser.role === 'vecino') {
    return <VecinoDashboard />;
  }

  // Funcionario and Jefe Depto share the same basic layout but different permissions
  return <FuncionarioDashboard />;
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

