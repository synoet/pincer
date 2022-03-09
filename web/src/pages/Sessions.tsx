import React, {useState, useEffect} from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import axios from 'axios';
import {serverurl} from '../config';
import {getRelative} from '../utils/time';

import Layout from '../components/Layout';

export default function Sessions(){
  const [sessions, setSessions] = useState<any>();
  const search = useLocation().search
  const userId = new URLSearchParams(search).get('userId');
  const history = useHistory();
  const [userSessions, setUserSessions] = useState<any>();

  useEffect(() => {
    if(!userId) return;

    axios.get(`${serverurl}/user`)
      .then((res) => {
        if(res.data){
          let [user] = res.data.filter((user : any) => user._id === userId);
          setUserSessions(user.sessions)
        }
      })
  }, [userId]);

  useEffect(() => {
    if (!userSessions || !sessions) return;
    let tempSessions = sessions.filter((session: any) => userSessions.includes(session.sessionId));
    setSessions(tempSessions);
  },[userSessions, sessions])

  useEffect(() => {
    axios.get(`${serverurl}/sessions`)
      .then((res) => {
        if (res.data){
          setSessions(res.data);
        }
      });
  }, [])
  
  return (
    <Layout>
      <div className="w-7/12 flex flex-col gap-8">
        <h1 className="text-white text-2xl mt-8 font-bold"> Sessions </h1>
        {sessions && (
          <div className="flex flex-col gap-4">
            {sessions.map((session: any) => {
              return (
                <div onClick={() => history.push(`/session?sessionId=${session.sessionId}`)} key={`${session.sessionId}`} 
                  className='flex w-full bg-gray-400 cursor-pointer hover:border-gray-100 rounded-sm border border-gray-300 p-4 justify-between text-white'>
                  <p>{session.sessionId}</p>
                  <p>{getRelative(session.startTime, session.latestPing)} minutes</p>
                </div>
            )})}
          </div>
        )}
      </div>
    </Layout>
  )
}
