import Node from '../node/Node';
import OutputSocket from '../sockets/OutputSocket';
import {NodeId} from '../types/CommonType';
import glslPrecisionShaderityObject from './shaderityShaders/glslPrecision.glsl';
import prerequisitesShaderityObject from './shaderityShaders/prerequisites.glsl';
import mainPrerequisitesShaderityObject from './shaderityShaders/mainPrerequisites.glsl';
import {SocketType} from '../types/CommonEnum';

export default class ShaderGraphResolver {
  static createVertexShaderCode(sortedVertexNodes: Node[]): string {
    // need to get the attributeTypeNumber from shaderity?
    const attributeTypeNumber = 11;

    const shaderPrerequisites = `
#version 300 es
${glslPrecisionShaderityObject.code}
${prerequisitesShaderityObject.code}

in float a_instanceID;\n

uniform bool u_vertexAttributesExistenceArray[${attributeTypeNumber}];
shaderity: @{matricesGetters}
shaderity: @{getters}
    `;

    let shaderBody =
      ShaderGraphResolver.__constructFunctionDefinition(sortedVertexNodes);

    shaderBody +=
      ShaderGraphResolver.__constructMainFunction(sortedVertexNodes);

    const shader = shaderPrerequisites + shaderBody;
    return shader;
  }

  static createPixelShaderCode(sortedPixelNodes: Node[]): string {
    const pixelShaderPrerequisites = `
#version 300 es
${glslPrecisionShaderityObject.code}
${prerequisitesShaderityObject.code}
shaderity: @{getters}
`;

    let shaderBody =
      ShaderGraphResolver.__constructFunctionDefinition(sortedPixelNodes);

    shaderBody += ShaderGraphResolver.__constructMainFunction(sortedPixelNodes);

    const shader = pixelShaderPrerequisites + shaderBody;
    return shader;
  }

  private static __constructFunctionDefinition(shaderNodes: Node[]) {
    let shaderText = '';
    const existVertexFunctions: string[] = [];
    for (let i = 0; i < shaderNodes.length; i++) {
      const node = shaderNodes[i];
      if (existVertexFunctions.indexOf(node.name) !== -1) {
        continue;
      }
      shaderText += node.shaderCode;
      existVertexFunctions.push(node.name);
    }

    return shaderText;
  }

  private static __constructMainFunction(nodes: Node[]) {
    let shaderBody = `
void main() {
`;
    shaderBody += mainPrerequisitesShaderityObject.code + '\n';

    // TODO: refactor of the following codes
    const inputVarNames: Array<Array<string>> = [];
    const outputVarNames: Array<Array<string>> = [];
    const existingInputs: NodeId[] = [];
    const existingOutputsVarName: Map<NodeId, string> = new Map();
    const existingOutputs: NodeId[] = [];

    // TODO: support uniform value as input
    for (let i = 1; i < nodes.length; i++) {
      addDeclareVariableToShaderBody(i);
    }

    shaderBody += '\n';

    for (let i = 0; i < nodes.length; i++) {
      addFunctionCallingToShaderBody(i);
    }

    shaderBody += `
}
      `;

    return shaderBody;

    function addDeclareVariableToShaderBody(index: number) {
      const targetNode = nodes[index];
      inputVarNames[index] = inputVarNames[index] ?? [];
      outputVarNames[index - 1] = outputVarNames[index - 1] ?? [];

      const inputSockets = targetNode._inputSockets;

      // write variable
      for (const inputSocket of inputSockets.values()) {
        const prevNodeId = inputSocket.connectedNodeId;
        const prevNode = Node.getNodeById(prevNodeId);
        const outputSocketOfPrevNode =
          inputSocket.connectedSocket as OutputSocket;
        const outputSocketNameOfPrevNode = outputSocketOfPrevNode.name;

        // TODO: substitute uniform value
        let varName = `${outputSocketNameOfPrevNode}_${prevNodeId}_to_${targetNode.id}`;

        if (existingInputs.indexOf(prevNode.id) === -1) {
          const socketType = inputSocket.socketType;
          const glslTypeStr = SocketType.getGlslTypeStr(socketType);
          const rowStr = `  ${glslTypeStr} ${varName};\n`;
          shaderBody += rowStr;
        }

        const existVarName = existingOutputsVarName.get(prevNode.id);
        if (existVarName) {
          varName = existVarName;
        }
        inputVarNames[index].push(varName);
        existingInputs.push(prevNodeId);
      }

      // avoid duplication of variable
      const prevNode = nodes[index - 1];
      const outputSocketsOfPrevNode = prevNode._outputSockets;

      for (const outputSocketOfPrevNode of outputSocketsOfPrevNode) {
        const backNodeIds = outputSocketOfPrevNode.connectedNodeIds;
        const outputSocketName = outputSocketOfPrevNode.name;

        for (const backNodeId of backNodeIds) {
          const varName = `${outputSocketName}_${prevNode.id}_to_${backNodeId}`;

          outputVarNames[index - 1].push(varName);
          existingOutputsVarName.set(prevNode.id, varName);
          existingOutputs.push(prevNode.id);
        }
      }
    }

    function addFunctionCallingToShaderBody(index: number) {
      const node = nodes[index];
      const functionName = node.name;

      inputVarNames[index] = inputVarNames[index] ?? [];
      outputVarNames[index] = outputVarNames[index] ?? [];

      // do we need this check?
      if (
        node._inputSockets.length !== inputVarNames[index].length ||
        node._outputSockets.length !== outputVarNames[index].length
      ) {
        return;
      }

      let rowStr = '';

      const varNames = inputVarNames[index].concat(outputVarNames[index]);

      // Call node functions
      rowStr += `  ${functionName}(`;
      for (let j = 0; j < varNames.length; j++) {
        const varName = varNames[j];
        if (varName == null) {
          continue;
        }
        if (j !== 0) {
          rowStr += ', ';
        }
        rowStr += varNames[j];

        rowStr += ');\n';
      }

      shaderBody += rowStr;
    }
  }
}
