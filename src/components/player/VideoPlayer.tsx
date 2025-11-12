// src/components/player/VideoPlayer.tsx
"use client";

import dynamic from 'next/dynamic';
import { Spin } from 'antd';

// 1. Importa a biblioteca e seus tipos.
import ReactPlayer from 'react-player';
import type { ComponentProps } from 'react';
type ReactPlayerProps = ComponentProps<typeof ReactPlayer>;

// 2. Cria um componente que será carregado dinamicamente.
const Player = (props: ReactPlayerProps) => <ReactPlayer {...props} />;

// 3. Exporta a versão dinâmica do player, garantindo que ele só rode no navegador.
const VideoPlayer = dynamic(() => Promise.resolve(Player), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%', 
      width: '100%', 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      backgroundColor: '#000'
    }}>
      <Spin size="large" />
    </div>
  ),
});

export default VideoPlayer;