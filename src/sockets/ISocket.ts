import {SocketTypeEnum} from '../types/CommonEnum';
import {INode} from '../node/INode';

export type SocketClassName =
  | 'ConnectableInputSocket'
  | 'ConnectableOutputSocket'
  | 'AttributeInputSocket'
  | 'VaryingInputSocket'
  | 'UniformInputSocket';

export interface ISocket {
  get className(): SocketClassName;
  get name(): string;
  get socketType(): SocketTypeEnum;
  get node(): INode;
  isInputSocket(): boolean;
}
