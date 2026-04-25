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

const SCALE = 0.01 // 1 cm = 0.01 scene units

const GROUP_COLORS = [
  '#b07a3f',
  '#6fa85b',
  '#5b7db1',
  '#c78f52',
  '#8f6fb8',
  '#c95f5f',
  '#5fa8a1',
  '#9a9a3f'
]

const getGroupKey = (item: PlacedCargoItem): string => {
  const normalizedShape = item.shape === 'box' ? 'carton' : item.shape

  return [
    normalizedShape,
    item.placedLengthCm,
    item.placedWidthCm,
    item.placedHeightCm,
    item.cargoDescription
  ].join('|')
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

const createCargoFaceTexture = ({
  label,
  color,
  showLabel
}: {
  label?: string
  color: string
  showLabel: boolean
}): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = 1024
  canvas.height = 512

  if (!context) {
    return new THREE.CanvasTexture(canvas)
  }

  context.clearRect(0, 0, canvas.width, canvas.height)

  /**
   * The cargo color becomes the actual face background.
   * This prevents the PO from looking like a floating layer.
   */
  context.fillStyle = color
  context.fillRect(0, 0, canvas.width, canvas.height)

  /**
   * Slight shading lines so the face still has depth.
   */
  context.fillStyle = 'rgba(255, 255, 255, 0.08)'
  context.fillRect(0, 0, canvas.width, canvas.height / 3)

  context.fillStyle = 'rgba(0, 0, 0, 0.08)'
  context.fillRect(0, canvas.height * 0.78, canvas.width, canvas.height * 0.22)

  const safeLabel = label?.trim() ?? ''

  if (showLabel && safeLabel) {
    let fontSize = 120
    context.font = `bold ${fontSize}px Arial`

    while (fontSize > 44 && context.measureText(safeLabel).width > canvas.width - 180) {
      fontSize -= 4
      context.font = `bold ${fontSize}px Arial`
    }

    const textWidth = context.measureText(safeLabel).width
    const paddingX = 42
    const paddingY = 24

    const labelWidth = Math.min(textWidth + paddingX * 2, canvas.width - 90)
    const labelHeight = fontSize + paddingY * 2

    const labelX = (canvas.width - labelWidth) / 2
    const labelY = (canvas.height - labelHeight) / 2

    /**
     * Reduced PO background.
     * It is only behind the text and blended into the item face.
     */
    context.fillStyle = 'rgba(255, 255, 255, 0.52)'
    drawRoundedRect(context, labelX, labelY, labelWidth, labelHeight, 18)
    context.fill()

    context.strokeStyle = 'rgba(0, 0, 0, 0.45)'
    context.lineWidth = 5
    drawRoundedRect(context, labelX, labelY, labelWidth, labelHeight, 18)
    context.stroke()

    context.fillStyle = '#111111'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(safeLabel, canvas.width / 2, canvas.height / 2)
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

const BoxWithEdges = ({
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
  const geometry = useMemo(() => new THREE.BoxGeometry(size[0], size[1], size[2]), [size])
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry])

  const faceTextures = useMemo(() => {
    const sideTexture = createCargoFaceTexture({
      label,
      color,
      showLabel: true
    })

    const topBottomTexture = createCargoFaceTexture({
      label,
      color,
      showLabel: false
    })

    return {
      sideTexture,
      topBottomTexture
    }
  }, [label, color])

  const materials = useMemo(() => {
    const sideMaterial = new THREE.MeshStandardMaterial({
      map: faceTextures.sideTexture,
      color: '#ffffff',
      roughness: 0.85,
      metalness: 0,
      toneMapped: false
    })

    const topBottomMaterial = new THREE.MeshStandardMaterial({
      map: faceTextures.topBottomTexture,
      color: '#ffffff',
      roughness: 0.85,
      metalness: 0,
      toneMapped: false
    })

    /**
     * BoxGeometry material order:
     * 0 right, 1 left, 2 top, 3 bottom, 4 front, 5 back.
     *
     * PO is printed on side faces.
     * Top and bottom keep the clean cargo color.
     */
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

const ContainerScene = ({ previewData }: { previewData: PreviewData }): React.JSX.Element => {
  const containerLength = previewData.containerType.dimensions.internalLengthCm * SCALE
  const containerWidth = previewData.containerType.dimensions.internalWidthCm * SCALE
  const containerHeight = previewData.containerType.dimensions.internalHeightCm * SCALE

  const groupColorMap = useMemo(() => {
    const map = new Map<string, string>()

    previewData.placedCargoItems.forEach((item) => {
      const key = getGroupKey(item)

      if (!map.has(key)) {
        map.set(key, GROUP_COLORS[map.size % GROUP_COLORS.length])
      }
    })

    return map
  }, [previewData])

  const placedItems = useMemo(
    () =>
      previewData.placedCargoItems.map((item, index) => {
        const sizeX = item.placedLengthCm * SCALE
        const sizeY = item.placedHeightCm * SCALE
        const sizeZ = item.placedWidthCm * SCALE

        const x = -containerLength / 2 + item.xCm * SCALE + sizeX / 2
        const y = -containerHeight / 2 + item.zCm * SCALE + sizeY / 2
        const z = -containerWidth / 2 + item.yCm * SCALE + sizeZ / 2

        return {
          key: `${item.cargoDescription}-${item.unitIndex}-${index}`,
          color: item.color || groupColorMap.get(getGroupKey(item)) || '#6fa85b',
          label: item.poNumber || String(item.unitIndex),
          position: [x, y, z] as [number, number, number],
          size: [sizeX, sizeY, sizeZ] as [number, number, number]
        }
      }),
    [previewData, containerLength, containerHeight, containerWidth, groupColorMap]
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
      <ambientLight intensity={1.1} />
      <directionalLight position={[8, 10, 8]} intensity={1.2} />
      <directionalLight position={[-6, 6, -4]} intensity={0.5} />

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
        <mesh geometry={shellGeometry}>
          <meshStandardMaterial color="#9e9e9e" transparent opacity={0.06} />
        </mesh>

        <lineSegments geometry={shellEdgesGeometry}>
          <lineBasicMaterial color="#666666" />
        </lineSegments>
      </group>

      {placedItems.map((item) => (
        <BoxWithEdges
          key={item.key}
          position={item.position}
          size={item.size}
          color={item.color}
          label={item.label}
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

    /**
     * This delay allows React to paint:
     * "Loading, please wait..."
     * before the heavy 3D scene starts rendering.
     */
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
              Loading, please wait...
            </div>
          )}
        </div>
      </SceneWrap>
    </PreviewViewport>
  )
}

export default ContainerPlanPreview3D
