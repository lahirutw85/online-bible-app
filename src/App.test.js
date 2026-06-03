// Virtually mock the Ant Design component locale picker that caused Jest to fail
jest.mock('@rc-component/picker/locale/en_US', () => ({
  default: {}
}), { virtual: true });

jest.mock('@rc-component/picker/generate/dayjs', () => ({
  default: {}
}), { virtual: true });

// Mock matchMedia for Ant Design components
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

import { render, screen, act } from '@testing-library/react';
import App from './App';

test('renders app header subtitle', async () => {
  await act(async () => {
    render(<App />);
  });
  const subtitleElement = screen.getByText(/ශුද්ධ වූ බයිබලය/i);
  expect(subtitleElement).toBeInTheDocument();
});

