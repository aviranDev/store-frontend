import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { ContainerPlanPreviewProps } from '../../types/loadPlanPage.types'
import { getPreviewSecurementToolPlacements } from '../../utils/loadPlanPage.utils'
import {
  PreviewViewport,
  PlaceholderText,
  SceneWrap
} from '../../styles/LoadPlanStyle/LoadPlanStyle'

const SceneReadyNotifier = ({ onReady }: { onReady: () => void }): React.JSX.Element | null => {
  const frameCountRef = useRef(0)
  const hasCalledRef = useRef(false)

  useFrame(() => {
    if (hasCalledRef.current) return

    frameCountRef.current += 1

    if (frameCountRef.current >= 2) {
      hasCalledRef.current = true
      onReady()
    }
  })

  return null
}

type PreviewData = NonNullable<ContainerPlanPreviewProps['previewData']>
type PlacedCargoItem = PreviewData['placedCargoItems'][number]
type SecurementToolPlacement = NonNullable<
  PreviewData['securementSummary']
>['toolPlacements'][number]
type CargoVisualShape = 'carton' | 'crate' | 'pallet' | 'drum'
type CargoFaceType = 'side' | 'topBottom'
type ContainerWallName = 'xMin' | 'xMax' | 'zMin' | 'zMax'

const SCALE = 0.01 // 1 cm = 0.01 scene units
const CM_PER_FOOT = 30.48

const formatCentimeters = (valueCm: number): string => Number(valueCm.toFixed(1)).toString()

const formatContainerDimension = (valueCm: number): string =>
  `${(valueCm / CM_PER_FOOT).toFixed(2)} ft (${formatCentimeters(valueCm)} cm)`

const SecurementTubeSegment = ({
  start,
  end,
  color,
  verified
}: {
  start: THREE.Vector3
  end: THREE.Vector3
  color: string
  verified: boolean
}): React.JSX.Element | null => {
  const direction = end.clone().sub(start)
  const length = direction.length()

  if (length <= 0.0001) return null

  const midpoint = start.clone().add(end).multiplyScalar(0.5)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize()
  )

  return (
    <mesh position={midpoint} quaternion={quaternion} renderOrder={500}>
      <cylinderGeometry args={[verified ? 0.028 : 0.024, verified ? 0.028 : 0.024, length, 10]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={verified ? 1 : 0.82}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

const SecurementToolVisual = ({
  tool,
  containerLength,
  containerWidth,
  containerHeight
}: {
  tool: SecurementToolPlacement
  containerLength: number
  containerWidth: number
  containerHeight: number
}): React.JSX.Element | null => {
  const color = tool.verified ? '#00a651' : '#ff8c00'
  const toScenePoint = useCallback(
    (point: { xCm: number; yCm: number; zCm: number }): THREE.Vector3 =>
      new THREE.Vector3(
        -containerLength / 2 + point.xCm * SCALE,
        -containerHeight / 2 + point.zCm * SCALE,
        -containerWidth / 2 + point.yCm * SCALE
      ),
    [containerHeight, containerLength, containerWidth]
  )

  if (tool.pointsCm && tool.pointsCm.length >= 2) {
    const scenePoints = tool.pointsCm.map(toScenePoint)
    const labelPosition = scenePoints[Math.floor(scenePoints.length / 2)] ?? null

    return (
      <group renderOrder={500}>
        {scenePoints.slice(0, -1).map((start, index) => (
          <SecurementTubeSegment
            key={`${tool.id}-segment-${index}`}
            start={start}
            end={scenePoints[index + 1]}
            color={color}
            verified={tool.verified}
          />
        ))}

        {scenePoints.map((position, index) => (
          <mesh key={`${tool.id}-joint-${index}`} position={position} renderOrder={501}>
            <sphereGeometry args={[tool.verified ? 0.038 : 0.032, 10, 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={tool.verified ? 1 : 0.82}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        ))}

        {labelPosition && (
          <DimensionLabelSprite
            text={`${tool.label}${tool.verified ? '' : ' — VERIFY'}`}
            position={[labelPosition.x, labelPosition.y + 0.14, labelPosition.z]}
            worldWidth={1.45}
          />
        )}
      </group>
    )
  }

  if (!tool.centerCm || !tool.sizeCm) return null

  const position = toScenePoint(tool.centerCm)
  const size: [number, number, number] = [
    Math.max(0.025, tool.sizeCm.lengthCm * SCALE),
    Math.max(0.025, tool.sizeCm.heightCm * SCALE),
    Math.max(0.025, tool.sizeCm.widthCm * SCALE)
  ]

  return (
    <group renderOrder={500}>
      <mesh position={position} renderOrder={500}>
        <boxGeometry args={size} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={tool.verified ? 0.82 : 0.58}
          wireframe={!tool.verified}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      <DimensionLabelSprite
        text={`${tool.label}${tool.verified ? '' : ' — VERIFY'}`}
        position={[position.x, position.y + size[1] / 2 + 0.13, position.z]}
        worldWidth={Math.min(Math.max(size[0], 1.1), 2.1)}
      />
    </group>
  )
}

const DEFAULT_SHAPE_COLORS: Record<CargoVisualShape, string> = {
  carton: '#c79252',
  crate: '#c58a42',
  pallet: '#bd8d55',
  drum: '#7d95a8'
}

const normalizeShape = (shape: PlacedCargoItem['shape']): CargoVisualShape => {
  if (shape === 'box') return 'carton'
  if (shape === 'pallet') return 'pallet'
  if (shape === 'drum') return 'drum'

  return 'crate'
}

const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void => {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}

const drawCardboardTexture = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  faceType: CargoFaceType
): void => {
  context.fillStyle = color
  context.fillRect(0, 0, width, height)

  context.fillStyle = 'rgba(255, 255, 255, 0.12)'
  context.fillRect(0, 0, width, height * 0.25)

  context.strokeStyle = 'rgba(75, 42, 18, 0.42)'
  context.lineWidth = 6

  if (faceType === 'topBottom') {
    context.beginPath()
    context.moveTo(width / 2, 0)
    context.lineTo(width / 2, height)
    context.moveTo(0, height / 2)
    context.lineTo(width, height / 2)
    context.stroke()

    context.fillStyle = 'rgba(120, 78, 34, 0.34)'
    context.fillRect(width * 0.45, 0, width * 0.1, height)
    context.fillRect(0, height * 0.43, width, height * 0.14)
  } else {
    context.beginPath()
    context.moveTo(width / 2, 0)
    context.lineTo(width / 2, height)
    context.stroke()

    context.fillStyle = 'rgba(120, 78, 34, 0.32)'
    context.fillRect(0, height * 0.06, width, height * 0.13)
  }

  context.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  context.lineWidth = 2

  for (let index = 0; index < 28; index += 1) {
    const y = 18 + index * 18
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y + 6)
    context.stroke()
  }
}

const drawWoodTexture = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
): void => {
  context.fillStyle = color
  context.fillRect(0, 0, width, height)

  context.strokeStyle = 'rgba(85, 42, 13, 0.58)'
  context.lineWidth = 5

  for (let y = 72; y < height; y += 74) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()
  }

  context.strokeStyle = 'rgba(255, 230, 170, 0.18)'
  context.lineWidth = 3

  for (let index = 0; index < 32; index += 1) {
    const y = 18 + index * 16
    context.beginPath()
    context.moveTo(0, y)
    context.bezierCurveTo(width * 0.25, y - 18, width * 0.55, y + 18, width, y)
    context.stroke()
  }

  context.strokeStyle = 'rgba(73, 34, 10, 0.75)'
  context.lineWidth = 26
  context.strokeRect(18, 18, width - 36, height - 36)

  context.fillStyle = 'rgba(44, 24, 10, 0.55)'

  for (let x = 80; x < width; x += 150) {
    context.beginPath()
    context.arc(x, 62, 8, 0, Math.PI * 2)
    context.fill()

    context.beginPath()
    context.arc(x, height - 62, 8, 0, Math.PI * 2)
    context.fill()
  }
}

