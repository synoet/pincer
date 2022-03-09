import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {serverurl} from '../config';
import axios from 'axios';
import Layout from '../components/Layout';

export default function Session(){
  const [session, setSession] = useState<any>();
  const [logs, setLogs] = useState<any>();
  const search = useLocation().search
  const sessionId = new URLSearchParams(search).get('sessionId');

  useEffect(() => {
    if(!sessionId) return;

    axios.get(`${serverurl}/sessions/${sessionId}`)
      .then((res) => {
        if(res.data){
          setSession(res.data);
        }
      })

    axios.get(`${serverurl}/logs/session/${sessionId}`)
      .then((res) => {
        if(res.data){
          console.log(res.data);
          setLogs(res.data);
        }
      })
  }, [sessionId])

  return (
    <Layout>
      <div className="w-7/12 flex flex-col gap-8">
        <h1 className="mt-8 text-2xl text-white font-bold">Session Id: {sessionId}</h1>
        <h1 className="text-xl text-white">Logs: </h1>
        {logs && logs.map((log: any, index: number) => (
          <div key={`${index}-${log.timeStamp}`} className='flex bg-gray-400 border-gray-200 border flex-col w-full p-4 text-white gap-2'>
            <p>{log.timeStamp}</p>
            <p>Language: {log.completionLogs[0].language}</p>
            <p>Input: {log.completionLogs[0].input}</p>
            <p>Suggestion: {log.completionLogs[0].suggestion}</p>
            <p>Taken: {log.completionLogs[0].taken ? 'Taken' : 'Not Taken'}</p>
            <p>Time From Keystoke: {log.timerLogs[0].timeTaken}ms</p>
          </div>
        ))}
      </div>
    </Layout>
  )
}
