import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {serverurl} from '../config';
import Layout from '../components/Layout';

export default function Home() {
  const [sessionStats, setSessionStats] = useState<any>(undefined);
  const [userStats, setUserStats] = useState<any>(undefined);
  const [logStats, setLogStats] = useState<any>(undefined);

  useEffect(() => {
    
    axios.get(`${serverurl}/session/stats`)
      .then((res) => {
        if (res.data) {
          setSessionStats(res.data);
        }
      });
    
    axios.get(`${serverurl}/users/stats`)
      .then((res) => {
        if (res.data) {
          setUserStats(res.data);
        }
      });

    axios.get(`${serverurl}/logs/stats`)
      .then((res) => {
        if (res.data) {
          setLogStats(res.data);
        }
      });


  }, []);

  const Highlight = ({children}: any) => (
    <span className="text-yellow font-bold">
      {children}
    </span>
  )


  return (
    <Layout>
      <div className="w-7/12 flex flex-col gap-8">
        <h2 className="text-3xl text-transparent mt-10 font-bold bg-gradient-to-r from-yellow to-orange/70 bg-clip-text">Statistics</h2>
        <div className="grid grid-cols-3 gap-6">
          {sessionStats && (
            <div className="w-full cols-span-1 text-white p-1 bg-gradient-to-bl from-orange to-orange/50 rounded-md">
              <div className="flex flex-col w-full h-full bg-background rounded-md p-4 gap-2">
                <h1 className="font-bold text-2xl text-transparent bg-gradient-to-r bg-clip-text from-white to-white/70">Sessions</h1>
                <div className="w-full">
                  <p className="text-gray opacity-70">Total Session Time: </p>
                  <p className="text-2xl"><Highlight>{sessionStats?.totalTime / 3600}</Highlight> Minutes</p>
                </div>
                <div className="w-full">
                  <p className="text-gray opacity-70">Number of Sessions Opened:</p>
                  <p className="text-2xl"><Highlight>{sessionStats?.totalSessions}</Highlight> Sessions</p>
                </div>
                <div className="w-full">
                  <p className="text-gray opacity-70">Average Session Time:</p>
                  <p className="text-2xl"><Highlight>{sessionStats?.averageSessionTime}</Highlight> ms</p>
                </div>
              </div>
            </div>
          )}

          {userStats && (
            <div className="w-full cols-span-1 text-white p-1 bg-gradient-to-br from-orange to-orange/50 rounded-md">
              <div className="flex flex-col w-full h-full bg-background rounded-md p-4 gap-2">
                <h1 className="font-bold text-2xl text-transparent bg-gradient-to-r bg-clip-text from-white to-white/70">Users</h1>
                <div className="w-full">
                  <p className="text-gray opacity-70">Total Users: </p>
                  <p className="text-xl"><Highlight>{userStats.users}</Highlight> Users</p>
                </div>
                <div className="w-full">
                  <p className="text-gray opacity-70">Activated Users:</p>
                  <p className="text-2xl"><Highlight>{userStats.activatedUsers}</Highlight> Users</p>
                </div>
                <div className="w-full">
                  <p className="text-gray opacity-70">Percent of Users Activated:</p>
                  <p className="text-2xl"><Highlight>{userStats.percentActivated}%</Highlight> Activated</p>
                </div>
              </div>
            </div>
          )}

          {logStats && (
            <div className="w-full cols-span-1 text-white p-1 bg-gradient-to-br from-orange to-orange/50 rounded-md">
              <div className="flex flex-col w-full h-full bg-background rounded-md p-4 gap-2">
                <h1 className="font-bold text-2xl text-transparent bg-gradient-to-r bg-clip-text from-white to-white/70">Completions</h1>
                <div className="w-full">
                  <p className="text-gray opacity-70">Suggestions Given: </p>
                  <p className="text-2xl"><Highlight>{logStats.logs}</Highlight> Suggestions</p>
                </div>
                <div className="w-full">
                  <p className="text-gray opacity-70">Completions Taken:</p>
                  <p className="text-2xl"><Highlight>{logStats.taken}</Highlight> Taken</p>
                </div>
                <div className="w-full">
                  <p className="text-gray opacity-70">Percent of Suggestions taken:</p>
                  <p className="text-2xl"><Highlight>{logStats.percentageTaken}%</Highlight> Taken</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
