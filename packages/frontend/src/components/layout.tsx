import { ReactNode } from 'react';
import { Content } from './content';
import { Header } from './header';
import { OverlaySpinner } from './overlaySpinner';

export const Layout = ({ children }: { children: ReactNode }) => (
  <>
    <Header />
    <Content>{children}</Content>
    <OverlaySpinner isActive={false} />
  </>
);
