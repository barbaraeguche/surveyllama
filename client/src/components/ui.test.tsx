import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './ui';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Click Me</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
