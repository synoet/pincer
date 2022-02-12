import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {serverurl} from '../config';
import Layout from '../components/Layout';
import SessionItem from '../components/SessionItem';

export default function Home() {

  const [sessions, setSessions] = useState<any>(undefined);

  useEffect(() => {
    axios.get(`${serverurl}/session`)
      .then((res) => {
        if (res.data) {
          setSessions(res.data);
        }
      })

  }, []);

  return (
    <Layout>
      <div className="w-7/12 flex flex-col gap-8">
        <h2 className="text-2xl text-indigo-700 mt-10">Recent Sessions </h2>
        <div className="grid grid-cols-2 gap-4">
          {sessions && sessions.map((session: any, index: number) => (
            <SessionItem {...session} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
