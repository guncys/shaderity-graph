import AttributeInputNode from '../node/AttributeInputNode';
import Node from '../node/Node';
import shaderFunctionDataRepository from '../node/ShaderFunctionDataRepository';
import UniformInputNode from '../node/UniformInputNode';
import VaryingInputNode from '../node/VaryingInputNode';
import {
  AttributeInputNodeData,
  InputSocketData,
  ShaderityGraphNode,
  UniformInputNodeData,
  VaryingInputNodeData,
  ShaderityGraphJson,
  ShaderFunctionData,
} from '../types/CommonType';

export default class JsonImporter {
  static importShaderityGraphJson(json: ShaderityGraphJson) {
    this.shaderFunctionData(json.shaderFunctionDataObject);

    this.__createNodes(json.nodes);
    this.__connectSockets(json.nodes);
  }

  private static shaderFunctionData(shaderFunctionDataObject: {
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

  private static __createNodes(nodesJson: ShaderityGraphNode[]) {
    for (let i = 0; i < nodesJson.length; i++) {
      const nodeJson = nodesJson[i];
      const nodeData = nodeJson.nodeData;

      // Node.__nodeId equals to index of the nodesJson array
      let node: Node;
      if ((nodeData as AttributeInputNodeData).attribute != null) {
        node = new AttributeInputNode(nodeData as AttributeInputNodeData);
      } else if ((nodeData as VaryingInputNodeData).varying != null) {
        node = new VaryingInputNode(nodeData as VaryingInputNodeData);
      } else if ((nodeData as UniformInputNodeData).uniform != null) {
        node = new UniformInputNode(nodeData as UniformInputNodeData);
      } else {
        node = new Node(nodeData);
      }

      for (let i = 0; i < nodeJson.socketData.length; i++) {
        const socketData = nodeJson.socketData[i];
        const socketType = socketData.type;

        if (socketData.direction === 'input') {
          node.addInputSocket(
            socketData.name,
            socketType,
            socketData.argumentId,
            (socketData as InputSocketData).defaultValue
          );
        } else {
          node.addOutputSocket(
            socketData.name,
            socketType,
            socketData.argumentId
          );
        }
      }
    }
  }

  private static __connectSockets(nodesJson: ShaderityGraphNode[]) {
    for (let i = 0; i < nodesJson.length; i++) {
      const outputNodeId = i;
      const outputNodeJson = nodesJson[outputNodeId];

      for (const socketData of outputNodeJson.socketData) {
        if (socketData.direction === 'output') {
          continue;
        }

        const inputSocketData = socketData as InputSocketData;
        const socketConnectionData = inputSocketData.socketConnectionDatum;
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
