import { getProvider } from "@decentraland/web3-provider";
import { getUserData } from '@decentraland/Identity'
import { getCurrentRealm } from '@decentraland/EnvironmentAPI'
import * as EthereumController from '@decentraland/EthereumController'
import * as EthConnect from '../node_modules/eth-connect/esm'
declare var dcl: DecentralandInterface

import { MetaZoneAPI } from './metazone-api'
import { WSScene } from '../metas/wsscene/wsscene'

const mzAPI = new MetaZoneAPI(getProvider, getUserData, getCurrentRealm, EthereumController, EthConnect, dcl, () => {

  const wssceneLandOwnerData = {
    host_data: JSON.stringify({
      "wss": {
        "position": {"x":8, "y":0, "z":8},
        "scale": {"x":16, "y":10, "z":16},
        "rotation": {"x":0, "y":0, "z":0},
        "server": "wss://yourherokuapp.herokuapp.com" // "ws://localhost:12000"
      }
    })
  }

  /// --- Set up your meta system to test ---
  engine.addSystem(new WSScene(mzAPI, wssceneLandOwnerData))

})
