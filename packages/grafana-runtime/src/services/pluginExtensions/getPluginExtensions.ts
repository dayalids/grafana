import { type PluginExtension, type PluginExtensionLink, type PluginExtensionElement } from '@grafana/data';

import { isPluginExtensionElement, isPluginExtensionLink } from './utils';

export type GetPluginExtensions<T = PluginExtension> = ({
  extensionPointId,
  context,
}: {
  extensionPointId: string;
  context?: object | Record<string | symbol, unknown>;
}) => {
  extensions: T[];
};

let singleton: GetPluginExtensions | undefined;

export function setPluginExtensionGetter(instance: GetPluginExtensions): void {
  // We allow overriding the registry in tests
  if (singleton && process.env.NODE_ENV !== 'test') {
    throw new Error('setPluginExtensionGetter() function should only be called once, when Grafana is starting.');
  }
  singleton = instance;
}

function getPluginExtensionGetter(): GetPluginExtensions {
  if (!singleton) {
    throw new Error('getPluginExtensionGetter() can only be used after the Grafana instance has started.');
  }
  return singleton;
}

export const getPluginExtensions: GetPluginExtensions = (options) => getPluginExtensionGetter()(options);

export const getPluginLinkExtensions: GetPluginExtensions<PluginExtensionLink> = (options) => {
  const { extensions } = getPluginExtensionGetter()(options);

  return {
    extensions: extensions.filter(isPluginExtensionLink),
  };
};

export const getPluginElementExtensions: GetPluginExtensions<PluginExtensionElement> = (options) => {
  const { extensions } = getPluginExtensionGetter()(options);

  return {
    extensions: extensions.filter(isPluginExtensionElement),
  };
};
