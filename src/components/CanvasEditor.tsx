import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';

interface Point {
  x: number;
  y: number;
}


export interface CanvasEditorProps {
  name?: string;
  content?: string;
  onNameChange?: (name: string) => void;
  onContentChange?: (content: string) => void;
  loadContentSignal?: any; // Para forzar recarga desde el padre
  showGrid?: boolean;
  showRulers?: boolean;
}

const CanvasEditor = forwardRef<any, CanvasEditorProps>(({ name, content, onNameChange, onContentChange, loadContentSignal, showGrid, showRulers }, ref) => {
    // Historial para deshacer/rehacer
    const [history, setHistory] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);
    const [selectAllActive, setSelectAllActive] = useState(false);
    // Guardar estado actual en el historial
    const saveToHistory = () => {
      if (!canvasRef.current) return;
      const dataUrl = canvasRef.current.toDataURL();
      setHistory(prev => [...prev, dataUrl]);
      setRedoStack([]);
    };

    const restoreFromDataUrl = (dataUrl: string) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      const img = new window.Image();
      img.onload = () => {
        ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx?.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    };

    // Estado de zoom
    const [zoom, setZoom] = useState(1);

    // Métodos expuestos al padre
    useImperativeHandle(ref, () => ({
      undo: () => {
        if (history.length === 0) return;
        const prev = [...history];
        const last = prev.pop();
        if (last) {
          setRedoStack(r => [canvasRef.current!.toDataURL(), ...r]);
          restoreFromDataUrl(last);
          setHistory(prev => prev.slice(0, -1));
        }
      },
      redo: () => {
        if (redoStack.length === 0) return;
        const [next, ...rest] = redoStack;
        setHistory(prev => [...prev, canvasRef.current!.toDataURL()]);
        restoreFromDataUrl(next);
        setRedoStack(rest);
      },
      copy: () => {
        if (!canvasRef.current) return;
        canvasRef.current.toBlob(blob => {
          if (blob) {
            const item = new window.ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]);
          }
        });
      },
      paste: async () => {
        if (!canvasRef.current) return;
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            for (const type of item.types) {
              if (type.startsWith('image/')) {
                const blob = await item.getType(type);
                const img = new window.Image();
                img.onload = () => {
                  const ctx = canvasRef.current!.getContext('2d');
                  ctx?.drawImage(img, 0, 0);
                };
                img.src = URL.createObjectURL(blob);
                return;
              }
            }
          }
        } catch (e) {
          alert('No se pudo pegar: ' + e);
        }
      },
      selectAll: () => {
        setSelectAllActive(true);
        setTimeout(() => setSelectAllActive(false), 600);
      },
      zoomIn: () => {
        setZoom(z => Math.min(z + 0.1, 2));
      },
      zoomOut: () => {
        setZoom(z => Math.max(z - 0.1, 0.2));
      }
    }));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  // Dibujar cuadrícula si showGrid está activo
  React.useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    // Limpiar solo la cuadrícula previa (no el contenido)
    // Redibujar cuadrícula sobre el contenido
    if (typeof showGrid === 'boolean' && showGrid) {
      // Guardar el estado actual de la imagen
      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      // Redibujar la imagen
      ctx.putImageData(imageData, 0, 0);
      // Dibujar la cuadrícula
      const gridSpacing = 40 * zoom; // Espaciado base ajustado al zoom
      ctx.save();
      ctx.strokeStyle = '#e0e4ef';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      for (let x = 0; x < canvasRef.current.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasRef.current.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvasRef.current.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasRef.current.width, y);
        ctx.stroke();
      }
      ctx.restore();
    } else if (typeof showGrid === 'boolean' && !showGrid) {
      // Si se desactiva la cuadrícula, solo limpiar el canvas (no el contenido)
      // Forzar un "redraw" del contenido (simulado: limpiar y volver a dibujar)
      // Aquí no hay contenido serializado, así que solo refresca el canvas
      // (En el futuro, aquí se debería redibujar el contenido real)
      // Por ahora, no hace nada
    }
  }, [showGrid, zoom]);
  // Estado para el nombre del lienzo y edición
  const [canvasName, setCanvasName] = useState(name || 'Sin título');
  const [editingName, setEditingName] = useState(false);

  // Permitir que el nombre se actualice desde fuera
  React.useEffect(() => {
    if (typeof name === 'string') setCanvasName(name);
  }, [name]);

  // Permitir cargar contenido desde fuera (simulado: solo limpia el canvas)
  React.useEffect(() => {
    if (canvasRef.current && typeof content === 'string') {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        // Aquí podrías dibujar el contenido si tienes un formato serializado
      }
    }
  }, [content, loadContentSignal]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDrawing(true);
    setLastPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    saveToHistory();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing || !canvasRef.current || !lastPoint) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const newPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    ctx.strokeStyle = '#2a4d8f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(newPoint.x, newPoint.y);
    ctx.stroke();
    setLastPoint(newPoint);
  };



  const handlePointerUp = () => {
    setDrawing(false);
    setLastPoint(null);
  };

  // Estado para la posición del puntero (para reglas)
  const [pointerPos, setPointerPos] = useState<{x: number, y: number}>({x: 0, y: 0});

  // Unidades: 1px = 0.2646 mm (canvas de 1000px ≈ 264.6mm)
  const pxToMm = (px: number) => px * 0.2646;
  const pxToCm = (px: number) => pxToMm(px) / 10;

  // Handlers para reglas
  const handlePointerMoveWithRuler = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerMove(e);
    const rect = e.currentTarget.getBoundingClientRect();
    setPointerPos({
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    });
  };
  const handlePointerLeaveWithRuler = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerUp();
    setPointerPos({x: 0, y: 0});
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
      {/* Apartado para el nombre del lienzo */}
      <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', marginBottom: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {editingName ? (
          <input
            type="text"
            value={canvasName}
            autoFocus
            onChange={e => {
              setCanvasName(e.target.value);
              if (onNameChange) onNameChange(e.target.value);
            }}
            onBlur={() => setEditingName(false)}
            onKeyDown={e => {
              if (e.key === 'Enter') setEditingName(false);
            }}
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#2a4d8f',
              border: '1px solid #e0e4ef',
              borderRadius: 6,
              padding: '6px 16px',
              outline: 'none',
              minWidth: 120,
              textAlign: 'center',
              background: '#f8fafd',
            }}
          />
        ) : (
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#2a4d8f',
              background: '#f8fafd',
              borderRadius: 6,
              padding: '6px 16px',
              cursor: 'pointer',
              userSelect: 'none',
              border: '1px solid transparent',
              minWidth: 120,
              textAlign: 'center',
              transition: 'border 0.2s',
            }}
            title="Haz doble clic para editar el nombre"
            onDoubleClick={() => setEditingName(true)}
          >
            {canvasName}
          </span>
        )}
      </div>
      <div style={{ width: '100%', maxWidth: 1100, height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        {showRulers && (
          <>
            {/* Regla vertical izquierda */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 36,
              height: '100%',
              background: '#f4f6fa',
              borderRight: '1px solid #e0e4ef',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 10,
              userSelect: 'none',
              pointerEvents: 'none',
            }}>
              {Array.from({length: Math.floor((window.innerHeight * 0.65) / (10 * zoom)) + 1}).map((_, i) => {
                const yPx = i * 10 * zoom;
                const yMm = pxToMm(i * 10);
                return (
                  <div key={i} style={{position:'absolute',top: yPx, left: 0, width: '100%', height: 1, borderTop: i % 10 === 0 ? '2px solid #b0b8d0' : '1px solid #d0d4e0'}}>
                    <span style={{position:'absolute',left:2,top:-6,color:'#22335a',fontWeight: i%10===0?700:400,fontSize:i%10===0?11:9}}>{i%10===0 ? `${Math.round(yMm/10)}` : ''}</span>
                  </div>
                );
              })}
              {/* Indicador de posición del puntero */}
              <div style={{position:'absolute',top:pointerPos.y*zoom-6,left:0,width:'100%',height:12,background:'rgba(44,120,255,0.08)',borderLeft:'2px solid #2a4d8f',pointerEvents:'none'}} />
            </div>
            {/* Regla horizontal inferior */}
            <div style={{
              position: 'absolute',
              left: 36,
              bottom: 0,
              width: 'calc(100% - 36px)',
              height: 28,
              background: '#f4f6fa',
              borderTop: '1px solid #e0e4ef',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              fontSize: 10,
              userSelect: 'none',
              pointerEvents: 'none',
            }}>
              {Array.from({length: Math.floor(1000 / (10 * zoom)) + 1}).map((_, i) => {
                const xPx = i * 10 * zoom;
                const xMm = pxToMm(i * 10);
                return (
                  <div key={i} style={{position:'absolute',left: xPx, bottom: 0, width: 1, height: '100%', borderLeft: i % 10 === 0 ? '2px solid #b0b8d0' : '1px solid #d0d4e0'}}>
                    <span style={{position:'absolute',bottom:2,left:-6,color:'#22335a',fontWeight: i%10===0?700:400,fontSize:i%10===0?11:9}}>{i%10===0 ? `${Math.round(xMm/10)}` : ''}</span>
                  </div>
                );
              })}
              {/* Indicador de posición del puntero */}
              <div style={{position:'absolute',left:pointerPos.x*zoom-6,bottom:0,width:12,height:'100%',background:'rgba(44,120,255,0.08)',borderTop:'2px solid #2a4d8f',pointerEvents:'none'}} />
            </div>
          </>
        )}
        <canvas
          ref={canvasRef}
          width={1000}
          height={window.innerHeight * 0.65}
          style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 12px #0001',
            border: selectAllActive ? '3px dashed #2a4d8f' : '1px solid #e0e4ef',
            touchAction: 'none',
            width: '100%',
            height: '100%',
            maxWidth: '1000px',
            maxHeight: '70vh',
            minHeight: 350,
            minWidth: 350,
            display: 'block',
            transition: 'border 0.2s, transform 0.2s',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={showRulers ? handlePointerMoveWithRuler : handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={showRulers ? handlePointerLeaveWithRuler : handlePointerUp}
        />
      </div>
    </div>
  );
});

export default CanvasEditor;
