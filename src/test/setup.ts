import '@testing-library/jest-dom'

// Mock animations for testing
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    animationDuration: '0s',
    transitionDuration: '0s',
  }),
})