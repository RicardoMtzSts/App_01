import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/renderer/App';

describe('App', () => {
  it('muestra el mensaje de bienvenida', () => {
    render(<App />);
    expect(screen.getByText('¡Bienvenido a GraphOS!')).toBeInTheDocument();
    expect(screen.getByText(/organizar y visualizar ideas/i)).toBeInTheDocument();
  });
});
