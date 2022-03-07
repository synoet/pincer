import React, {ReactElement} from 'react';
import { FcSms, FcElectricalThreshold, FcClock} from 'react-icons/fc';
import {useHistory} from 'react-router-dom';
import {getRelative} from '../utils/time';

type SessionItemProps = {
  sessionId: string,
  startTime: Date,
  latestPing: Date,
}

export default function SessionItem({
  sessionId, 
  startTime,
  latestPing,
}: SessionItemProps): ReactElement {
  const history = useHistory();
  const time = getRelative(startTime, latestPing);

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
          <p>Length: {time} {time > 1 ? 'Minutes' : 'Minute'}</p>
        </div>
        <div className="flex gap-1 items-center">
          <FcSms />
          <p>Logs: 100 </p>
        </div>
      </div>
    </div>
  )
}
