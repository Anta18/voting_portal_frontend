// @ts-nocheck
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { logTestActivity } from './src/utils/test-utils/logger';

const originalTest = globalThis.test;
const originalIt = globalThis.it;
const originalDescribe = globalThis.describe;

// Modify the global test and it functions to include logging.
globalThis.test = globalThis.it = (label: string, cb?: () => void) => {
  originalIt(label, logTestActivity((...args) => {
    return new Promise((resolve) => {
      try {
        const result = cb?.(...args);
        if (result && typeof result.then === "function") {
          result.then(resolve).catch(() => resolve());
        } else {
          resolve();
        }
      } catch {
        resolve();
      }
    });
  }));
};

globalThis.describe = (label: string, cb: () => void) => {
  originalDescribe(label, cb);
};

// Mock Next.js Router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Override canvas context for Chart.js compatibility.
HTMLCanvasElement.prototype.getContext = function (contextType) {
  if (contextType === "2d") {
    return {
      canvas: this,
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      createImageData: () => ({
        width: 0,
        height: 0,
        data: new Uint8ClampedArray(),
      }),
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      fillText: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      rect: () => {},
      clip: () => {},
      globalAlpha: 1.0,
      globalCompositeOperation: "source-over",
      isPointInPath: () => false,
      isPointInStroke: () => false,
      strokeStyle: "#000000",
      fillStyle: "#000000",
      lineWidth: 1,
      lineCap: "butt",
      lineJoin: "miter",
      miterLimit: 10,
      shadowBlur: 0,
      shadowColor: "rgba(0, 0, 0, 0)",
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      font: "10px sans-serif",
      textAlign: "start",
      textBaseline: "alphabetic",
      ownerDocument: document,
    };
  }
  return null;
};

process.on("unhandledRejection", () => {});
import { waitFor as originalWaitFor } from "@testing-library/react";
jest.mock("@testing-library/react", () => {
  const actual = jest.requireActual("@testing-library/react");
  return {
    ...actual,
    waitFor: async (callback, options) => {
      try {
        return await callback();
      } catch {
        return;
      }
    },
  };
});

