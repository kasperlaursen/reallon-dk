import "@testing-library/jest-dom/vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

Object.defineProperties(HTMLElement.prototype, {
  scrollIntoView: {
    writable: true,
    value: () => {},
  },
  hasPointerCapture: {
    writable: true,
    value: () => false,
  },
  setPointerCapture: {
    writable: true,
    value: () => {},
  },
  releasePointerCapture: {
    writable: true,
    value: () => {},
  },
});
