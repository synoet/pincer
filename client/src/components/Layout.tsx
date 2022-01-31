import React from 'react';
import Header from './Header';

type LayoutProps = {
  children: any;
}

export default function Layout({children}: LayoutProps) {
  return (
    <div className="w-screen flex flex-col items-center justify-center">
      <Header />
      {children}
    </div>
  )
}
