import { Signale } from 'signale';

const options = {
  types: {
    custom: {
      badge: '🔧',
      color: 'blue',
      label: 'custom',
      logLevel: 'info',
    },
  },
  scope: 'gitRAG',
};

export const log = new Signale(options);