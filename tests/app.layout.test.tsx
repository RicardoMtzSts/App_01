import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/renderer/App';

describe('App navegación y paneles', () => {
  it('muestra la pantalla de bienvenida inicialmente', () => {
    render(<App />);
    expect(screen.getByText('¡Bienvenido a GraphOS!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /comenzar/i })).toBeInTheDocument();
  });

  it('navega al layout principal al hacer click en Comenzar', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /comenzar/i }));
    expect(screen.getByText('¡Panel Central!')).toBeInTheDocument();
    expect(screen.getByText('Panel Derecho')).toBeInTheDocument();
    expect(screen.getByText('GraphOS')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inicio/i })).toBeInTheDocument();
  });
});
