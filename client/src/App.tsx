import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {AiOutlineReload} from 'react-icons/ai';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:8000/logs`)
      .then((res) => {
        if (res.data){
          console.log(res.data);
          setLogs(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [refresh])

  const CompletionLog = ({language, suggestion, input, taken}: any) => (
    <div className="w-full p-4 flex flex-col gap-4 bg-slate-300 border border-slate-400 rounded-sm mt-4">
      <div className="flex items-center gap-2">
        <p><span className="font-bold">Language:</span>  </p>
        <p className="bg-indigo-500 w-6 h-6 rounded-full text-white flex items-center justify-center font-bold">{language.toUpperCase()}</p>
      </div>
      <p className='font-bold'>Input:</p>
      <p className="bg-slate-200 p-4 rounded-sm">{input}</p>
      <p> Suggestion:</p>
      <p className="bg-slate-200 p-4 rounded-sm">{suggestion}</p>
    </div>
  )

  const Log = ({log, index}: any) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full border border-slate-300 bg-slate-200 rounded-sm "
      >
        <div className="w-full p-4 flex items-center justify-between hover:bg-slate-300 cursor-pointer" >
          <p className="text-md"> Log({index})</p>
          <p className="text-md"> {log.timeStamp} </p>
        </div>

        {!isCollapsed && (
          <>
            <div className="w-full p-4 border-t mt-4 mb-2 border-slate-300 h-2" />

            <p className="ml-4"> Completion Logs: </p>
            <div className="w-full flex flex-col gap-2 p-4">
              {log.completionLogs.length > 1 ? 
                log.completionLogs.map((completionLog: any, index: number) => (
                  <CompletionLog {...completionLog} />
              )): (
                <CompletionLog {...log.completionLogs[0]} />
              )}

            </div>
          </>
        )}

      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mt-4 text-indigo-500"> 🖌️ Davinci Logs</h1>

      <div className="w-7/12 p-4 border border-slate-300 bg-slate-200 rounded-sm flex items-center justify-between mt-6">
        <p className="text-xl">Log List </p>
        <button
          onClick={() => setRefresh(refresh + 1)}
          className="flex items-center justify-center gap-2 text-xl"
        >
          <AiOutlineReload />
          Reload
        </button>
      </div>

      <div className="w-7/12 flex flex-col items-center justify-center gap-4 mt-6 pb-16">
        {logs && logs.map((log: any, index) => (
          <Log log={log} index={index} />
        ))}
      </div>
    </div>
  );
}

export default App;
