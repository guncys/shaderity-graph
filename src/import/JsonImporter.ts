import Node from '../node/Node';
import shaderFunctionDataRepository from '../node/ShaderFunctionDataRepository';
import {
  ShaderityGraphNode,
  ShaderityGraphJson,
  ShaderFunctionData,
  ConnectableInputSocketData,
} from '../types/CommonType';

/**
 * This class parses the ShaderityGraphJson and imports it
 * into a format that can be used by this library.
 */
export default class JsonImporter {
  /**
   * Creates nodes and sockets from ShaderityGraphJson, and connects the sockets
   * @param json json to create node graph
   */
  static importShaderityGraphJson(json: ShaderityGraphJson) {
    this.__setShaderFunctions(json.shaderFunctionDataObject);

    this.__createNodes(json.nodes);
    this.__connectSockets(json.nodes);
  }

  /**
   * @private
   * Register the functions corresponding to each nodes in the shaderFunctionDataRepository
   */
  private static __setShaderFunctions(shaderFunctionDataObject: {
    [shaderFunctionName: string]: ShaderFunctionData;
  }) {
    for (const nodeFunctionName in shaderFunctionDataObject) {
      const shaderFunctionData = shaderFunctionDataObject[nodeFunctionName];
      shaderFunctionDataRepository.setShaderFunctionData(
        nodeFunctionName,
        shaderFunctionData
      );
    }
  }

  /**
   * @private
   * Create nodes and the sockets that each node has. At this point,
   * the sockets are not connected to each other. All nodes are independent.
   */
  private static __createNodes(nodesJson: ShaderityGraphNode[]) {
    for (let i = 0; i < nodesJson.length; i++) {
      const nodeJson = nodesJson[i];
      new Node(nodeJson.nodeData, nodeJson.socketDataArray);
    }
  }

  /**
   * @private
   * Connect the socket of each node created by __createNodes method.
   */
  private static __connectSockets(nodesJson: ShaderityGraphNode[]) {
    for (let i = 0; i < nodesJson.length; i++) {
      const outputNodeId = i;
      const outputNodeJson = nodesJson[outputNodeId];

      for (const socketData of outputNodeJson.socketDataArray) {
        if (socketData.direction === 'output') {
          continue;
        }

        const inputSocketData = socketData as ConnectableInputSocketData;
        const socketConnectionData = inputSocketData.socketConnectionData;
        if (socketConnectionData == null) {
          continue;
        }

        const inputNode = Node.getNodeById(
          socketConnectionData.connectedNodeId
        );
        const outputSocketNameOfInputNode =
          socketConnectionData.connectedSocketName;
        const outputNode = Node.getNodeById(outputNodeId);
        const inputSocketNameOfOutputNode = inputSocketData.name;

        Node.connectNodes(
          inputNode,
          outputSocketNameOfInputNode,
          outputNode,
          inputSocketNameOfOutputNode
        );
      }
    }
  }
}
