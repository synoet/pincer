import React from 'react';
import Header from './Header';

type LayoutProps = {
  children: any;
}

export default function Layout({children}: LayoutProps) {
  return (
    <div className="w-screen min-h-screen flex flex-col items-center bg-gray-500">
      <Header />
      {children}
    </div>
  )
}
