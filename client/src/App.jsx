import React, { useEffect } from 'react';
import { useGameStore } from './hooks/useGameState';
import { useSocket } from './hooks/useSocket';
import HomeScreen from './components/HomeScreen';
import Lobby from './components/Lobby';
import GameScreen from './components/GameScreen';
import GameOver from './components/GameOver';

export default function App() {
  const {
    screen,
    setRoomInfo,
    setLobby,
    handleGameStarted,
    handleStateUpdate,
    handleTileUpdate,
    handleMoveValid,
    handleMoveInvalid,
  } = useGameStore();

  const { emit } = useSocket({
    'room:joined': ({ roomCode, playerId, lobby, reconnected }) => {
      setRoomInfo({ roomCode, playerId });
      setLobby(lobby);
      if (!reconnected) {
        useGameStore.setState({ screen: 'lobby' });
      }
    },
    'room:error': ({ message }) => {
      alert(message);
    },
    'player:joined': ({ lobby }) => {
      setLobby(lobby);
    },
    'player:left': ({ lobby }) => {
      setLobby(lobby);
    },
    'player:reconnected': () => {},
    'game:started': (state) => {
      handleGameStarted(state);
    },
    'game:stateUpdate': (state) => {
      handleStateUpdate(state);
    },
    'game:ended': (state) => {
      handleStateUpdate(state);
    },
    'player:tileUpdate': handleTileUpdate,
    'move:valid': handleMoveValid,
    'move:invalid': handleMoveInvalid,
  });

  useEffect(() => {
    useGameStore.setState({ _emit: emit });
  }, [emit]);

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      {screen === 'home' && <HomeScreen emit={emit} />}
      {screen === 'lobby' && <Lobby emit={emit} />}
      {screen === 'game' && <GameScreen emit={emit} />}
      {screen === 'gameover' && <GameOver emit={emit} />}
    </div>
  );
}