const drawWrappedPalletLoadTexture = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
): void => {
  context.fillStyle = color
  context.fillRect(0, 0, width, height)

  context.strokeStyle = 'rgba(80, 45, 18, 0.38)'
  context.lineWidth = 5

  for (let x = width / 3; x < width; x += width / 3) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, height)
    context.stroke()
  }

  for (let y = height / 3; y < height; y += height / 3) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()
  }

  context.strokeStyle = 'rgba(255, 255, 255, 0.36)'
  context.lineWidth = 4

  for (let y = 20; y < height; y += 28) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y + 12)
    context.stroke()
  }

  context.fillStyle = 'rgba(255, 255, 255, 0.16)'
  context.fillRect(0, 0, width, height)
}

const drawLabel = (
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  label?: string
): void => {
  const safeLabel = label?.trim() ?? ''

  if (!safeLabel) return

  let fontSize = 120
  context.font = `bold ${fontSize}px Arial`

  while (fontSize > 44 && context.measureText(safeLabel).width > canvasWidth - 180) {
    fontSize -= 4
    context.font = `bold ${fontSize}px Arial`
  }

  const textWidth = context.measureText(safeLabel).width
  const paddingX = 42
  const paddingY = 24

  const labelWidth = Math.min(textWidth + paddingX * 2, canvasWidth - 90)
  const labelHeight = fontSize + paddingY * 2

  const labelX = (canvasWidth - labelWidth) / 2
  const labelY = (canvasHeight - labelHeight) / 2

  context.fillStyle = 'rgba(255, 255, 255, 0.62)'
  drawRoundedRect(context, labelX, labelY, labelWidth, labelHeight, 18)
  context.fill()

  context.strokeStyle = 'rgba(0, 0, 0, 0.45)'
  context.lineWidth = 5
  drawRoundedRect(context, labelX, labelY, labelWidth, labelHeight, 18)
  context.stroke()

  context.fillStyle = '#111111'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(safeLabel, canvasWidth / 2, canvasHeight / 2)
}

const createCargoFaceTexture = ({
  label,
  color,
  showLabel,
  shape,
  faceType
}: {
  label?: string
  color: string
  showLabel: boolean
  shape: CargoVisualShape
  faceType: CargoFaceType
}): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = 1024
  canvas.height = 512

  if (!context) {
    return new THREE.CanvasTexture(canvas)
  }

  context.clearRect(0, 0, canvas.width, canvas.height)

  if (shape === 'crate') {
    drawWoodTexture(context, canvas.width, canvas.height, color)
  } else if (shape === 'pallet') {
    drawWrappedPalletLoadTexture(context, canvas.width, canvas.height, color)
  } else {
    drawCardboardTexture(context, canvas.width, canvas.height, color, faceType)
  }

  if (showLabel) {
    drawLabel(context, canvas.width, canvas.height, label)
  }

  const texture = new THREE.CanvasTexture(canvas)

  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping

  return texture
}

const CargoBodyBox = ({
  position,
  size,
  color,
  label,
  shape
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  label?: string
  shape: CargoVisualShape
}): React.JSX.Element => {
  const geometry = useMemo(() => new THREE.BoxGeometry(size[0], size[1], size[2]), [size])
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry])

  const faceTextures = useMemo(() => {
    const sideTexture = createCargoFaceTexture({
      label,
      color,
      showLabel: true,
      shape,
      faceType: 'side'
    })

    const topBottomTexture = createCargoFaceTexture({
      label,
      color,
      showLabel: false,
      shape,
      faceType: 'topBottom'
    })

    return {
      sideTexture,
      topBottomTexture
    }
  }, [label, color, shape])

  const materials = useMemo(() => {
    const sideMaterial = new THREE.MeshStandardMaterial({
      map: faceTextures.sideTexture,
      color: '#ffffff',
      roughness: 0.86,
      metalness: 0,
      toneMapped: false
    })

    const topBottomMaterial = new THREE.MeshStandardMaterial({
      map: faceTextures.topBottomTexture,
      color: '#ffffff',
      roughness: 0.86,
      metalness: 0,
      toneMapped: false
    })

    return [
      sideMaterial,
      sideMaterial,
      topBottomMaterial,
      topBottomMaterial,
      sideMaterial,
      sideMaterial
    ]
  }, [faceTextures])

  useEffect(() => {
    return () => {
      geometry.dispose()
      edgesGeometry.dispose()
      faceTextures.sideTexture.dispose()
      faceTextures.topBottomTexture.dispose()

      materials.forEach((material) => {
        material.dispose()
      })
    }
  }, [geometry, edgesGeometry, faceTextures, materials])

  return (
    <group position={position}>
      <mesh geometry={geometry} material={materials} />

      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color="#111111" />
      </lineSegments>
    </group>
  )
}

const CargoDrum = ({
  position,
  size,
  color,
  label
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  label?: string
}): React.JSX.Element => {
  const radius = Math.min(size[0], size[2]) / 2

  const geometry = useMemo(
    () => new THREE.CylinderGeometry(radius, radius, size[1], 32),
    [radius, size]
  )

  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry])

  const sideTexture = useMemo(
    () =>
      createCargoFaceTexture({
        label,
        color,
        showLabel: true,
        shape: 'drum',
        faceType: 'side'
      }),
    [label, color]
  )

  const materials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({
        map: sideTexture,
        color: '#ffffff',
        roughness: 0.68,
        metalness: 0.08,
        toneMapped: false
      }),
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.68,
        metalness: 0.08
      }),
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.68,
        metalness: 0.08
      })
    ],
    [sideTexture, color]
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      edgesGeometry.dispose()
      sideTexture.dispose()
      materials.forEach((material) => material.dispose())
    }
  }, [geometry, edgesGeometry, sideTexture, materials])

  return (
    <group position={position}>
      <mesh geometry={geometry} material={materials} />

      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color="#111111" />
      </lineSegments>
    </group>
  )
}

const CrateBox = ({
  position,
  size,
  color,
  label
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  label?: string
}): React.JSX.Element => {
  const beamThickness = Math.min(Math.max(Math.min(size[0], size[1], size[2]) * 0.08, 0.035), 0.09)
  const xEdge = size[0] / 2 - beamThickness / 2
  const yEdge = size[1] / 2 - beamThickness / 2
  const zFront = size[2] / 2 + beamThickness * 0.18
  const zBack = -size[2] / 2 - beamThickness * 0.18

  const beamMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#8a4f1f',
        roughness: 0.88,
        metalness: 0
      }),
    []
  )

  useEffect(() => {
    return () => {
      beamMaterial.dispose()
    }
  }, [beamMaterial])

  const beams = [
    { position: [-xEdge, 0, zFront], size: [beamThickness, size[1], beamThickness] },
    { position: [xEdge, 0, zFront], size: [beamThickness, size[1], beamThickness] },
    { position: [0, yEdge, zFront], size: [size[0], beamThickness, beamThickness] },
    { position: [0, -yEdge, zFront], size: [size[0], beamThickness, beamThickness] },

    { position: [-xEdge, 0, zBack], size: [beamThickness, size[1], beamThickness] },
    { position: [xEdge, 0, zBack], size: [beamThickness, size[1], beamThickness] },
    { position: [0, yEdge, zBack], size: [size[0], beamThickness, beamThickness] },
    { position: [0, -yEdge, zBack], size: [size[0], beamThickness, beamThickness] }
  ] as const

  return (
    <group position={position}>
      <CargoBodyBox position={[0, 0, 0]} size={size} color={color} label={label} shape="crate" />

      {beams.map((beam, index) => (
        <mesh key={index} position={beam.position} material={beamMaterial}>
          <boxGeometry args={beam.size} />
        </mesh>
      ))}
    </group>
  )
}

