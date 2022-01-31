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
};

export default function LogItem({
  id,
  sessionId,
  timeStamp,
  completionLogs,
  timerLogs,
}: LogItemProps){

  const [expanded, setExpanded] = useState<boolean>(false);
  console.log(completionLogs);

  const CompletionLog = ({input, language, suggestion, taken}: any) => (
    <div className="w-full flex flex-col items-start gap-2">
      <p><span className="font-bold">Completion in</span> <span className="font-bold text-cyan-600">{language.toUpperCase()}</span></p>
      <div className="flex flex-col items-center w-full gap-2">
        <p className="font-bold w-full">Input:</p>
        <p className="bg-slate-200/50 p-3 rounded-md w-full">{input}</p>
      </div>
      <div className="flex flex-col items-center w-full gap-2">
        <p className="font-bold w-full">Suggestion:</p>
        <p className="bg-slate-200/50 p-3 rounded-md w-full overflow-hidden">{suggestion}</p>
      </div>
    </div>
  )

  return (
    <div className="w-full flex flex-col items-center 
      justify-between bg-slate-100/50 border
      border-slate-200  "
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-colp-4 hover:bg-slate-100 rounded-md
      cursor-pointer p-4">
        <div className="w-full flex gap-2 items-center">
          <LogIcon />
          <p>Log <span className="text-cyan-600">[{id}]</span></p>
        </div>
        <p>{timeStamp}</p>
      </div>
      {expanded && (
        <div className="w-full bg-slate-100/80 border-t border-slate-200 p-4">
          <CompletionLog {...completionLogs[0]} />
        </div>
      )}
    </div>
  )
}
