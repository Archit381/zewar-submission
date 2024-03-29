import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import { BANUBA_CLIENT_TOKEN } from "./BanubaClientToken";
import { Webcam, Player, Module, Effect, Dom } from "@banuba/webar";
import wasm from "@banuba/webar/BanubaSDK.wasm";
import simd from "@banuba/webar/BanubaSDK.simd.wasm";
import data from "@banuba/webar/BanubaSDK.data";

import FaceTracker from "@banuba/webar/face_tracker.zip";

function App() {
  const cameras = [
    {
      id: 1,
      filter: 'effects/glasses_RayBan4165_Dark.zip'
    },
    {
      id: 2,
      filter: 'effects/necklace_01.zip'
    },
    {
      id: 3,
      filter: 'effects/glasses_Banuba.zip'
    },
    {
      id: 4,
      filter: 'effects/earrings_01.zip'
    }
  ];

  const refs = useRef(cameras.map(() => ({})));
  const [keys, setKeys] = useState(cameras.map(() => 0));

  useEffect(() => {
    cameras.forEach((camera, index) => {
      const webcam = refs.current[index].webcam ??= new Webcam();
      const promise = refs.current[index].player ??= Player.create({
        clientToken: BANUBA_CLIENT_TOKEN,
        locateFile: {
          "BanubaSDK.wasm": wasm,
          "BanubaSDK.simd.wasm": simd,
          "BanubaSDK.data": data,
        },
      }).then((player) =>
        player.addModule(new Module(FaceTracker)).then(() => {
          player.use(webcam);
          player.applyEffect(new Effect(camera.filter));
          Dom.render(player, `#webar-${camera.id}`);
        })
      );

      return () => {
        webcam.stop();
        Dom.unmount(`#webar-${camera.id}`);
      };
    });
  }, [cameras, keys]);

  const handleFilterChange = (cameraId, newFilter) => {
    const index = cameras.findIndex((camera) => camera.id === cameraId);
    if (index !== -1) {
      const newKeys = [...keys];
      newKeys[index] += 1;
      setKeys(newKeys);
    }
  };

  return (
    <div className="App">
      <div style={{ fontSize: 50, fontFamily: 'initial', padding: 20 }}>Choose from the filters</div>
      {/* <div style={{ display: 'flex', gap: 10 }}>
        {cameras.map((camera) => (
          <button key={camera.id} className="filter-button" onClick={() => handleFilterChange(camera.id, camera.filter)}>
            Filter {camera.id}
          </button>
        ))}
      </div> */}
      <header className="App-header">
        {cameras.map((camera, index) => (
          <div key={camera.id} id={`webar-${camera.id}`} style={{ maxWidth: "800px", marginRight: "10px" }}></div>
        ))}
      </header>
    </div>
  );
}

export default App;
