import React from 'react';
import Header from './Header';

type LayoutProps = {
  children: any;
}

export default function Layout({children}: LayoutProps) {
  return (
    <div className="w-screen flex flex-col items-center justify-center gap-8">
      <Header />
      <div className="w-7/12">
        {children}
      </div>
    </div>
  )
}