const PalletBase = ({
  position,
  size
}: {
  position: [number, number, number]
  size: [number, number, number]
}): React.JSX.Element => {
  const [length, height, depth] = size

  const topBoardHeight = Math.max(height * 0.22, 0.018)
  const bottomBoardHeight = Math.max(height * 0.16, 0.014)
  const blockHeight = Math.max(height * 0.48, 0.04)

  const boardColor = '#b97932'
  const boardAltColor = '#c98b45'
  const darkWoodColor = '#744018'

  const topBoardCount = 5
  const topBoardDepth = depth / 8

  const topBoards = Array.from({ length: topBoardCount }, (_, index) => {
    const z = -depth / 2 + ((index + 0.5) * depth) / topBoardCount

    return {
      position: [0, height * 0.34, z] as [number, number, number],
      size: [length, topBoardHeight, topBoardDepth] as [number, number, number],
      color: index % 2 === 0 ? boardColor : boardAltColor
    }
  })

  const bottomBoards = [-0.36, 0, 0.36].map((zOffset) => ({
    position: [0, -height * 0.38, zOffset * depth] as [number, number, number],
    size: [length, bottomBoardHeight, depth * 0.12] as [number, number, number]
  }))

  const supportBlocks = [-0.36, 0, 0.36].flatMap((xOffset) =>
    [-0.36, 0, 0.36].map((zOffset) => ({
      position: [xOffset * length, -height * 0.05, zOffset * depth] as [number, number, number],
      size: [length * 0.12, blockHeight, depth * 0.12] as [number, number, number]
    }))
  )

  return (
    <group position={position}>
      {topBoards.map((board, index) => (
        <mesh key={`pallet-top-${index}`} position={board.position}>
          <boxGeometry args={board.size} />
          <meshStandardMaterial color={board.color} roughness={0.88} metalness={0} />
        </mesh>
      ))}

      {supportBlocks.map((block, index) => (
        <mesh key={`pallet-block-${index}`} position={block.position}>
          <boxGeometry args={block.size} />
          <meshStandardMaterial color={darkWoodColor} roughness={0.92} metalness={0} />
        </mesh>
      ))}

      {bottomBoards.map((board, index) => (
        <mesh key={`pallet-bottom-${index}`} position={board.position}>
          <boxGeometry args={board.size} />
          <meshStandardMaterial color={darkWoodColor} roughness={0.92} metalness={0} />
        </mesh>
      ))}
    </group>
  )
}

const PalletizedLoad = ({
  position,
  size,
  color,
  label
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  label?: string
}): React.JSX.Element => {
  const palletHeight = Math.min(Math.max(size[1] * 0.16, 0.08), 0.16)
  const loadHeight = Math.max(size[1] - palletHeight, size[1] * 0.45)

  return (
    <group position={position}>
      <PalletBase
        position={[0, -size[1] / 2 + palletHeight / 2, 0]}
        size={[size[0], palletHeight, size[2]]}
      />

      <CargoBodyBox
        position={[0, -size[1] / 2 + palletHeight + loadHeight / 2, 0]}
        size={[size[0], loadHeight, size[2]]}
        color={color}
        label={label}
        shape="pallet"
      />
    </group>
  )
}

const CargoVisualItem = ({
  position,
  size,
  color,
  label,
  shape
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  label?: string
  shape: CargoVisualShape
}): React.JSX.Element => {
  if (shape === 'pallet') {
    return <PalletizedLoad position={position} size={size} color={color} label={label} />
  }

  if (shape === 'crate') {
    return <CrateBox position={position} size={size} color={color} label={label} />
  }

  if (shape === 'drum') {
    return <CargoDrum position={position} size={size} color={color} label={label} />
  }

  return <CargoBodyBox position={position} size={size} color={color} label={label} shape="carton" />
}

const KeyboardCameraControls = ({
  containerLength
}: {
  containerLength: number
}): React.JSX.Element | null => {
  const { camera } = useThree()
  const pressedKeys = useRef<Set<string>>(new Set())

  const targetRef = useRef(new THREE.Vector3(0, 0, 0))
  const yawRef = useRef(0)
  const pitchRef = useRef(0.28)
  const radiusRef = useRef(Math.max(containerLength * 0.75, 10))

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Shift', '+', '=', '-', '_']

      if (keys.includes(event.key)) {
        event.preventDefault()
        pressedKeys.current.add(event.key)
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      pressedKeys.current.delete(event.key)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    const rotationSpeed = 1.4
    const panSpeed = 4.5
    const tiltSpeed = 0.9
    const zoomSpeed = 8

    if (pressedKeys.current.has('+') || pressedKeys.current.has('=')) {
      radiusRef.current -= zoomSpeed * delta
    }

    if (pressedKeys.current.has('-') || pressedKeys.current.has('_')) {
      radiusRef.current += zoomSpeed * delta
    }

    radiusRef.current = Math.max(3, Math.min(containerLength * 2, radiusRef.current))

    const isShiftPressed = pressedKeys.current.has('Shift')

    if (isShiftPressed) {
      if (pressedKeys.current.has('ArrowLeft')) targetRef.current.x -= panSpeed * delta
      if (pressedKeys.current.has('ArrowRight')) targetRef.current.x += panSpeed * delta
      if (pressedKeys.current.has('ArrowUp')) targetRef.current.z -= panSpeed * delta
      if (pressedKeys.current.has('ArrowDown')) targetRef.current.z += panSpeed * delta
    } else {
      if (pressedKeys.current.has('ArrowLeft')) yawRef.current += rotationSpeed * delta
      if (pressedKeys.current.has('ArrowRight')) yawRef.current -= rotationSpeed * delta
      if (pressedKeys.current.has('ArrowUp')) pitchRef.current += tiltSpeed * delta
      if (pressedKeys.current.has('ArrowDown')) pitchRef.current -= tiltSpeed * delta
    }

    pitchRef.current = Math.max(-0.15, Math.min(1.1, pitchRef.current))

    const radius = radiusRef.current
    const yaw = yawRef.current
    const pitch = pitchRef.current

    const x = targetRef.current.x + radius * Math.cos(pitch) * Math.sin(yaw)
    const y = targetRef.current.y + radius * Math.sin(pitch) + 2.5
    const z = targetRef.current.z + radius * Math.cos(pitch) * Math.cos(yaw)

    camera.position.set(x, y, z)
    camera.lookAt(targetRef.current)
  })

  return null
}

const createContainerWallTexture = (
  wallWidth: number,
  _wallHeight: number
): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = 1400
  canvas.height = 760

  if (!context) {
    return new THREE.CanvasTexture(canvas)
  }

  context.clearRect(0, 0, canvas.width, canvas.height)

  const baseGradient = context.createLinearGradient(0, 0, 0, canvas.height)
  baseGradient.addColorStop(0, 'rgba(228, 233, 237, 0.98)')
  baseGradient.addColorStop(0.5, 'rgba(212, 219, 225, 0.96)')
  baseGradient.addColorStop(1, 'rgba(198, 206, 213, 0.98)')
  context.fillStyle = baseGradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  const corrugationCount = Math.max(12, Math.min(40, Math.round(wallWidth / 0.2)))
  const pitch = canvas.width / corrugationCount
  const ridgeWidth = pitch * 0.24
  const slopeWidth = pitch * 0.18
  const valleyWidth = pitch - ridgeWidth - slopeWidth * 2

  for (let index = 0; index < corrugationCount; index += 1) {
    const x0 = index * pitch
    const x1 = x0 + ridgeWidth
    const x2 = x1 + slopeWidth
    const x3 = x2 + valleyWidth
    const x4 = x0 + pitch

    context.fillStyle = 'rgba(248, 250, 252, 0.24)'
    context.fillRect(x0, 0, ridgeWidth, canvas.height)

    const leftSlope = context.createLinearGradient(x1, 0, x2, 0)
    leftSlope.addColorStop(0, 'rgba(236, 241, 245, 0.22)')
    leftSlope.addColorStop(1, 'rgba(176, 186, 194, 0.18)')
    context.fillStyle = leftSlope
    context.beginPath()
    context.moveTo(x1, 0)
    context.lineTo(x2, 0)
    context.lineTo(x3, canvas.height)
    context.lineTo(x2, canvas.height)
    context.closePath()
    context.fill()

    context.fillStyle = 'rgba(158, 169, 178, 0.16)'
    context.fillRect(x2, 0, valleyWidth, canvas.height)

    const rightSlope = context.createLinearGradient(x3, 0, x4, 0)
    rightSlope.addColorStop(0, 'rgba(150, 160, 169, 0.12)')
    rightSlope.addColorStop(1, 'rgba(234, 239, 243, 0.18)')
    context.fillStyle = rightSlope
    context.beginPath()
    context.moveTo(x3, 0)
    context.lineTo(x4, 0)
    context.lineTo(x4, canvas.height)
    context.lineTo(x1, canvas.height)
    context.closePath()
    context.fill()

    context.strokeStyle = 'rgba(96, 108, 119, 0.18)'
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(x1, 0)
    context.lineTo(x1, canvas.height)
    context.moveTo(x2, 0)
    context.lineTo(x2, canvas.height)
    context.moveTo(x3, 0)
    context.lineTo(x3, canvas.height)
    context.stroke()
  }

  const railHeight = 10
  context.fillStyle = 'rgba(132, 144, 154, 0.16)'
  context.fillRect(0, 18, canvas.width, railHeight)
  context.fillRect(0, canvas.height - 28, canvas.width, railHeight)

  context.strokeStyle = 'rgba(74, 86, 97, 0.28)'
  context.lineWidth = 6
  context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

