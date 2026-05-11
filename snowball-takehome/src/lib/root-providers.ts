import { Platform } from 'react-native';
import type { PropsWithChildren, ReactElement } from 'react';

type RootProvidersModule = {
  RootProviders: (props: PropsWithChildren) => ReactElement;
};

const rootProvidersModule: RootProvidersModule =
  Platform.OS === 'web'
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ? require('./root-providers.web')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    : require('./root-providers.native');

export const RootProviders = rootProvidersModule.RootProviders;
