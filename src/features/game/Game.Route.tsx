import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import { gameStompSocket } from "../../ws/gaming.ts";
import { IMessage } from "@stomp/stompjs";
import { useGetRoomQuery } from "../../api/rooms.ts";
import toast from "react-hot-toast";
import { useGetProfileQuery } from "../../api/index.ts";
import { Game2DEngine } from "./Game.2DEngine.tsx";
import { css } from "@emotion/react";
import { gameDisplay } from "./Game.style.ts";
import { outPrimaryShadow } from "../../ui/shadows.ts";
import { GameStartScreen } from "./Game.StartScreen.tsx";
import { Game } from "../../types";

export function GameRoute() {
  const navigate = useNavigate();
  const { id } = useParams();
  const gaming = useContext(gameStompSocket);
  const { data: room } = useGetRoomQuery(id ?? "");
  const { data: self } = useGetProfileQuery();

  useEffect(() => {
    if(!gaming.connected) {
      navigate("/");
    }
  }, [gaming.connected, navigate]);

  const [render, setRender] = useState<object | null>(null);

  const [started, setStarted] = useState(false);
  const [joined, setJoined] = useState(false);

  const onSub = useCallback((message: IMessage) => {
    const data = JSON.parse(message.body);
    if(data.joined === true) {
      toast.success("Joined");
      setJoined(true);
    }
    else if(data.joined === false) {
      toast.error(data.reason);
    }
    else if(data.started === true) {
      setStarted(true);
      toast.success("Game started");
    }
    else if(data.started === false) {
      toast.error(data.reason);
    }
    else {
      setRender(data);
    }
  }, []);

  useEffect(() => {
    const sub = [gaming.subscribe("/rooms/" + id, onSub), gaming.subscribe("/rooms/" + id + "/" + self?.id, onSub)];
    if(!joined) {
      gaming.publish({ destination: "/app/joinRoom/" + id });
    }
    gaming.onConnect = () => {
      gaming.subscribe("/rooms/" + id, onSub);
      gaming.subscribe("/rooms/" + id + "/" + self?.id, onSub);
      if(!joined){
        gaming.publish({ destination: "/app/joinRoom/" + id });
      }
    };
    return () => {
      sub.forEach(s => s.unsubscribe());
    };
  }, [gaming, id, onSub, self]);

  useEffect(() => {
    if(room?.status === "STARTED") {
      setStarted(true);
    }
  }, [room]);

  return <section css={css(gameDisplay, outPrimaryShadow)}>
    <GameStartScreen
      isStarted={started}
      handleStartClick={() => gaming.publish({ destination: "/app/startGame/" + id })}
    />
    {(started && render)&& <Game2DEngine
      game={render as Game}
      onAction={(action => gaming.publish({ destination: "/app/play/" + id, body: JSON.stringify(action) }))}
    />}
  </section>;
}