const createWallRibGeometry = ({
  wall,
  containerLength,
  containerWidth,
  containerHeight
}: {
  wall: ContainerWallName
  containerLength: number
  containerWidth: number
  containerHeight: number
}): THREE.BufferGeometry => {
  const positions: number[] = []

  const xMin = -containerLength / 2
  const xMax = containerLength / 2
  const yMin = -containerHeight / 2
  const yMax = containerHeight / 2
  const zMin = -containerWidth / 2
  const zMax = containerWidth / 2

  const addLine = (
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number
  ): void => {
    positions.push(x1, y1, z1, x2, y2, z2)
  }

  if (wall === 'zMin' || wall === 'zMax') {
    const z = wall === 'zMin' ? zMin : zMax
    const wallWidth = containerLength
    const corrugationSpacing = Math.max(Math.min(wallWidth / 34, 0.24), 0.14)

    for (let x = xMin; x <= xMax + 0.001; x += corrugationSpacing) {
      addLine(x, yMin, z, x, yMax, z)
    }

    addLine(xMin, yMin, z, xMax, yMin, z)
    addLine(xMin, yMax, z, xMax, yMax, z)
  }

  if (wall === 'xMin' || wall === 'xMax') {
    const x = wall === 'xMin' ? xMin : xMax
    const wallWidth = containerWidth
    const corrugationSpacing = Math.max(Math.min(wallWidth / 16, 0.2), 0.12)

    for (let z = zMin; z <= zMax + 0.001; z += corrugationSpacing) {
      addLine(x, yMin, z, x, yMax, z)
    }

    addLine(x, yMin, zMin, x, yMin, zMax)
    addLine(x, yMax, zMin, x, yMax, zMax)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

const ContainerWallPanel = ({
  wall,
  containerLength,
  containerWidth,
  containerHeight
}: {
  wall: ContainerWallName
  containerLength: number
  containerWidth: number
  containerHeight: number
}): React.JSX.Element => {
  const wallWidth = wall === 'zMin' || wall === 'zMax' ? containerLength : containerWidth
  const wallHeight = containerHeight
  const xMin = -containerLength / 2
  const xMax = containerLength / 2
  const zMin = -containerWidth / 2
  const zMax = containerWidth / 2
  const epsilon = 0.003

  const texture = useMemo(
    () => createContainerWallTexture(wallWidth, wallHeight),
    [wallWidth, wallHeight]
  )
  const ribGeometry = useMemo(
    () =>
      createWallRibGeometry({
        wall,
        containerLength,
        containerWidth,
        containerHeight
      }),
    [wall, containerLength, containerWidth, containerHeight]
  )

  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        color: '#e6ebef',
        transparent: true,
        opacity: 0.22,
        roughness: 0.8,
        metalness: 0.05,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: false,
        toneMapped: false
      }),
    [texture]
  )

  const ribMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#9aa6b0',
        transparent: true,
        opacity: 0.42,
        depthTest: true,
        depthWrite: false
      }),
    []
  )

  useEffect(() => {
    return () => {
      texture.dispose()
      ribGeometry.dispose()
      wallMaterial.dispose()
      ribMaterial.dispose()
    }
  }, [texture, ribGeometry, wallMaterial, ribMaterial])

  if (wall === 'zMin') {
    return (
      <group>
        <mesh position={[0, 0, zMin + epsilon]}>
          <planeGeometry args={[wallWidth, wallHeight]} />
          <primitive object={wallMaterial} attach="material" />
        </mesh>
        <lineSegments geometry={ribGeometry} material={ribMaterial} />
      </group>
    )
  }

  if (wall === 'zMax') {
    return (
      <group>
        <mesh position={[0, 0, zMax - epsilon]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[wallWidth, wallHeight]} />
          <primitive object={wallMaterial} attach="material" />
        </mesh>
        <lineSegments geometry={ribGeometry} material={ribMaterial} />
      </group>
    )
  }

  if (wall === 'xMin') {
    return (
      <group>
        <mesh position={[xMin + epsilon, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[wallWidth, wallHeight]} />
          <primitive object={wallMaterial} attach="material" />
        </mesh>
        <lineSegments geometry={ribGeometry} material={ribMaterial} />
      </group>
    )
  }

  return (
    <group>
      <mesh position={[xMax - epsilon, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[wallWidth, wallHeight]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      <lineSegments geometry={ribGeometry} material={ribMaterial} />
    </group>
  )
}

const CameraBackWallGrid = ({
  containerLength,
  containerWidth,
  containerHeight
}: {
  containerLength: number
  containerWidth: number
  containerHeight: number
}): React.JSX.Element => {
  const { camera } = useThree()

  const xMinRef = useRef<THREE.Group | null>(null)
  const xMaxRef = useRef<THREE.Group | null>(null)
  const zMinRef = useRef<THREE.Group | null>(null)
  const zMaxRef = useRef<THREE.Group | null>(null)

  useFrame(() => {
    if (xMinRef.current) xMinRef.current.visible = false
    if (xMaxRef.current) xMaxRef.current.visible = false
    if (zMinRef.current) zMinRef.current.visible = false
    if (zMaxRef.current) zMaxRef.current.visible = false

    const cameraX = camera.position.x
    const cameraZ = camera.position.z

    if (cameraX >= 0) {
      if (xMinRef.current) xMinRef.current.visible = true
    } else {
      if (xMaxRef.current) xMaxRef.current.visible = true
    }

    if (cameraZ >= 0) {
      if (zMinRef.current) zMinRef.current.visible = true
    } else {
      if (zMaxRef.current) zMaxRef.current.visible = true
    }
  })

  return (
    <group>
      <group ref={xMinRef}>
        <ContainerWallPanel
          wall="xMin"
          containerLength={containerLength}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
        />
      </group>
      <group ref={xMaxRef}>
        <ContainerWallPanel
          wall="xMax"
          containerLength={containerLength}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
        />
      </group>
      <group ref={zMinRef}>
        <ContainerWallPanel
          wall="zMin"
          containerLength={containerLength}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
        />
      </group>
      <group ref={zMaxRef}>
        <ContainerWallPanel
          wall="zMax"
          containerLength={containerLength}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
        />
      </group>
    </group>
  )
}

const createDimensionLabelTexture = (text: string): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = 1200
  canvas.height = 190

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#f8f8f8'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = '#606060'
    context.lineWidth = 8
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10)

    let fontSize = 66
    context.font = `bold ${fontSize}px Arial`

    while (fontSize > 34 && context.measureText(text).width > canvas.width - 100) {
      fontSize -= 2
      context.font = `bold ${fontSize}px Arial`
    }

    context.fillStyle = '#111111'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(text, canvas.width / 2, canvas.height / 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

const DimensionLabelSprite = ({
  text,
  position,
  worldWidth
}: {
  text: string
  position: [number, number, number]
  worldWidth: number
}): React.JSX.Element => {
  const texture = useMemo(() => createDimensionLabelTexture(text), [text])
  const worldHeight = worldWidth * (190 / 1200)

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <sprite position={position} scale={[worldWidth, worldHeight, 1]}>
      <spriteMaterial
        map={texture}
        transparent={false}
        opacity={1}
        depthTest={true}
        depthWrite={true}
        alphaTest={0.5}
        toneMapped={false}
      />
    </sprite>
  )
}

const ContainerDoorVisual = ({
  containerLength,
  containerWidth,
  containerHeight,
  doorWidthCm,
  doorHeightCm,
  gridStep
}: {
  containerLength: number
  containerWidth: number
  containerHeight: number
  doorWidthCm?: number
  doorHeightCm?: number
  gridStep: number
}): React.JSX.Element | null => {
  const hasDoorDimensions =
    typeof doorWidthCm === 'number' &&
    Number.isFinite(doorWidthCm) &&
    doorWidthCm > 0 &&
    typeof doorHeightCm === 'number' &&
    Number.isFinite(doorHeightCm) &&
    doorHeightCm > 0

  const safeDoorWidthCm = hasDoorDimensions ? doorWidthCm : 0
  const safeDoorHeightCm = hasDoorDimensions ? doorHeightCm : 0

  const doorWidth = Math.min(safeDoorWidthCm * SCALE, containerWidth * 0.985)
  const doorHeight = Math.min(safeDoorHeightCm * SCALE, containerHeight * 0.985)

  // Application convention: the container doors are on the +X short end.
  const x = containerLength / 2 - 0.004
  const hardwareX = x + Math.max(doorWidth * 0.012, 0.025)
  const bottomY = -containerHeight / 2
  const topY = bottomY + doorHeight
  const doorCenterY = bottomY + doorHeight / 2
  const zMin = -doorWidth / 2
  const zMax = doorWidth / 2

  const centerGap = Math.max(Math.min(doorWidth * 0.012, 0.028), 0.012)
  const leafWidth = Math.max((doorWidth - centerGap) / 2, 0.01)
  const leftLeafZ = -(leafWidth / 2 + centerGap / 2)
  const rightLeafZ = leafWidth / 2 + centerGap / 2

  const frameThickness = Math.max(Math.min(doorWidth * 0.014, 0.034), 0.016)
  const panelRibThickness = Math.max(Math.min(doorHeight * 0.008, 0.022), 0.01)
  const lockingBarRadius = Math.max(Math.min(doorWidth * 0.008, 0.022), 0.011)
  const lockingBarHeight = doorHeight * 0.88
  const lockingBarY = bottomY + doorHeight * 0.5
  const handleY = bottomY + doorHeight * 0.31
  const handleLength = Math.max(doorWidth * 0.1, 0.15)
  const handleRadius = Math.max(lockingBarRadius * 0.72, 0.008)

  const lockingBarPositions = [
    -doorWidth * 0.37,
    -doorWidth * 0.13,
    doorWidth * 0.13,
    doorWidth * 0.37
  ]

  const panelRibYPositions = [0.24, 0.49, 0.74].map((ratio) => bottomY + doorHeight * ratio)

  const hingeYPositions = [0.14, 0.38, 0.63, 0.87].map((ratio) => bottomY + doorHeight * ratio)

  const labelText = `Door opening: ${formatCentimeters(safeDoorWidthCm)} × ${formatCentimeters(
    safeDoorHeightCm
  )} cm (W × H)`
  const labelWidth = Math.min(Math.max(containerLength * 0.2, 2.15), 3.05)
  const labelGap = Math.max(gridStep * 0.7, 0.16)
  const groundLabelY = bottomY + Math.max(gridStep * 0.18, 0.09)
  const groundLabelZ = containerWidth / 2 + labelGap + gridStep * 1.25
  const labelPosition: [number, number, number] = [
    -containerLength / 2 + containerLength * 0.88,
    groundLabelY,
    groundLabelZ
  ]

  const panelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#6f91aa',
        transparent: true,
        opacity: 0.16,
        roughness: 0.8,
        metalness: 0.12,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: true
      }),
    []
  )

  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#45677f',
        transparent: true,
        opacity: 0.62,
        roughness: 0.58,
        metalness: 0.3,
        depthTest: true,
        depthWrite: true
      }),
    []
  )

  const hardwareMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d4dadd',
        transparent: true,
        opacity: 0.78,
        roughness: 0.28,
        metalness: 0.72,
        depthTest: true,
        depthWrite: true
      }),
    []
  )

  const darkHardwareMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#4d555b',
        transparent: true,
        opacity: 0.78,
        roughness: 0.42,
        metalness: 0.5,
        depthTest: true,
        depthWrite: true
      }),
    []
  )

  const outlineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#3e5667',
        transparent: true,
        opacity: 0.82,
        depthTest: true,
        depthWrite: false
      }),
    []
  )

  const outlineGeometry = useMemo(() => {
    const positions: number[] = []

    const addLine = (
      x1: number,
      y1: number,
      z1: number,
      x2: number,
      y2: number,
      z2: number
    ): void => {
      positions.push(x1, y1, z1, x2, y2, z2)
    }

    // Outer frame and center seam.
    addLine(x, bottomY, zMin, x, bottomY, zMax)
    addLine(x, bottomY, zMax, x, topY, zMax)
    addLine(x, topY, zMax, x, topY, zMin)
    addLine(x, topY, zMin, x, bottomY, zMin)
    addLine(x, bottomY, 0, x, topY, 0)

    // Pressed horizontal panel sections, similar to a real container door.
    panelRibYPositions.forEach((y) => {
      addLine(x, y, zMin, x, y, zMax)
    })

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [bottomY, panelRibYPositions, topY, x, zMax, zMin])

  useEffect(() => {
    return () => {
      panelMaterial.dispose()
      frameMaterial.dispose()
      hardwareMaterial.dispose()
      darkHardwareMaterial.dispose()
      outlineMaterial.dispose()
      outlineGeometry.dispose()
    }
  }, [
    darkHardwareMaterial,
    frameMaterial,
    hardwareMaterial,
    outlineGeometry,
    outlineMaterial,
    panelMaterial
  ])

  if (!hasDoorDimensions) {
    return null
  }

  return (
    <group>
      {/* Semi-transparent blue-gray double doors. */}
      <mesh position={[x, doorCenterY, leftLeafZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[leafWidth, doorHeight]} />
        <primitive object={panelMaterial} attach="material" />
      </mesh>

      <mesh position={[x, doorCenterY, rightLeafZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[leafWidth, doorHeight]} />
        <primitive object={panelMaterial} attach="material" />
      </mesh>

      {/* Outer frame, threshold, header, and central meeting stile. */}
      <mesh position={[hardwareX, doorCenterY, zMin]}>
        <boxGeometry args={[frameThickness, doorHeight, frameThickness]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      <mesh position={[hardwareX, doorCenterY, zMax]}>
        <boxGeometry args={[frameThickness, doorHeight, frameThickness]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      <mesh position={[hardwareX, bottomY + frameThickness / 2, 0]}>
        <boxGeometry args={[frameThickness, frameThickness, doorWidth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      <mesh position={[hardwareX, topY - frameThickness / 2, 0]}>
        <boxGeometry args={[frameThickness, frameThickness, doorWidth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      <mesh position={[hardwareX, doorCenterY, 0]}>
        <boxGeometry args={[frameThickness, doorHeight, Math.max(centerGap, frameThickness)]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Horizontal panel ribs on both leaves. */}
      {panelRibYPositions.map((y, index) => (
        <mesh key={`door-rib-${index}`} position={[hardwareX, y, 0]}>
          <boxGeometry args={[panelRibThickness, panelRibThickness, doorWidth * 0.96]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
      ))}

      {/* Four vertical locking bars, two per door leaf. */}
      {lockingBarPositions.map((z, index) => {
        const towardCenter = z < 0 ? 1 : -1
        const handleCenterZ = z + towardCenter * handleLength * 0.45

        return (
          <group key={`door-locking-bar-${index}`}>
            <mesh position={[hardwareX + 0.018, lockingBarY, z]}>
              <cylinderGeometry args={[lockingBarRadius, lockingBarRadius, lockingBarHeight, 14]} />
              <primitive object={hardwareMaterial} attach="material" />
            </mesh>

            {/* Top, middle, and bottom bar brackets. */}
            {[0.09, 0.5, 0.91].map((ratio) => (
              <mesh
                key={`door-bar-bracket-${index}-${ratio}`}
                position={[hardwareX + 0.02, bottomY + doorHeight * ratio, z]}
              >
                <boxGeometry
                  args={[
                    frameThickness * 1.2,
                    Math.max(doorHeight * 0.035, 0.055),
                    lockingBarRadius * 3.2
                  ]}
                />
                <primitive object={darkHardwareMaterial} attach="material" />
              </mesh>
            ))}

            {/* Horizontal operating handle, pointing toward the center seam. */}
            <mesh
              position={[hardwareX + 0.04, handleY, handleCenterZ]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[handleRadius, handleRadius, handleLength, 12]} />
              <primitive object={hardwareMaterial} attach="material" />
            </mesh>
            <mesh position={[hardwareX + 0.04, handleY, z]}>
              <boxGeometry
                args={[
                  frameThickness * 1.25,
                  Math.max(doorHeight * 0.05, 0.07),
                  lockingBarRadius * 3.2
                ]}
              />
              <primitive object={darkHardwareMaterial} attach="material" />
            </mesh>
          </group>
        )
      })}

      {/* Four hinges on each outside edge. */}
      {hingeYPositions.flatMap((y, yIndex) =>
        [zMin, zMax].map((z, sideIndex) => (
          <group key={`door-hinge-${yIndex}-${sideIndex}`}>
            <mesh position={[hardwareX + 0.02, y, z]}>
              <boxGeometry
                args={[
                  frameThickness * 1.35,
                  Math.max(doorHeight * 0.055, 0.08),
                  frameThickness * 2.2
                ]}
              />
              <primitive object={darkHardwareMaterial} attach="material" />
            </mesh>
            <mesh position={[hardwareX + 0.045, y, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry
                args={[
                  lockingBarRadius * 0.75,
                  lockingBarRadius * 0.75,
                  Math.max(doorHeight * 0.065, 0.09),
                  10
                ]}
              />
              <primitive object={hardwareMaterial} attach="material" />
            </mesh>
          </group>
        ))
      )}

      {/* Small corner castings help the door read as a shipping-container end. */}
      {[
        [bottomY + frameThickness, zMin],
        [bottomY + frameThickness, zMax],
        [topY - frameThickness, zMin],
        [topY - frameThickness, zMax]
      ].map(([y, z], index) => (
        <mesh key={`door-corner-${index}`} position={[hardwareX + 0.01, y, z]}>
          <boxGeometry args={[frameThickness * 1.8, frameThickness * 3.2, frameThickness * 3.2]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
      ))}

      <lineSegments geometry={outlineGeometry} material={outlineMaterial} />

      <DimensionLabelSprite text={labelText} position={labelPosition} worldWidth={labelWidth} />
    </group>
  )
}

const ContainerShellDetails = ({
  containerLength,
  containerWidth,
  containerHeight
}: {
  containerLength: number
  containerWidth: number
  containerHeight: number
}): React.JSX.Element => {
  const xMin = -containerLength / 2
  const xMax = containerLength / 2
  const yMax = containerHeight / 2
  const zMin = -containerWidth / 2
  const zMax = containerWidth / 2

  const postThickness = Math.max(Math.min(containerWidth * 0.045, 0.12), 0.06)
  const railThickness = Math.max(Math.min(containerHeight * 0.045, 0.1), 0.055)
  const castingSize = Math.max(Math.min(postThickness * 1.75, 0.16), 0.095)
  const shellInset = 0.004

  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e7ecef',
        transparent: true,
        opacity: 0.42,
        roughness: 0.78,
        metalness: 0.08,
        depthTest: true,
        depthWrite: true
      }),
    []
  )

  const castingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d8dde2',
        transparent: true,
        opacity: 0.58,
        roughness: 0.72,
        metalness: 0.12,
        depthTest: true,
        depthWrite: true
      }),
    []
  )

  const recessMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#7b858f',
        transparent: true,
        opacity: 0.7,
        roughness: 0.86,
        metalness: 0.06,
        depthTest: true,
        depthWrite: true
      }),
    []
  )

  useEffect(() => {
    return () => {
      frameMaterial.dispose()
      castingMaterial.dispose()
      recessMaterial.dispose()
    }
  }, [frameMaterial, castingMaterial, recessMaterial])

  const topRails = [
    {
      position: [0, yMax - railThickness / 2, zMin + shellInset],
      size: [containerLength, railThickness, railThickness]
    },
    {
      position: [0, yMax - railThickness / 2, zMax - shellInset],
      size: [containerLength, railThickness, railThickness]
    },
    {
      position: [xMin + shellInset, yMax - railThickness / 2, 0],
      size: [railThickness, railThickness, containerWidth]
    },
    {
      position: [xMax - shellInset, yMax - railThickness / 2, 0],
      size: [railThickness, railThickness, containerWidth]
    }
  ] as const

  const cornerPosts = [
    [xMin + postThickness / 2, 0, zMin + postThickness / 2],
    [xMin + postThickness / 2, 0, zMax - postThickness / 2],
    [xMax - postThickness / 2, 0, zMin + postThickness / 2],
    [xMax - postThickness / 2, 0, zMax - postThickness / 2]
  ] as const

  const topCastings = [
    [xMin + castingSize / 2, yMax + castingSize * 0.08, zMin + castingSize / 2],
    [xMin + castingSize / 2, yMax + castingSize * 0.08, zMax - castingSize / 2],
    [xMax - castingSize / 2, yMax + castingSize * 0.08, zMin + castingSize / 2],
    [xMax - castingSize / 2, yMax + castingSize * 0.08, zMax - castingSize / 2]
  ] as const

  return (
    <group>
      {topRails.map((rail, index) => (
        <mesh key={`shell-top-rail-${index}`} position={rail.position}>
          <boxGeometry args={rail.size} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
      ))}

      {cornerPosts.map((position, index) => (
        <mesh key={`shell-corner-post-${index}`} position={position}>
          <boxGeometry args={[postThickness, containerHeight, postThickness]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
      ))}

      {topCastings.map((position, index) => {
        const isFront = index >= 2
        const xOffset = isFront ? -castingSize * 0.18 : castingSize * 0.18
        const zOffset = index % 2 === 0 ? castingSize * 0.18 : -castingSize * 0.18

        return (
          <group key={`shell-top-casting-${index}`} position={position}>
            <mesh>
              <boxGeometry args={[castingSize, castingSize * 0.78, castingSize]} />
              <primitive object={castingMaterial} attach="material" />
            </mesh>
            <mesh position={[xOffset, 0, zOffset]}>
              <boxGeometry args={[castingSize * 0.34, castingSize * 0.22, castingSize * 0.34]} />
              <primitive object={recessMaterial} attach="material" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

const ContainerUnderframe = ({
  containerLength,
  containerWidth,
  containerHeight
}: {
  containerLength: number
  containerWidth: number
  containerHeight: number
}): React.JSX.Element => {
  const floorY = -containerHeight / 2
  const railHeight = Math.max(Math.min(containerHeight * 0.05, 0.14), 0.085)
  const railDepth = Math.max(Math.min(containerWidth * 0.045, 0.12), 0.075)
  const railCenterY = floorY - railHeight / 2 - 0.012
  const sideRailZ = containerWidth / 2 - railDepth / 2
  const endRailThickness = Math.max(Math.min(containerLength * 0.006, 0.09), 0.05)

  const crossMemberCount = Math.max(7, Math.min(15, Math.round(containerLength / 0.85)))
  const crossMemberXs = Array.from({ length: crossMemberCount }, (_, index) => {
    const ratio = (index + 1) / (crossMemberCount + 1)
    return -containerLength / 2 + containerLength * ratio
  })

  // Two dark rectangular openings along each side resemble forklift/tunnel pockets.
  const pocketXs = [-containerLength * 0.27, containerLength * 0.27]
  const pocketLength = Math.max(Math.min(containerLength * 0.085, 0.72), 0.34)
  const pocketHeight = railHeight * 0.58
  const pocketDepth = Math.max(railDepth * 0.32, 0.025)

  const cornerLength = Math.max(Math.min(containerLength * 0.025, 0.22), 0.12)
  const cornerDepth = Math.max(Math.min(containerWidth * 0.085, 0.2), 0.12)

  const railMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#718493',
        transparent: true,
        opacity: 0.82,
        roughness: 0.7,
        metalness: 0.18,
        depthTest: true,
        depthWrite: true
      }),
    []
  )

  const crossMemberMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#8797a3',
        transparent: true,
        opacity: 0.65,
        roughness: 0.78,
        metalness: 0.12,
        depthTest: true,
        depthWrite: true
      }),
    []
  )

  const pocketMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#20272c',
        roughness: 0.88,
        metalness: 0.08,
        depthTest: true,
        depthWrite: true
      }),
    []
  )

  const cornerMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#4f6677',
        roughness: 0.58,
        metalness: 0.28,
        depthTest: true,
        depthWrite: true
      }),
    []
  )

  useEffect(() => {
    return () => {
      railMaterial.dispose()
      crossMemberMaterial.dispose()
      pocketMaterial.dispose()
      cornerMaterial.dispose()
    }
  }, [cornerMaterial, crossMemberMaterial, pocketMaterial, railMaterial])

  return (
    <group>
      {/* Long bottom side rails. */}
      {[-sideRailZ, sideRailZ].map((z, index) => (
        <mesh key={`underframe-side-rail-${index}`} position={[0, railCenterY, z]}>
          <boxGeometry args={[containerLength, railHeight, railDepth]} />
          <primitive object={railMaterial} attach="material" />
        </mesh>
      ))}

      {/* Front and rear bottom rails. */}
      {[-containerLength / 2, containerLength / 2].map((x, index) => (
        <mesh key={`underframe-end-rail-${index}`} position={[x, railCenterY, 0]}>
          <boxGeometry args={[endRailThickness, railHeight, containerWidth]} />
          <primitive object={railMaterial} attach="material" />
        </mesh>
      ))}

      {/* Cross-members beneath the container floor. */}
      {crossMemberXs.map((x, index) => (
        <mesh key={`underframe-cross-member-${index}`} position={[x, railCenterY, 0]}>
          <boxGeometry
            args={[
              Math.max(endRailThickness * 0.62, 0.035),
              railHeight * 0.72,
              Math.max(containerWidth - railDepth * 2.25, 0.1)
            ]}
          />
          <primitive object={crossMemberMaterial} attach="material" />
        </mesh>
      ))}

      {/* Dark forklift-pocket openings on both visible side rails. */}
      {[-1, 1].flatMap((side) =>
        pocketXs.map((x, index) => (
          <mesh
            key={`underframe-pocket-${side}-${index}`}
            position={[x, railCenterY, side * (containerWidth / 2 + pocketDepth / 2 - 0.006)]}
          >
            <boxGeometry args={[pocketLength, pocketHeight, pocketDepth]} />
            <primitive object={pocketMaterial} attach="material" />
          </mesh>
        ))
      )}

      {/* Reinforced lower corner castings. */}
      {[-1, 1].flatMap((xSide) =>
        [-1, 1].map((zSide) => (
          <mesh
            key={`underframe-corner-${xSide}-${zSide}`}
            position={[
              xSide * (containerLength / 2 - cornerLength / 2),
              railCenterY,
              zSide * (containerWidth / 2 - cornerDepth / 2)
            ]}
          >
            <boxGeometry args={[cornerLength, railHeight * 1.15, cornerDepth]} />
            <primitive object={cornerMaterial} attach="material" />
          </mesh>
        ))
      )}
    </group>
  )
}

