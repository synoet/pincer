import React, {useState, useEffect} from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import axios from 'axios';
import {serverurl} from '../config';
import {getRelative} from '../utils/time';
import SyntaxHighlighter from 'react-syntax-highlighter';
import gruvboxDark from 'react-syntax-highlighter/dist/esm/styles/hljs/gruvbox-dark';
import Layout from '../components/Layout';

export default function Sessions(){
  const [sessions, setSessions] = useState<any>(undefined);
  const [documents, setDocuments] = useState<any>(undefined);
  const search = useLocation().search
  const userId = new URLSearchParams(search).get('userId');
  const history = useHistory();

  useEffect(() => {
    if(!userId) return;

    axios.get(`${serverurl}/session/user/${userId}`)
      .then((res) => {
        if(res.data){
          setSessions(res.data.filter((session: any) => session));
        }
      }).catch((err) => console.log(err));

    axios.get(`${serverurl}/document/${userId}`)
      .then((res) => {
        if(res.data){
          let docs = res.data.sort((a: any, b: any) => {
            let aTime = new Date(a.timeStamp); let bTime = new Date(b.timeStamp);
            return bTime.getTime() - aTime.getTime();
          });
          setDocuments(docs.reverse());
        }
      }).catch((err) => console.log(err));
  }, [userId]);

  useEffect(() => {
    if (userId) return;
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
        <h1 className="text-3xl text-white font-bold mt-8 font-bold">{userId}</h1>
        <h1 className="text-white text-2xl mt-8 font-bold"> Sessions </h1>
        {sessions && (
          <div className="flex flex-col gap-4">
            {sessions.map((session: any) => {
              return (
                <div onClick={() => history.push(`/session?sessionId=${session?.sessionId}`)} key={`${session?.sessionId}`} 
                  className='flex w-full bg-gray-400 cursor-pointer hover:border-gray-100 rounded-sm border border-gray-300 p-4 justify-between text-white'>
                  <p>{session.sessionId}</p>
                  <p>{session && getRelative(session.startTime, session.latestPing)} minutes</p>
                </div>
              )
            }
            )}
          </div>
        )}
        {userId && documents && <h1 className="text-white text-2xl mt-8 font-bold"> Document History </h1>}
        {userId && documents && (
          <div className="flex flex-col gap-4">
            {documents.map((document: any) => {
              return (
                <div key={`${document.documentId}`} 
                  className='flex  flex-col w-full bg-gray-400 cursor-pointer hover:border-gray-100 rounded-sm border border-gray-300 p-4 justify-between text-white'>
                  <p>{document.timeStamp}</p>
                  <SyntaxHighlighter language={'c'} style={gruvboxDark}>
                    {document.document}
                  </SyntaxHighlighter>
                </div>
            )})}
          </div>
        )}
      </div>
    </Layout>
  )
}
