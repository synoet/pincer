import axios from "axios";

export async function startSession(netId, sessionId) {
  const response = await axios.post(`${process.env['BASE_URL']}/session/start`, {
    netId: netId,
    sessionId: sessionId 
  });

  return response;
}

export async function endSession(netId, sessionId) {
  const response = await axios.post(`${process.env['BASE_URL']}/session/end`, {
    netId: netId,
    sessionId: sessionId 
  });

  return response;
}
