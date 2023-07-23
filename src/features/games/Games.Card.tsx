import { css } from "@emotion/react";
import { Game } from "../../types/Games.ts";
import { gameCard } from "./Games.style.ts";
import { outWhiteShadow } from "../../ui";
import { useContext, useState } from "react";
import { gameStompSocket } from "../../ws/gaming.ts";
import { Group } from "../../types";
import { useNavigate } from "react-router-dom";

interface Props {
  game: Game,
  group: Group
}

export function GamesCard({ game, group }: Props){
  const gaming = useContext(gameStompSocket);

  const navigator = useNavigate();

  const [creating, setCreating] = useState(false);

  return <div css={css(gameCard(game.id), outWhiteShadow)} onClick={() => {
    gaming.onConnect = () => {
      gaming.subscribe("/rooms/created", message => {
        const id = message.body.split(" ")[2];
        navigator("/room/" + id);
      });
      if(!creating) {
        setCreating(true);
        gaming.publish({
          destination: "/app/createRoom",
          body: JSON.stringify({ gameId: game.id, groupId: group.id })
        });
      }
    };
    gaming.activate();
  }}>
    <h2>{game.title}</h2>
    <p>Players : {game.nbMinPlayers} - {game.nbMaxPlayers}</p>
  </div>;
}
