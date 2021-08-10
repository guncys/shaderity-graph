export const ShaderStage = {
  Vertex: 'vertex',
  Fragment: 'pixel',
  Pixel: 'pixel',
  NoUse: 'noUse',
} as const;
export type ShaderStageEnum = typeof ShaderStage[keyof typeof ShaderStage];

export const SocketType = {
  Int: 'int',
  Float: 'float',
  Vector2: 'vector2',
  Vector3: 'vector3',
  Vector4: 'vector4',
  Mat22: 'mat22',
  Mat33: 'mat33',
  Mat44: 'mat44',
} as const;
export type SocketTypeEnum = typeof SocketType[keyof typeof SocketType];

export const SocketDirection = {
  Input: 'input',
  Output: 'output',
} as const;
export type SocketDirectionEnum =
  typeof SocketDirection[keyof typeof SocketDirection];