const ContainerDimensionRulers = ({
  containerLength,
  containerWidth,
  containerHeight,
  lengthCm,
  widthCm,
  heightCm,
  gridStep
}: {
  containerLength: number
  containerWidth: number
  containerHeight: number
  lengthCm: number
  widthCm: number
  heightCm: number
  gridStep: number
}): React.JSX.Element => {
  const floorY = -containerHeight / 2
  const heightRulerTopY = floorY + containerHeight * 0.58
  const gap = Math.max(gridStep * 0.7, 0.16)
  const tick = Math.max(Math.min(gridStep * 0.38, 0.2), 0.09)

  const xMin = -containerLength / 2
  const xMax = containerLength / 2
  const zMin = -containerWidth / 2
  const zMax = containerWidth / 2

  const lengthZ = zMax + gap
  const widthX = xMax + gap

  // Keep the height ruler short and low so it does not create a tall outside
  // line beside the container. The label still shows the full internal height.
  const heightX = xMin
  const heightZ = zMax
  const rulerGeometry = useMemo(() => {
    const p = [
      // Internal length ruler and end ticks.
      xMin,
      floorY,
      lengthZ,
      xMax,
      floorY,
      lengthZ,
      xMin,
      floorY,
      lengthZ - tick,
      xMin,
      floorY,
      lengthZ + tick,
      xMax,
      floorY,
      lengthZ - tick,
      xMax,
      floorY,
      lengthZ + tick,
      xMin,
      floorY,
      zMax,
      xMin,
      floorY,
      lengthZ,
      xMax,
      floorY,
      zMax,
      xMax,
      floorY,
      lengthZ,

      // Internal width ruler and end ticks.
      widthX,
      floorY,
      zMin,
      widthX,
      floorY,
      zMax,
      widthX - tick,
      floorY,
      zMin,
      widthX + tick,
      floorY,
      zMin,
      widthX - tick,
      floorY,
      zMax,
      widthX + tick,
      floorY,
      zMax,
      xMax,
      floorY,
      zMin,
      widthX,
      floorY,
      zMin,
      xMax,
      floorY,
      zMax,
      widthX,
      floorY,
      zMax,

      // Short internal height marker. It intentionally stops before the roof
      // to avoid a tall outside vertical line in the 3D preview.
      // The small outside height ticks were removed so no black dashes
      // appear outside the container wall.
      heightX,
      floorY,
      heightZ,
      heightX,
      heightRulerTopY,
      heightZ
    ]

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(p, 3))
    return geometry
  }, [floorY, heightRulerTopY, heightX, heightZ, lengthZ, tick, widthX, xMax, xMin, zMax, zMin])

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#111111',
        transparent: false,
        opacity: 1,
        depthTest: true,
        depthWrite: true
      }),
    []
  )

  useEffect(() => {
    return () => {
      rulerGeometry.dispose()
      material.dispose()
    }
  }, [material, rulerGeometry])

  const labelY = floorY + Math.max(gridStep * 0.18, 0.09)
  const groundLabelZ = zMax + gap + gridStep * 1.25
  const lengthLabelWidth = Math.min(Math.max(containerLength * 0.2, 2.05), 3.05)
  const widthLabelWidth = Math.min(Math.max(containerLength * 0.18, 1.9), 2.75)
  const heightLabelWidth = Math.min(Math.max(containerLength * 0.18, 1.95), 2.85)

  const lengthLabelPosition: [number, number, number] = [
    xMin + containerLength * 0.18,
    labelY,
    groundLabelZ
  ]
  const widthLabelPosition: [number, number, number] = [
    xMin + containerLength * 0.42,
    labelY,
    groundLabelZ
  ]
  const heightLabelPosition: [number, number, number] = [
    xMin + containerLength * 0.66,
    labelY,
    groundLabelZ
  ]

  return (
    <group>
      <lineSegments geometry={rulerGeometry} material={material} />

      <DimensionLabelSprite
        text={`Internal Length: ${formatContainerDimension(lengthCm)}`}
        position={lengthLabelPosition}
        worldWidth={lengthLabelWidth}
      />

      <DimensionLabelSprite
        text={`Internal Width: ${formatContainerDimension(widthCm)}`}
        position={widthLabelPosition}
        worldWidth={widthLabelWidth}
      />

      <DimensionLabelSprite
        text={`Internal Height: ${formatContainerDimension(heightCm)}`}
        position={heightLabelPosition}
        worldWidth={heightLabelWidth}
      />
    </group>
  )
}

