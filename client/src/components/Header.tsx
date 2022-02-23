import React from 'react';
import {useHistory} from 'react-router-dom';
import {FcLinux} from 'react-icons/fc';

export default function Header(){
  const history = useHistory();

  return (
    <div className="w-screen border-b border-orange flex items-center justify-center">
      <div className="w-7/12 flex items-start justify-between pb-4 pt-4">
        <div
          onClick={() => history.push('/')}
          className="flex items-center text-slate-300 gap-2 text-2xl cursor-pointer">
          <FcLinux />
          <h1 className="font-bold"> Davinci </h1>
        </div>
        <div className="flex items-center gap-8">
          <p
            className="text-slate-300 hover:text-slate-200 cursor-pointer"
            onClick={() => history.push('/')}> Dashboard </p>
          <p
            className="text-slate-300 hover:text-slate-200 cursor-pointer"
            onClick={() => history.push('/users')}> Users </p>
          <p 
            className="text-slate-300 hover:text-slate-200 cursor-pointer"
            onClick={() => history.push('/sessions')}> Sessions </p>
          <p
            className="text-slate-300 hover:text-slate-200 cursor-pointer"
            onClick={() => history.push('/visuals')}> Visuals </p>
        </div>
      </div>
    </div>
  )
}
