import React from 'react';

export default function Header(){

  return (
    <div className="w-screen border-b border-slate-200 flex items-center justify-center">
      <div className="w-7/12 flex items-start justify-between p-4">
        <h1> Davinci </h1>
        <div className="flex items-center gap-4">
          <p> Dashboard </p>
          <p> Users </p>
          <p> Sessions </p>
          <p>Visuals </p>
        </div>
      </div>
    </div>
  )
}