const ContainerScene = ({ previewData }: { previewData: PreviewData }): React.JSX.Element => {
  const containerLength = previewData.containerType.dimensions.internalLengthCm * SCALE
  const containerWidth = previewData.containerType.dimensions.internalWidthCm * SCALE
  const containerHeight = previewData.containerType.dimensions.internalHeightCm * SCALE
  const groundGridStep = Math.max(containerLength, containerWidth) / 24
  const groundGridSize = Math.max(containerLength, containerWidth) + groundGridStep * 4
  const securementTools = getPreviewSecurementToolPlacements(previewData)

  const placedItems = useMemo(
    () =>
      previewData.placedCargoItems.map((item, index) => {
        const shape = normalizeShape(item.shape)

        const sizeX = item.placedLengthCm * SCALE
        const sizeY = item.placedHeightCm * SCALE
        const sizeZ = item.placedWidthCm * SCALE

        const x = -containerLength / 2 + item.xCm * SCALE + sizeX / 2
        const y = -containerHeight / 2 + item.zCm * SCALE + sizeY / 2
        const z = -containerWidth / 2 + item.yCm * SCALE + sizeZ / 2

        return {
          key: `${item.cargoDescription}-${item.unitIndex}-${index}`,
          shape,
          color: item.color || DEFAULT_SHAPE_COLORS[shape],
          label: item.poNumber || String(item.unitIndex),
          position: [x, y, z] as [number, number, number],
          size: [sizeX, sizeY, sizeZ] as [number, number, number]
        }
      }),
    [previewData, containerLength, containerHeight, containerWidth]
  )

  const shellGeometry = useMemo(
    () => new THREE.BoxGeometry(containerLength, containerHeight, containerWidth),
    [containerLength, containerHeight, containerWidth]
  )

  const shellEdgesGeometry = useMemo(() => new THREE.EdgesGeometry(shellGeometry), [shellGeometry])

  useEffect(() => {
    return () => {
      shellGeometry.dispose()
      shellEdgesGeometry.dispose()
    }
  }, [shellGeometry, shellEdgesGeometry])

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[8, 10, 8]} intensity={1.25} />
      <directionalLight position={[-6, 6, -4]} intensity={0.55} />

      <KeyboardCameraControls containerLength={containerLength} />

      <mesh position={[0, -containerHeight / 2, 0]}>
        <boxGeometry args={[containerLength, 0.03, containerWidth]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>

      <gridHelper
        args={[groundGridSize, 28, '#b8b8b8', '#d8d8d8']}
        position={[0, -containerHeight / 2 + 0.02, 0]}
      />

      <ContainerUnderframe
        containerLength={containerLength}
        containerWidth={containerWidth}
        containerHeight={containerHeight}
      />

      <ContainerShellDetails
        containerLength={containerLength}
        containerWidth={containerWidth}
        containerHeight={containerHeight}
      />

      <ContainerDimensionRulers
        containerLength={containerLength}
        containerWidth={containerWidth}
        containerHeight={containerHeight}
        lengthCm={previewData.containerType.dimensions.internalLengthCm}
        widthCm={previewData.containerType.dimensions.internalWidthCm}
        heightCm={previewData.containerType.dimensions.internalHeightCm}
        gridStep={groundGridStep}
      />

      <ContainerDoorVisual
        containerLength={containerLength}
        containerWidth={containerWidth}
        containerHeight={containerHeight}
        doorWidthCm={previewData.containerType.dimensions.doorWidthCm}
        doorHeightCm={previewData.containerType.dimensions.doorHeightCm}
        gridStep={groundGridStep}
      />

      <group>
        <CameraBackWallGrid
          containerLength={containerLength}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
        />

        <lineSegments geometry={shellEdgesGeometry}>
          <lineBasicMaterial color="#666666" />
        </lineSegments>
      </group>

      {placedItems.map((item) => (
        <CargoVisualItem
          key={item.key}
          position={item.position}
          size={item.size}
          color={item.color}
          label={item.label}
          shape={item.shape}
        />
      ))}

      {securementTools.map((tool) => (
        <SecurementToolVisual
          key={tool.id}
          tool={tool}
          containerLength={containerLength}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
        />
      ))}
    </>
  )
}

