import React from 'react';

const TestePage = () => {
  console.log('TestePage: Componente carregado');
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'yellow', minHeight: '100vh' }}>
      <h1>TESTE - Página Funcionando!</h1>
      <p>Se você está vendo isto, o roteamento está funcionando.</p>
      <p>URL atual: {window.location.href}</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
};

export default TestePage;
