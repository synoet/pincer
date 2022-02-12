import React, {ReactElement} from 'react';
import { FcSms, FcElectricalThreshold, FcClock} from 'react-icons/fc';
import {useHistory} from 'react-router-dom';

type SessionItemProps = {
  sessionId: string,
  startTime: string,
  lastPing: string,
}

export default function SessionItem({
  sessionId, 
  startTime,
  lastPing,
}: SessionItemProps): ReactElement {
  const history = useHistory();

  return (
    <div className="w-full flex flex-col cursor-pointer text-slate-300 hover:text-indigo-400
      rounded-md p-2 border border-slate-700 bg-slate-800/60 hover:bg-slate-800/80"
      onClick={() => history.push(`/session?id=${sessionId}`)}
    >
      <div className="flex gap-1 items-center text-lg">
        <FcElectricalThreshold />
        <p>{sessionId}</p>
      </div>
      <div className="w-full flex items-center gap-4 text-slate-400 text-md">
        <div className="flex gap-1 items-center">
          <FcClock />
          <p>Length: 10 min</p>
        </div>
        <div className="flex gap-1 items-center">
          <FcSms />
          <p>Logs: 100 </p>
        </div>
      </div>
    </div>
  )
}
