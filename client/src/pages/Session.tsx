import React, {useEffect, useState} from 'react';
import { FcSms, FcElectricalThreshold, FcClock, FcUndo} from 'react-icons/fc';
import {useHistory} from 'react-router-dom';

import {useLocation} from 'react-router-dom';
import axios from 'axios';

import {serverurl} from '../config';
import Layout from '../components/Layout';
import LogItem from '../components/LogItem';

export default function Session() {
  const search = useLocation().search;
  const history = useHistory();
  const id = new URLSearchParams(search).get('id');

  const [logs, setLogs] = useState<any>(undefined);

  const [mode, setMode] = useState<string>("logs");

  useEffect(() => {
    if (id){
      axios.get(`${serverurl}/logs/session/${id}`)
        .then((res) => {
          console.log("SESSIOn", res.data);
          if (res.data){
            setLogs(res.data);
          }
        })
    }
  }, [])

  return (
    <Layout>
      <div className='w-full flex justify-center bg-slate-800/50 border-b border-slate-700 text-slate-200'>
        <div className="w-7/12 flex flex-col pt-8 gap-3 cursor-pointer">
          <div onClick={() => history.push("/")} className="flex gap-1 items-center text-md">
            <FcUndo />
            <p> Go Back </p>
          </div>
          <div className="flex gap-1 items-center text-2xl">
            <FcElectricalThreshold />
            <h1> Session <span className="text-indigo-600">[{id}]</span></h1>
          </div>
          <div className="w-full flex items-center gap-4 text-slate-200 text-md">
            <div className="flex gap-1 items-center">
              <FcClock />
              <p>Length: 10 min</p>
            </div>
            <div className="flex gap-1 items-center">
              <FcSms />
              <p>Logs: 100 </p>
            </div>
          </div>
          <div className="w-full flex items-center gap-4 mt-8">
            <div className="flex gap-1 items-center border-b-2 border-slate-500 pb-2 pl-4 pr-4 text-xl cursor-pointer">
              <p> Logs </p>
            </div>
            <div className="flex gap-1 items-center hover:border-b-2 border-slate-300 text-slate-500 pb-2 pl-4 pr-4 text-xl cursor-pointer">
              <p> Details </p>
            </div>
          </div>
        </div>
      </div>
      <div className='w-7/12 flex mt-8 flex-col items-center gap-5'>
        {logs && logs.map((log: any, index: number) => (
          <LogItem 
            id={log['_id']}
            {...log}
          />
  
        ))}
        {logs && logs.length === 0 && (
          <div className="w-full flex justify-center items-center p-12 border-2 border-dashed border-slate-400">
            <h1 className='text-2xl text-slate-500'> No Logs in this Session </h1>
          </div>
        )}
      </div>
    </Layout>
  )
} 
