import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { ContainerPlanPreviewProps } from '../../types/loadPlanPage.types'
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
type CargoVisualShape = 'carton' | 'crate' | 'pallet' | 'drum'
type CargoFaceType = 'side' | 'topBottom'
type ContainerWallName = 'xMin' | 'xMax' | 'zMin' | 'zMax'

const SCALE = 0.01 // 1 cm = 0.01 scene units

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

const createWallGridGeometry = ({
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

  const gridStep = Math.max(containerLength, containerWidth) / 24

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

    for (let x = xMin; x <= xMax + 0.001; x += gridStep) {
      addLine(x, yMin, z, x, yMax, z)
    }

    for (let y = yMin; y <= yMax + 0.001; y += gridStep) {
      addLine(xMin, y, z, xMax, y, z)
    }
  }

  if (wall === 'xMin' || wall === 'xMax') {
    const x = wall === 'xMin' ? xMin : xMax

    for (let z = zMin; z <= zMax + 0.001; z += gridStep) {
      addLine(x, yMin, z, x, yMax, z)
    }

    for (let y = yMin; y <= yMax + 0.001; y += gridStep) {
      addLine(x, y, zMin, x, y, zMax)
    }
  }

  const geometry = new THREE.BufferGeometry()

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

  return geometry
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

  const xMinRef = useRef<THREE.LineSegments | null>(null)
  const xMaxRef = useRef<THREE.LineSegments | null>(null)
  const zMinRef = useRef<THREE.LineSegments | null>(null)
  const zMaxRef = useRef<THREE.LineSegments | null>(null)

  const xMinGeometry = useMemo(
    () =>
      createWallGridGeometry({
        wall: 'xMin',
        containerLength,
        containerWidth,
        containerHeight
      }),
    [containerLength, containerWidth, containerHeight]
  )

  const xMaxGeometry = useMemo(
    () =>
      createWallGridGeometry({
        wall: 'xMax',
        containerLength,
        containerWidth,
        containerHeight
      }),
    [containerLength, containerWidth, containerHeight]
  )

  const zMinGeometry = useMemo(
    () =>
      createWallGridGeometry({
        wall: 'zMin',
        containerLength,
        containerWidth,
        containerHeight
      }),
    [containerLength, containerWidth, containerHeight]
  )

  const zMaxGeometry = useMemo(
    () =>
      createWallGridGeometry({
        wall: 'zMax',
        containerLength,
        containerWidth,
        containerHeight
      }),
    [containerLength, containerWidth, containerHeight]
  )

  const gridMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#bdbdbd',
        transparent: true,
        opacity: 0.68,
        depthTest: true,
        depthWrite: false
      }),
    []
  )

  useFrame(() => {
    /**
     * Reset all wall grids first.
     */
    if (xMinRef.current) xMinRef.current.visible = false
    if (xMaxRef.current) xMaxRef.current.visible = false
    if (zMinRef.current) zMinRef.current.visible = false
    if (zMaxRef.current) zMaxRef.current.visible = false

    const cameraX = camera.position.x
    const cameraZ = camera.position.z

    /**
     * Show TWO back wall grids every time:
     *
     * 1. One opposite X wall
     * 2. One opposite Z wall
     *
     * This creates a visible container corner / two-wall angle,
     * but still avoids showing the front wall grid.
     */

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

  useEffect(() => {
    return () => {
      xMinGeometry.dispose()
      xMaxGeometry.dispose()
      zMinGeometry.dispose()
      zMaxGeometry.dispose()
      gridMaterial.dispose()
    }
  }, [xMinGeometry, xMaxGeometry, zMinGeometry, zMaxGeometry, gridMaterial])

  return (
    <group>
      <lineSegments ref={xMinRef} geometry={xMinGeometry} material={gridMaterial} />
      <lineSegments ref={xMaxRef} geometry={xMaxGeometry} material={gridMaterial} />
      <lineSegments ref={zMinRef} geometry={zMinGeometry} material={gridMaterial} />
      <lineSegments ref={zMaxRef} geometry={zMaxGeometry} material={gridMaterial} />
    </group>
  )
}

const ContainerScene = ({ previewData }: { previewData: PreviewData }): React.JSX.Element => {
  const containerLength = previewData.containerType.dimensions.internalLengthCm * SCALE
  const containerWidth = previewData.containerType.dimensions.internalWidthCm * SCALE
  const containerHeight = previewData.containerType.dimensions.internalHeightCm * SCALE

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
        args={[Math.max(containerLength, containerWidth), 24, '#b8b8b8', '#d8d8d8']}
        position={[0, -containerHeight / 2 + 0.02, 0]}
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
