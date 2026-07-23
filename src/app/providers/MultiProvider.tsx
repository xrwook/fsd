import type { PropsWithChildren, ReactElement, ReactNode } from "react";
import { cloneElement } from "react";

const chainAsChildren = (children: ReactNode, component: ReactElement) => {
  return cloneElement(component, undefined, children);
};

type MultiProviderProps = PropsWithChildren<{
  providers: ReactElement[];
}>;

const MultiProvider = ({ children, providers }: MultiProviderProps) => {
  const wrappedChildren = providers.reduceRight<ReactNode>(
    (currentChildren, provider) => chainAsChildren(currentChildren, provider),
    children,
  );

  return <>{wrappedChildren}</>;
};

export default MultiProvider;
