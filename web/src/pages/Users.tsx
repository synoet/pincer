import React, {useState, useEffect} from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import axios from 'axios';
import {serverurl} from '../config';

import Layout from '../components/Layout';

export default function Users(){
  const [users, setUsers] = useState<any>();
  const history = useHistory();

  useEffect(() => {
    axios.get(`${serverurl}/user`)
      .then((res) => {
        if (res.data){
          setUsers(res.data.reverse());
        }
      });
  }, [])
  
  return (
    <Layout>
      <div className="w-7/12 flex flex-col gap-8">
        <h1 className="text-white text-2xl mt-8 font-bold"> All Users </h1>
        {users && (
          <div className="flex flex-col gap-4">
            {users.map((user: any) => {
              return (
                <div onClick={() => history.push(`/sessions?userId=${user._id}`)} key={`${user._id}`} 
                  className='flex w-full cursor-pointer hover:border-gray-100 rounded-sm border bg-gray-400 border-gray-300 p-4 justify-between text-white'>
                  <p>{user._id}</p>
                  <p>{user.sessions.length} Sessions</p>
                  <p>
                    {user.activated ? (
                      <span className='text-green-300'>Activated</span>
                    ):(
                      <span className='text-red-300'>Not Activated</span>
                    )}
                  </p>
                </div>
            )})}
          </div>
        )}
      </div>
    </Layout>
  )
}
