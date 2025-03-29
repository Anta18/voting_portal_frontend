import type { Config } from 'jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { useESM: true }],
  },
  transformIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        ...compilerOptions,
        jsx: 'react-jsx', // override for testing
      },
    },fetch: global.fetch,
  },
  roots: ['<rootDir>/src'],setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

};

export default config;
