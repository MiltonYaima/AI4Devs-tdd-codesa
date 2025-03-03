module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  modulePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/frontend/build/', '<rootDir>/backend/dist/'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/frontend/build/', '<rootDir>/backend/dist/', '<rootDir>/README.md'],
};
