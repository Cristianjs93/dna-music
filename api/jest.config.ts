import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  watchman: false,
  moduleNameMapper: {
    '^#/(.*)$': '<rootDir>/$1',
    '^#generated/prisma$': '<rootDir>/../generated/prisma',
    '^#generated/prisma/(.*)$': '<rootDir>/../generated/prisma/$1',
    '^#util/(.*)$': '<rootDir>/util/$1',
    '^#db/(.*)$': '<rootDir>/../prisma/$1',
  },
};

export default config;
