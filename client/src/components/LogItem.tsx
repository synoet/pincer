import React, {useState} from 'react';
import {FcComboChart as LogIcon} from 'react-icons/fc'

type CompletionLog = {
  input: string, 
  language: string, 
  suggestion: string, 
  taken: boolean,
};

type TimerLog = {
  name: string,
  timeTaken: string,
}

type LogItemProps = {
  id: string,
  sessionId: string,
  timeStamp: string,
  completionLogs: Array<CompletionLog>
  timerLogs: Array<TimerLog>
  taken: boolean,
};

export default function LogItem({
  id,
  sessionId,
  timeStamp,
  completionLogs,
  timerLogs,
  taken,
}: LogItemProps){

  const [expanded, setExpanded] = useState<boolean>(false);
  console.log(timerLogs);

  const CompletionLog = ({input, language, suggestion, taken}: any) => (
    <div className="w-full flex flex-col items-start gap-2 text-slate-300">
      <div className="w-full flex items-center justify-between">
        <p><span className="font-bold">Completion in</span> <span className="font-bold text-cyan-600">{language.toUpperCase()}</span></p>
        <p className="text-slate-400">Time from Keystroke: <span className="text-slate-200">{timerLogs[0].timeTaken}ms</span> </p>
        <p>Taken: <span className='font-bold text-slate-100'>{taken ? 'True': 'False'}</span></p>
      </div>
      <div className="flex flex-col items-center w-full gap-2">
        <p className="font-bold w-full">Input:</p>
        <p className="bg-slate-700/50 p-3 rounded-sm w-full">{input}</p>
      </div>
      <div className="flex flex-col items-center w-full gap-2">
        <p className="font-bold w-full">Suggestion:</p>
        <p className="bg-slate-700/50 p-3 rounded-sm w-full overflow-hidden">{suggestion}</p>
      </div>
    </div>
  )

  return (
    <div className="w-full flex flex-col items-center 
      justify-between bg-slate-800/50 border
      border-slate-700  "
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-colp-4 text-slate-300 hover:bg-slate-800 rounded-md
      cursor-pointer p-4">
        <div className="w-full flex gap-2 items-center text-slate-300">
          <LogIcon />
          <p>Log <span className="text-cyan-600">[{id}]</span></p>
        </div>
        <p>{timeStamp}</p>
      </div>
      {expanded && (
        <div className="w-full bg-slate-800/80 border-t border-slate-600 p-4">
          <CompletionLog {...completionLogs[0]} />
        </div>
      )}
    </div>
  )
}