const ContainerPlanPreview3D = ({
  formData,
  previewData
}: Pick<ContainerPlanPreviewProps, 'formData' | 'previewData'>): React.JSX.Element => {
  const [isPreparing3D, setIsPreparing3D] = useState(false)
  const [sceneData, setSceneData] = useState<PreviewData | null>(null)

  useEffect(() => {
    if (!previewData) {
      setSceneData(null)
      setIsPreparing3D(false)
      return
    }

    setIsPreparing3D(true)
    setSceneData(null)

    const timeoutId = window.setTimeout(() => {
      setSceneData(previewData)
    }, 80)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [previewData])

  const handleSceneReady = useCallback(() => {
    setIsPreparing3D(false)
  }, [])

  if (!previewData) {
    return (
      <PreviewViewport>
        <PlaceholderText>
          3D container preview area
          <br />
          Calculate a preview to display the cargo layout in 3D
          <br />
          Container: {formData.containerType}
        </PlaceholderText>
      </PreviewViewport>
    )
  }

  const containerLength = previewData.containerType.dimensions.internalLengthCm * SCALE
  const securementToolCount = getPreviewSecurementToolPlacements(previewData).length

  return (
    <PreviewViewport>
      <SceneWrap>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: 0
          }}
        >
          {sceneData && (
            <Canvas
              gl={{ preserveDrawingBuffer: true, antialias: true }}
              camera={{
                position: [containerLength * 0.48, 5.8, 7.2],
                fov: 40,
                near: 0.1,
                far: 1000
              }}
            >
              <ContainerScene previewData={sceneData} />
              <SceneReadyNotifier onReady={handleSceneReady} />
            </Canvas>
          )}

          {securementToolCount > 0 && !isPreparing3D && (
            <div
              style={{
                position: 'absolute',
                left: 8,
                top: 8,
                zIndex: 20,
                padding: '3px 7px',
                border: '1px solid #006b30',
                background: '#e8fff1',
                color: '#005c29',
                fontSize: 10,
                fontWeight: 'bold',
                pointerEvents: 'none'
              }}
            >
              SECUREMENT · {securementToolCount} {securementToolCount === 1 ? 'TOOL' : 'TOOLS'}
            </div>
          )}

          {isPreparing3D && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f3f3f3',
                color: '#111111',
                fontSize: 14,
                fontWeight: 'bold',
                border: '2px inset #c0c0c0'
              }}
            >
              Loading, please wait.
            </div>
          )}
        </div>
      </SceneWrap>
    </PreviewViewport>
  )
}

export default ContainerPlanPreview3D
