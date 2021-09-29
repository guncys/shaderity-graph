import AbstractSocket from './AbstractSocket';
import {NodeId} from '../types/CommonType';
import {SocketTypeEnum} from '../types/CommonEnum';
import {SocketClassName} from './ISocket';
import {IOutputSocket} from './IOutputSocket';
import {IInputSocket} from './IInputSocket';

export default class OutputSocket
  extends AbstractSocket
  implements IOutputSocket
{
  _connectedSockets: IInputSocket[] = [];

  constructor(SocketType: SocketTypeEnum, nodeId: NodeId, socketName: string) {
    super(SocketType, nodeId, socketName);
  }

  get className(): SocketClassName {
    return 'OutputSocket';
  }

  get connectedNodeIds() {
    const nodeIds: NodeId[] = [];
    for (const socket of this._connectedSockets) {
      nodeIds.push(socket.nodeId);
    }
    return nodeIds;
  }

  get connectedSockets() {
    return this._connectedSockets;
  }

  _connectSocketWith(socket: IInputSocket) {
    this._connectedSockets.push(socket);
  }
}
