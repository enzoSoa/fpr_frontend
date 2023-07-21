import { useContext, useEffect, useMemo } from "react";
import { useGetProfileQuery } from "../../api";
import { Navigate, Outlet } from "react-router-dom";
import { webRTCSocketContext } from "../../ws/webRTC";
import { stompSocket } from "../../ws/messaging";
import { SignalMessage } from "../videoChat";

export function IsAuthenticatedGuard() {
  const authToken = useMemo(() => localStorage.getItem('token'), []);
  const { isError, isLoading } = useGetProfileQuery();

  const ws = useContext(webRTCSocketContext);
  const stomp = useContext(stompSocket);

  useEffect(() => {
    if(authToken) {
      const msg: SignalMessage = {
        type: "identify",
        data: { jwt: authToken }
      };
      ws.onopen = () => {
        ws.send(JSON.stringify(msg));
      };
      stomp.connectHeaders = { "Authorization": authToken };
      stomp.activate();
    }
  }, [authToken, ws, stomp]);

  if(!authToken || (!isLoading && isError)) { return <Navigate to={"/auth/login"}/>; }
  else if(isLoading) { return null; }
  return <Outlet/>;
}
