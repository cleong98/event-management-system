import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// jest-dom matchers are automatically extended when imported above

// Cleanup after each test
afterEach(() => {
  cleanup();
});
