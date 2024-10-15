type AppSelectorDefinitionLeaf = { selector: string };

function isAppSelectorDefinitionLeaf(value: unknown): value is AppSelectorDefinitionLeaf {
  return !!value && typeof value === 'object' && 'selector' in value;
}

interface AppSelectorDefinition {
  [key: string]: AppSelectorDefinitionLeaf | AppSelectorDefinition;
}

export class ElementSelector {
  constructor(readonly selector: string) {}

  toClass(): string {
    if (this.selector[0] !== '.') {
      throw new Error('Selector must be a class selector and must start with a dot');
    }
    // Remove the leading dot and replace all remaining dots with spaces
    return this.selector.slice(1).replace(/\./g, ' ');
  }
}

type ToAppSelectors<T extends AppSelectorDefinition> = {
  [K in keyof T]: T[K] extends AppSelectorDefinitionLeaf
    ? ElementSelector
    : T[K] extends AppSelectorDefinition
      ? ToAppSelectors<T[K]>
      : never;
};

export const buildAppSelectors = <T extends AppSelectorDefinition>(definition: T): ToAppSelectors<T> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectors = {} as any;

  Object.entries(definition).forEach(([key, value]) => {
    if (isAppSelectorDefinitionLeaf(value)) {
      selectors[key] = new ElementSelector(value.selector);
    } else {
      selectors[key] = buildAppSelectors(value);
    }
  });

  return selectors;
};
