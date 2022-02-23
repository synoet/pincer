import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {serverurl} from '../config';
import Layout from '../components/Layout';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

export default function Home() {

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const [chartRange, setChartRange] = useState<any>(undefined);
  const [sessionData, setSessionsData] = useState<any>(undefined);
  const [logsData, setLogsData] = useState<any>(undefined);
  const [usersData, setUsersData] = useState<any>(undefined);

  const [sessionStats, setSessionStats] = useState<any>(undefined);
  const [userStats, setUserStats] = useState<any>(undefined);
  const [logStats, setLogStats] = useState<any>(undefined);

  // fetch statistics
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

  // session  & log data for chart
  useEffect(() => {
    let dateRange: any = [];
    axios.get(`${serverurl}/sessions`)
      .then((res) => {
        if (res.data) {
          let dates: any = res.data.map((session:any) => {
            let date = new Date(session.startTime);
            return `${date.getMonth() + 1}/${date.getDate()}`
          });
          dates = new Set(dates);
          dateRange = [...dates].sort((a, b) => parseInt(a.split('/')[1]) - parseInt(b.split('/')[1]));

          let sessionValues = dateRange.map((date: any) => res.data.filter((session: any) => {
            let sessionDate = new Date(session.startTime);
            if (`${sessionDate.getMonth() + 1}/${sessionDate.getDate()}` === date){
              return session;
            }
          }).length);
          setChartRange(dateRange);
          setSessionsData(sessionValues)
        }
      })
    axios.get(`${serverurl}/logs`)
      .then((res) => {
        if (res.data){
          let logValues = dateRange.map((date: any) => res.data.filter((log: any) => {
            let logDate = new Date(log.timeStamp);
            if (`${logDate.getMonth() + 1}/${logDate.getDate()}` === date){
              return log;
            }
          }).length);

          let takenLogValues = dateRange.map((date: any) => res.data.filter((log:any) => log.completionLogs && log.completionLogs[0]?.taken).filter((log: any) => {
            let logDate = new Date(log.timeStamp);
            if (`${logDate.getMonth() + 1}/${logDate.getDate()}` === date){
              return log;
            }
          }).length);

          setLogsData({
            logValues,
            takenLogValues,
          });
        }
      })
  }, [])



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
        <h2 className="text-3xl text-transparent mt-10 font-bold bg-gradient-to-r from-yellow to-orange/70 bg-clip-text">Daily Usage</h2>
        <div className="text-white border-orange border-2 rounded-md p-4">
        {sessionData && chartRange && logsData && (
          <Line
            options={{
               scales: {
                  x: {
                    grid: {
                      color: '#8a9199CC', 
                    }
                  },
                  y: {
                    grid: {
                      drawBorder: false,
                      color: '#8a9199CC', 
                    },
                  }
                }
            }}
            data = {{
              labels: chartRange,
              datasets: [
                {
                  label: "Sessions",
                  data: sessionData,
                  borderColor: '#FFD173',
                },
                {
                  label: "Suggestions",
                  data: logsData.logValues,
                  borderColor: '#ED9366',
                },
                {
                  label: "Suggestions taken",
                  data: logsData.takenLogValues,
                  borderColor: '#87d96c',
                }
                
              ]
            }}
          />
        )}
      </div>
      </div>
    </Layout>
  )
}
