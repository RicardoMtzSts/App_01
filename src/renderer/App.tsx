
import React, { useState } from 'react';

// Tipos globales para Electron y bibliotecas externas
declare global {
  interface Window {
    electronAPI?: {
      openCanvasFile?: () => Promise<any>;
      saveCanvasFile?: (data: string) => Promise<any>;
      createFolderWithDocs?: (folderName: string, docs: any[]) => Promise<any>;
    };
    jspdf?: any;
    jspdf_umd?: any;
    PptxGenJS?: any;
  }
}
import PanelLayout from '../components/PanelLayout';
import CanvasEditor from '../components/CanvasEditor';


type Section = 'inicio' | 'editor' | 'datos' | 'configuracion' | 'explorador' | 'multiventana';

const sections: { key: Section; label: string }[] = [
  { key: 'inicio', label: 'Inicio' },
  { key: 'editor', label: 'Editor' },
  { key: 'datos', label: 'Datos' },
  { key: 'configuracion', label: 'Configuración' },
  { key: 'explorador', label: 'Explorador' },
  { key: 'multiventana', label: 'Multi-ventana' },
];

interface LeftPanelProps {
  selected: Section;
  onSelect: (section: Section) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ selected, onSelect }) => (
  <nav style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={{ fontWeight: 700, fontSize: 22, color: '#fff', textAlign: 'center', marginBottom: 32 }}>GraphOS</div>
    {sections.map(({ key, label }) => (
      <button
        key={key}
        style={{
          ...menuBtnStyle,
          background: selected === key ? '#2a4d8f' : 'none',
          fontWeight: selected === key ? 700 : 400,
        }}
        onClick={() => onSelect(key)}
      >
        {label}
      </button>
    ))}
  </nav>
);

const menuBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#fff',
  fontSize: 16,
  padding: '12px 24px',
  textAlign: 'left',
  cursor: 'pointer',
  borderRadius: 6,
  margin: '0 12px',
  transition: 'background 0.2s',
};


// Nuevo: props para carpetas y función para agregar
interface CenterPanelProps {
  section: Section;
  onStartEditor: () => void;
  projectFolders: { name: string; path: string; docs: { name: string }[] }[];
  addProjectFolder: (folder: { name: string; path: string; docs: { name: string }[] }) => void;
}

const CenterPanel: React.FC<CenterPanelProps> = ({ section, onStartEditor, projectFolders, addProjectFolder }) => {
  switch (section) {
    case 'inicio':
      return (
        <div style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h2 style={{ color: '#2a4d8f', margin: 0 }}>Inicio</h2>
            <button
              style={{ background: '#2a4d8f', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: '1em', cursor: 'pointer', fontWeight: 600 }}
              onClick={onStartEditor}
            >
              + Nuevo proyecto
            </button>
          </div>
          <div style={{ marginBottom: 36 }}>
            <h3 style={{ color: '#22335a', marginBottom: 12 }}>Plantillas Recientes</h3>
            <div style={{ background: '#f8fafd', borderRadius: 8, minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontStyle: 'italic', padding: 18 }}>
              (Aquí aparecerán las plantillas usadas recientemente)
              <button style={{ marginLeft: 24, background: '#e0e4ef', border: 'none', borderRadius: 6, padding: '6px 18px', cursor: 'pointer', color: '#22335a', fontWeight: 500 }} onClick={onStartEditor}>Usar plantilla reciente</button>
            </div>
          </div>
          <div>
            <h3 style={{ color: '#22335a', marginBottom: 12 }}>Plantillas Recomendadas</h3>
            <div style={{ background: '#f8fafd', borderRadius: 8, minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontStyle: 'italic', padding: 18 }}>
              (Aquí aparecerán las plantillas recomendadas de organizadores gráficos)
              <button style={{ marginLeft: 24, background: '#e0e4ef', border: 'none', borderRadius: 6, padding: '6px 18px', cursor: 'pointer', color: '#22335a', fontWeight: 500 }} onClick={onStartEditor}>Usar plantilla recomendada</button>
            </div>
          </div>
        </div>
      );
    case 'editor':
      // Lógica de pestaña activa y menú desplegable para 'Archivo'
      const [activeTab, setActiveTab] = React.useState<string | null>(null);
      const [menuOpen, setMenuOpen] = React.useState<string | null>(null);

      // Cerrar menú al hacer clic fuera
      React.useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e: MouseEvent) => {
          const menu = document.getElementById('menu-bar');
          if (menu && !menu.contains(e.target as Node)) {
            setMenuOpen(null);
            setActiveTab(null);
          }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
      }, [menuOpen]);
      // Estado para múltiples canvas, ahora con showGrid
      type CanvasType = { id: number; name: string; content: string; loadSignal: number; showGrid?: boolean; showRulers?: boolean };
      const [canvases, setCanvases] = React.useState<CanvasType[]>([
        { id: 1, name: 'Sin título', content: '', loadSignal: 0, showGrid: false, showRulers: false }
      ]);
      const [selectedCanvasId, setSelectedCanvasId] = React.useState<number>(1);
      // Para crear nuevos canvas con nombre personalizado
      const [showNewCanvasModal, setShowNewCanvasModal] = React.useState(false);
      const [newCanvasName, setNewCanvasName] = React.useState('');
      // Estado para modal de nueva carpeta
      const [showNewFolderModal, setShowNewFolderModal] = React.useState(false);
      const [folderName, setFolderName] = React.useState('');
      const [selectedDocs, setSelectedDocs] = React.useState<number[]>([]);
      const tabList = ['Archivo','Editar','Ver','Insertar','Formato','Ayuda'];
      const exportOptions = ['PNG', 'JPG', 'SVG', 'PDF', 'PPTX', 'XML', 'JSON'];
      const menuItems: Record<string, string[] | undefined> = {
        'Archivo': [
          'Nueva carpeta',
          'Abrir',
          'Guardar',
          'Exportar',
        ],
        'Editar': [
          'Color',
          'Contorno',
        ],
        'Ver': [
          'Cuadrícula',
          'Reglas',
          'Paneles laterales',
          'Ajustes de visualización',
          'Navegación por pestañas',
        ],
        'Insertar': [
          'Imagen',
          'Texto',
          'Forma',
          'Icono',
          'Enlace',
        ],
        'Formato': [
          'Alinear',
          'Distribuir',
          'Agrupar',
          'Ordenar (delante/detrás)',
        ],
        'Ayuda': [
          'Tutoriales',
          'Acceso a comunidad',
          'Soporte',
        ],
      };
      // Documentos canvas reales para carpetas
      const canvasDocs = canvases.map(c => ({ id: c.id, name: c.name }));

      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <h2 style={{ color: '#2a4d8f', marginBottom: 8 }}>Editor de Organizadores</h2>
          <p style={{ color: '#444', marginBottom: 10 }}>Dibuja a mano alzada para probar el canvas.</p>
          {/* Barra de menús fija arriba */}
          <nav id="menu-bar" style={{
            display: 'flex',
            gap: 2,
            background: '#f8fafd',
            borderRadius: 8,
            boxShadow: '0 1px 6px #0001',
            border: '1px solid #e0e4ef',
            marginBottom: 18,
            padding: '0 8px',
            minWidth: 600,
            maxWidth: 900,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            height: 44,
            position: 'relative',
            alignSelf: 'center'
          }}>
            {tabList.map(tab => (
              <div key={tab} style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  style={{
                    background: menuOpen === tab ? '#e0e4ef' : 'none',
                    border: 'none',
                    color: '#22335a',
                    fontWeight: 600,
                    fontSize: 16,
                    padding: '10px 22px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    margin: '0 2px',
                  }}
                  onClick={() => {
                    setMenuOpen(menuOpen === tab ? null : tab);
                    setActiveTab(tab);
                  }}
                >
                  {tab}
                </button>
                {menuOpen === tab && (
                  <div style={{
                    position: 'absolute',
                    top: 44,
                    left: 0,
                    background: '#fff',
                    border: '1px solid #e0e4ef',
                    borderRadius: 8,
                    boxShadow: '0 8px 32px #0004',
                    minWidth: 180,
                    zIndex: 2000,
                  }}>
                    {menuItems[tab]?.map((item: string) => (
                      <div
                        key={item}
                        style={{
                          padding: '10px 18px',
                          color: '#22335a',
                          fontSize: 15,
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          background: 'none',
                          transition: 'background 0.15s',
                          position: 'relative',
                        }}
                        tabIndex={0}
                        onMouseDown={e => e.preventDefault()}
                        onClick={e => {
                          if (tab === 'Archivo' && item === 'Nueva carpeta') {
                            setShowNewFolderModal(true);
                            setActiveTab(null);
                          }
                          if (tab === 'Archivo' && item === 'Abrir') {
                            if (!window.electronAPI?.openCanvasFile) {
                              alert('API de apertura no disponible');
                              setActiveTab(null);
                              return;
                            }
                            window.electronAPI.openCanvasFile().then(res => {
                              if (res.ok) {
                                try {
                                  const data = JSON.parse(res.content);
                                  setCanvases(prev => prev.map(c => c.id === selectedCanvasId ? { ...c, name: data.name || 'Sin título', content: data.content || '', loadSignal: (c.loadSignal || 0) + 1 } : c));
                                  alert('Canvas cargado correctamente');
                                } catch {
                                  alert('El archivo no tiene formato válido');
                                }
                              } else if (res.error !== 'cancelled') {
                                alert('Error al abrir: ' + res.error);
                              }
                            });
                            setActiveTab(null);
                          }
                          if (tab === 'Ver' && item === 'Cuadrícula') {
                            // Toggle cuadrícula solo en el canvas seleccionado
                            setCanvases(prev => prev.map(c => c.id === selectedCanvasId ? { ...c, showGrid: !c.showGrid } : c));
                            setActiveTab(null);
                            setMenuOpen(null);
                            return;
                          }
                          if (tab === 'Ver' && item === 'Reglas') {
                            // Toggle reglas solo en el canvas seleccionado
                            setCanvases(prev => prev.map(c => c.id === selectedCanvasId ? { ...c, showRulers: !c.showRulers } : c));
                            setActiveTab(null);
                            setMenuOpen(null);
                            return;
                          }
                          if (tab === 'Archivo' && item === 'Guardar') {
                            if (!window.electronAPI?.saveCanvasFile) {
                              alert('API de guardado no disponible');
                              setActiveTab(null);
                              return;
                            }
                            // Guardar solo el canvas seleccionado
                            const canvas = canvases.find(c => c.id === selectedCanvasId);
                            if (!canvas) return;
                            const data = JSON.stringify({ name: canvas.name, content: canvas.content });
                            window.electronAPI.saveCanvasFile(data).then(res => {
                              if (res.ok) {
                                alert('Canvas guardado en: ' + res.filePath);
                              } else if (res.error !== 'cancelled') {
                                alert('Error al guardar: ' + res.error);
                              }
                            });
                            setActiveTab(null);
                          }
                        }}
                        onMouseEnter={e => {
                          // Mostrar submenú de exportar
                          if (tab === 'Archivo' && item === 'Exportar') {
                            setActiveTab('Exportar');
                          }
                        }}
                      >
                        {item}
                        {/* Submenú de exportar */}
                        {tab === 'Archivo' && item === 'Exportar' && activeTab === 'Exportar' && (
                          <div style={{
                            position: 'absolute',
                            left: '100%',
                            top: 0,
                            background: '#fff',
                            border: '1px solid #e0e4ef',
                            borderRadius: 8,
                            boxShadow: '0 8px 32px #0004',
                            minWidth: 180,
                            zIndex: 2100,
                          }}>
                            {exportOptions.map((opt: string) => (
                              <div
                                key={opt}
                                style={{
                                  padding: '10px 18px',
                                  color: '#22335a',
                                  fontSize: 15,
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #f0f0f0',
                                  background: 'none',
                                  transition: 'background 0.15s',
                                }}
                                onClick={async () => {
                                  // Exportar según opción
                                  const canvasElem = document.querySelector('canvas');
                                  const canvas = canvases.find(c => c.id === selectedCanvasId);
                                  if (!canvasElem || !canvas) {
                                    alert('No hay canvas para exportar');
                                    return;
                                  }
                                  if (opt === 'PNG' || opt === 'JPG') {
                                    const mime = opt === 'PNG' ? 'image/png' : 'image/jpeg';
                                    const dataUrl = canvasElem.toDataURL(mime, 1.0);
                                    const a = document.createElement('a');
                                    a.href = dataUrl;
                                    a.download = `${canvas.name || 'canvas'}.${opt.toLowerCase()}`;
                                    a.click();
                                  } else if (opt === 'SVG') {
                                    const dataUrl = canvasElem.toDataURL('image/png');
                                    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${canvasElem.width}' height='${canvasElem.height}'><image href='${dataUrl}' width='100%' height='100%'/></svg>`;
                                    const blob = new Blob([svg], { type: 'image/svg+xml' });
                                    const a = document.createElement('a');
                                    a.href = URL.createObjectURL(blob);
                                    a.download = `${canvas.name || 'canvas'}.svg`;
                                    a.click();
                                  } else if (opt === 'PDF') {
                                    const dataUrl = canvasElem.toDataURL('image/png');
                                    const loadJsPDF = () => new Promise(resolve => {
                                      if (window.jspdf) return resolve(window.jspdf);
                                      const script = document.createElement('script');
                                      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                                      script.onload = () => resolve(window.jspdf || window.jspdf_umd || window.jspdf);
                                      document.body.appendChild(script);
                                    });
                                    loadJsPDF().then((jsPDF: any) => {
                                      const _jsPDF: any = jsPDF.jsPDF ? jsPDF.jsPDF : jsPDF;
                                      const doc = new _jsPDF({ orientation: 'landscape', unit: 'px', format: [canvasElem.width, canvasElem.height] });
                                      doc.addImage(dataUrl, 'PNG', 0, 0, canvasElem.width, canvasElem.height);
                                      doc.save(`${canvas.name || 'canvas'}.pdf`);
                                    });
                                  } else if (opt === 'PPTX') {
                                    const dataUrl = canvasElem.toDataURL('image/png');
                                    const loadPptxGen = () => new Promise(resolve => {
                                      if (window.PptxGenJS) return resolve(window.PptxGenJS);
                                      const script = document.createElement('script');
                                      script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.11.0/dist/pptxgen.bundle.js';
                                      script.onload = () => resolve(window.PptxGenJS);
                                      document.body.appendChild(script);
                                    });
                                    loadPptxGen().then((PptxGenJS: any) => {
                                      const _PptxGenJS: any = PptxGenJS.default ? PptxGenJS.default : PptxGenJS;
                                      const pptx = new _PptxGenJS();
                                      const slide = pptx.addSlide();
                                      const w = canvasElem.width / 96;
                                      const h = canvasElem.height / 96;
                                      slide.addImage({ data: dataUrl, x: 0, y: 0, w, h });
                                      pptx.writeFile({ fileName: `${canvas.name || 'canvas'}.pptx` });
                                    });
                                  } else if (opt === 'XML') {
                                    const xml = `<canvas><name>${canvas.name}</name><content>${canvas.content}</content></canvas>`;
                                    const blob = new Blob([xml], { type: 'application/xml' });
                                    const a = document.createElement('a');
                                    a.href = URL.createObjectURL(blob);
                                    a.download = `${canvas.name || 'canvas'}.xml`;
                                    a.click();
                                  } else if (opt === 'JSON') {
                                    const json = JSON.stringify({ name: canvas.name, content: canvas.content });
                                    const blob = new Blob([json], { type: 'application/json' });
                                    const a = document.createElement('a');
                                    a.href = URL.createObjectURL(blob);
                                    a.download = `${canvas.name || 'canvas'}.json`;
                                    a.click();
                                  }
                                  setActiveTab(null);
                                }}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          {/* Lista de canvas en columna debajo de la barra de menús */}
          <div style={{ width: '100%', maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', margin: '0 auto' }}>
            {/* Refs persistentes para cada CanvasEditor */}
            {(() => {
              const canvasRefs = React.useRef<Record<number, React.RefObject<any>>>({});
              canvases.forEach((c: CanvasType) => {
                if (!canvasRefs.current[c.id]) {
                  canvasRefs.current[c.id] = React.createRef();
                }
              });
              Object.keys(canvasRefs.current).forEach((id: string) => {
                if (!canvases.some((c: CanvasType) => c.id === Number(id))) {
                  delete canvasRefs.current[Number(id)];
                }
              });
              return canvases.map((c: CanvasType) => (
                <div key={c.id} style={{
                  border: c.id === selectedCanvasId ? '2px solid #2a4d8f' : '1px solid #e0e4ef',
                  borderRadius: 12,
                  boxShadow: c.id === selectedCanvasId ? '0 2px 12px #2a4d8f22' : '0 2px 12px #0001',
                  background: c.id === selectedCanvasId ? '#f8fafd' : '#fff',
                  marginBottom: 8,
                  width: '100%',
                  maxWidth: 1100,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'box-shadow 0.2s, border 0.2s',
                  padding: 0
                }}
                  onClick={() => setSelectedCanvasId(c.id)}
                >
                  <CanvasEditor
                    ref={canvasRefs.current[c.id]}
                    name={c.name}
                    content={c.content}
                    onNameChange={(name: string) => setCanvases((prev: CanvasType[]) => prev.map((x: CanvasType) => x.id === c.id ? { ...x, name } : x))}
                    onContentChange={(content: string) => setCanvases((prev: CanvasType[]) => prev.map((x: CanvasType) => x.id === c.id ? { ...x, content } : x))}
                    loadContentSignal={c.loadSignal}
                    showGrid={!!c.showGrid}
                    showRulers={!!c.showRulers}
                  />
                  {/* Botones de edición al lado del botón de eliminar */}
                  <div style={{ position: 'absolute', top: 10, right: 18, display: 'flex', gap: 8, zIndex: 2 }}>
                    {/* Botones de Zoom */}
                    <button
                      style={{ background: '#fff', color: '#2a4d8f', border: '1px solid #e0e4ef', borderRadius: '50%', width: 28, height: 28, fontWeight: 700, cursor: 'pointer', fontSize: 18 }}
                      title="Aumentar zoom"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); canvasRefs.current[c.id]?.current?.zoomIn && canvasRefs.current[c.id].current.zoomIn(); }}
                    >＋</button>
                    <button
                      style={{ background: '#fff', color: '#2a4d8f', border: '1px solid #e0e4ef', borderRadius: '50%', width: 28, height: 28, fontWeight: 700, cursor: 'pointer', fontSize: 18 }}
                      title="Disminuir zoom"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); canvasRefs.current[c.id]?.current?.zoomOut && canvasRefs.current[c.id].current.zoomOut(); }}
                    >－</button>
                    {/* ...botones de edición... */}
                    <button
                      style={{ background: '#fff', color: '#2a4d8f', border: '1px solid #e0e4ef', borderRadius: '50%', width: 28, height: 28, fontWeight: 700, cursor: 'pointer', fontSize: 16 }}
                      title="Deshacer"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); canvasRefs.current[c.id]?.current?.undo && canvasRefs.current[c.id].current.undo(); }}
                    >↺</button>
                    <button
                      style={{ background: '#fff', color: '#2a4d8f', border: '1px solid #e0e4ef', borderRadius: '50%', width: 28, height: 28, fontWeight: 700, cursor: 'pointer', fontSize: 16 }}
                      title="Rehacer"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); canvasRefs.current[c.id]?.current?.redo && canvasRefs.current[c.id].current.redo(); }}
                    >↻</button>
                    <button
                      style={{ background: '#fff', color: '#2a4d8f', border: '1px solid #e0e4ef', borderRadius: '50%', width: 28, height: 28, fontWeight: 700, cursor: 'pointer', fontSize: 16 }}
                      title="Copiar"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); canvasRefs.current[c.id]?.current?.copy && canvasRefs.current[c.id].current.copy(); }}
                    >⧉</button>
                    <button
                      style={{ background: '#fff', color: '#2a4d8f', border: '1px solid #e0e4ef', borderRadius: '50%', width: 28, height: 28, fontWeight: 700, cursor: 'pointer', fontSize: 16 }}
                      title="Pegar"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); canvasRefs.current[c.id]?.current?.paste && canvasRefs.current[c.id].current.paste(); }}
                    >📋</button>
                    <button
                      style={{ background: '#fff', color: '#2a4d8f', border: '1px solid #e0e4ef', borderRadius: '50%', width: 28, height: 28, fontWeight: 700, cursor: 'pointer', fontSize: 16 }}
                      title="Seleccionar todo"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); canvasRefs.current[c.id]?.current?.selectAll && canvasRefs.current[c.id].current.selectAll(); }}
                    >▣</button>
                    {canvases.length > 1 && (
                      <button
                        style={{ background: '#fff', color: '#b00', border: '1px solid #e0e4ef', borderRadius: '50%', width: 28, height: 28, fontWeight: 700, cursor: 'pointer', fontSize: 18 }}
                        title="Eliminar canvas"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          setCanvases((prev: CanvasType[]) => prev.length === 1 ? prev : prev.filter((x: CanvasType) => x.id !== c.id));
                          if (selectedCanvasId === c.id && canvases.length > 1) {
                            const idx = canvases.findIndex((x: CanvasType) => x.id === c.id);
                            const next = canvases[idx + 1] || canvases[idx - 1];
                            setSelectedCanvasId(next.id);
                          }
                        }}
                      >×</button>
                    )}
                  </div>
                </div>
              ));
            })()}
            {/* Botón para agregar nuevo canvas debajo de la lista */}
            <button
              style={{ background: '#2a4d8f', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 600, fontSize: 18, marginTop: 12, cursor: 'pointer', alignSelf: 'center' }}
              onClick={() => setShowNewCanvasModal(true)}
            >+ Nuevo canvas</button>
          </div>
          {/* Modal para nuevo canvas */}
          {showNewCanvasModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px #0003', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <h2 style={{ color: '#2a4d8f', margin: 0 }}>Nuevo canvas</h2>
                <label style={{ color: '#22335a', fontWeight: 500 }}>Nombre del canvas:</label>
                <input value={newCanvasName} onChange={e => setNewCanvasName(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e0e4ef', fontSize: 16 }} placeholder="Ej: Mapa conceptual" />
                <div style={{ display: 'flex', gap: 16, marginTop: 18, justifyContent: 'flex-end' }}>
                  <button onClick={() => { setShowNewCanvasModal(false); setNewCanvasName(''); }} style={{ background: '#eee', color: '#22335a', border: 'none', borderRadius: 6, padding: '8px 22px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                  <button
                    onClick={() => {
                      const nextId = Math.max(...canvases.map(c => c.id)) + 1;
                      setCanvases(prev => [...prev, { id: nextId, name: newCanvasName || `Sin título ${nextId}`, content: '', loadSignal: 0 }]);
                      setSelectedCanvasId(nextId);
                      setShowNewCanvasModal(false);
                      setNewCanvasName('');
                    }}
                    style={{ background: '#2a4d8f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 22px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
                    disabled={!newCanvasName.trim()}
                  >Crear</button>
                </div>
              </div>
            </div>
          )}
          {/* Modal para crear nueva carpeta */}
          {showNewFolderModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px #0003', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <h2 style={{ color: '#2a4d8f', margin: 0 }}>Crear nueva carpeta</h2>
                <label style={{ color: '#22335a', fontWeight: 500 }}>Nombre de la carpeta:</label>
                <input value={folderName} onChange={e => setFolderName(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e0e4ef', fontSize: 16 }} placeholder="Ej: Proyecto Tesis" />
                <label style={{ color: '#22335a', fontWeight: 500, marginTop: 8 }}>Selecciona documentos a integrar:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {canvasDocs.map((doc: { id: number; name: string }) => (
                    <label key={doc.id} style={{ fontSize: 15, color: '#22335a', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" checked={selectedDocs.includes(doc.id)} onChange={e => {
                        setSelectedDocs(prev => e.target.checked ? [...prev, doc.id] : prev.filter(i => i !== doc.id));
                      }} />
                      {doc.name}
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 18, justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowNewFolderModal(false)} style={{ background: '#eee', color: '#22335a', border: 'none', borderRadius: 6, padding: '8px 22px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                  <button
                    onClick={async () => {
                      // Obtener los documentos seleccionados
                      const docsToSave = canvases.filter(doc => selectedDocs.includes(doc.id)).map(doc => ({
                        name: doc.name,
                        content: doc.content
                      }));
                      if (!window.electronAPI || !window.electronAPI.createFolderWithDocs) {
                        alert('Error: La API de Electron no está disponible. Asegúrate de que contextIsolation esté en true y nodeIntegration en false.');
                        return;
                      }
                      try {
                        const res = await window.electronAPI.createFolderWithDocs(folderName, docsToSave);
                        if (res.ok) {
                          // Agregar la nueva carpeta al estado global
                          addProjectFolder({
                            name: folderName,
                            path: res.folderPath,
                            docs: docsToSave.map(d => ({ name: d.name }))
                          });
                          alert('Carpeta creada en: ' + res.folderPath);
                        } else {
                          alert('Error al crear carpeta: ' + (res.error || 'Desconocido'));
                        }
                      } catch (e: any) {
                        alert('Error IPC: ' + e.message);
                      }
                      setShowNewFolderModal(false);
                      setFolderName('');
                      setSelectedDocs([]);
                    }}
                    style={{ background: '#2a4d8f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 22px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
                    disabled={!folderName || selectedDocs.length === 0}
                  >Crear carpeta</button>
                </div>
              </div>
            </div>
          )}
          {/* Eliminado renderizado duplicado del canvas seleccionado */}
        </div>
      );
    // ...existing code...
    case 'datos':
      return (
        <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Sección de subir archivos */}
          <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', border: '1px solid #e0e4ef', padding: 32 }}>
            <h2 style={{ color: '#2a4d8f', marginBottom: 10 }}>Subir archivos</h2>
            <div style={{ marginBottom: 12, color: '#444' }}>Selecciona archivos o arrástralos aquí.</div>
            <div style={{ background: '#f8fafd', border: '1px dashed #2a4d8f', borderRadius: 8, padding: 32, textAlign: 'center', color: '#2a4d8f', fontWeight: 500, fontSize: 16 }}>
              <span>Arrastra y suelta archivos aquí</span>
            </div>
            <div style={{ marginTop: 14, color: '#888', fontSize: 14 }}>
              <strong>Formatos soportados:</strong> Imágenes (PNG, JPG, SVG), PDF, CSV, JSON, XML
            </div>
          </section>
          {/* Sección de archivos subidos */}
          <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', border: '1px solid #e0e4ef', padding: 32 }}>
            <h3 style={{ color: '#22335a', marginBottom: 10 }}>Archivos subidos</h3>
            <div style={{ color: '#888', fontStyle: 'italic', marginBottom: 8 }}>Aquí se mostrarán los archivos subidos, ordenados por tipo de formato.</div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 10 }}>
              <div style={{ minWidth: 120, color: '#2a4d8f' }}><strong>Imágenes</strong><div style={{ fontSize: 13, color: '#888' }}>(PNG, JPG, SVG)</div></div>
              <div style={{ minWidth: 120, color: '#2a4d8f' }}><strong>PDF</strong></div>
              <div style={{ minWidth: 120, color: '#2a4d8f' }}><strong>CSV</strong></div>
              <div style={{ minWidth: 120, color: '#2a4d8f' }}><strong>JSON</strong></div>
              <div style={{ minWidth: 120, color: '#2a4d8f' }}><strong>XML</strong></div>
            </div>
            <div style={{ marginTop: 18, color: '#bbb', fontSize: 14 }}>(Sin archivos subidos aún)</div>
          </section>
          {/* Sección de documentos canvas recientes */}
          <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', border: '1px solid #e0e4ef', padding: 32 }}>
            <h3 style={{ color: '#22335a', marginBottom: 10 }}>Documentos canvas recientes</h3>
            <div style={{ color: '#888', fontStyle: 'italic', marginBottom: 8 }}>Aquí se mostrarán los documentos guardados recientemente.</div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 10 }}>
              <div style={{ minWidth: 180, color: '#2a4d8f', background: '#f8fafd', borderRadius: 8, padding: 16, border: '1px solid #e0e4ef' }}>
                <strong>Organizador_1.neurocanvas</strong>
                <div style={{ fontSize: 13, color: '#888', margin: '6px 0 8px 0' }}>Guardado: 25/12/2025</div>
                <div>
                  <label style={{ fontSize: 13, color: '#22335a', marginRight: 8 }}>Exportar como:</label>
                  <select style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e0e4ef' }}>
                    <option>PDF</option>
                    <option>SVG</option>
                    <option>PNG</option>
                    <option>JPG</option>
                  </select>
                  <button style={{ marginLeft: 10, background: '#2a4d8f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 14, cursor: 'pointer' }}>Exportar</button>
                </div>
              </div>
              {/* Más documentos aquí en el futuro */}
            </div>
          </section>
        </div>
      );
    case 'configuracion':
      return (
        <div style={{ maxWidth: 700, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Corrección automática */}
          <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', border: '1px solid #e0e4ef', padding: 32 }}>
            <h2 style={{ color: '#2a4d8f', marginBottom: 10 }}>Corrección automática</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: '#22335a', fontSize: 16 }}>
              <div><input type="checkbox" disabled style={{ marginRight: 8 }} /> Autocorrección ortográfica</div>
              <div><input type="checkbox" disabled style={{ marginRight: 8 }} /> Diccionario personalizado</div>
              <div><input type="checkbox" disabled style={{ marginRight: 8 }} /> Activar sugerencias automáticas</div>
            </div>
          </section>
          {/* Auto guardado y seguridad */}
          <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', border: '1px solid #e0e4ef', padding: 32 }}>
            <h2 style={{ color: '#2a4d8f', marginBottom: 10 }}>Auto guardado y seguridad</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: '#22335a', fontSize: 16 }}>
              <div>
                <input type="checkbox" disabled style={{ marginRight: 8 }} />
                Autoguardado
                <span style={{ marginLeft: 12, color: '#888', fontSize: 15 }}>
                  Cada <input type="number" min={5} max={300} value={30} disabled style={{ width: 50, margin: '0 6px', borderRadius: 4, border: '1px solid #e0e4ef', padding: '2px 6px' }} /> segundos
                </span>
              </div>
              <div>
                <input type="checkbox" disabled style={{ marginRight: 8 }} />
                Historial de versiones
                <span style={{ marginLeft: 12, color: '#888', fontSize: 15 }}>
                  (Hasta 10 versiones)
                </span>
              </div>
            </div>
          </section>
          {/* Accesibilidad */}
          <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', border: '1px solid #e0e4ef', padding: 32 }}>
            <h2 style={{ color: '#2a4d8f', marginBottom: 10 }}>Accesibilidad</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: '#22335a', fontSize: 16 }}>
              <div>
                <input type="checkbox" disabled style={{ marginRight: 8 }} />
                Modo Daltonismo
                <span style={{ marginLeft: 12, color: '#888', fontSize: 15 }}>
                  <select disabled style={{ borderRadius: 4, border: '1px solid #e0e4ef', padding: '2px 8px', marginLeft: 6 }}>
                    <option>Deuteranopia</option>
                  </select>
                </span>
              </div>
              <div>
                <input type="checkbox" disabled style={{ marginRight: 8 }} />
                Lectura de pantalla
              </div>
            </div>
          </section>
          {/* Apariencia */}
          <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', border: '1px solid #e0e4ef', padding: 32 }}>
            <h2 style={{ color: '#2a4d8f', marginBottom: 10 }}>Apariencia</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: '#22335a', fontSize: 16 }}>
              <div>
                <input type="checkbox" disabled style={{ marginRight: 8 }} />
                Modo oscuro
                <span style={{ marginLeft: 12, color: '#888', fontSize: 15 }}>
                  <select disabled style={{ borderRadius: 4, border: '1px solid #e0e4ef', padding: '2px 8px', marginLeft: 6 }}>
                    <option>Azul oscuro</option>
                    <option>Negro</option>
                    <option>Gris</option>
                  </select>
                </span>
              </div>
              <div>
                <input type="checkbox" disabled style={{ marginRight: 8 }} />
                Temas de contraste
              </div>
            </div>
          </section>
        </div>
      );
    case 'explorador':
      return (
        <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Barra de búsqueda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <input type="text" placeholder="Buscar documentos..." style={{ flex: 1, padding: '10px 18px', borderRadius: 8, border: '1px solid #e0e4ef', fontSize: 16 }} disabled />
            <button style={{ background: '#2a4d8f', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }} disabled>Buscar</button>
          </div>
          {/* Sección de carpetas/proyectos */}
          <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', border: '1px solid #e0e4ef', padding: 32 }}>
            <h3 style={{ color: '#22335a', marginBottom: 10 }}>Carpetas de proyectos</h3>
            <div style={{ color: '#888', fontStyle: 'italic', marginBottom: 8 }}>Carpetas creadas que contienen documentos y archivos.</div>
            {/* Renderizar carpetas reales */}
            {projectFolders.length === 0 && (
              <div style={{ color: '#bbb', fontStyle: 'italic', marginBottom: 8 }}>No hay carpetas creadas aún.</div>
            )}
              {projectFolders.map((folder: { name: string; path: string; docs: { name: string }[] }, idx: number) => (
              <div key={folder.path + idx} style={{ background: '#f8fafd', border: '1px solid #e0e4ef', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', cursor: 'pointer', fontWeight: 600, color: '#22335a', fontSize: 16 }}>
                  <span style={{ fontSize: 18, marginRight: 8 }}>📁</span>
                  {folder.name}
                  <span style={{ marginLeft: 'auto', fontSize: 18 }}>▼</span>
                  <button style={{ marginLeft: 18, background: '#2a4d8f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 14, cursor: 'pointer' }}>+ Agregar documento</button>
                </div>
                {/* Vista previa de documentos */}
                <div style={{ padding: '10px 24px', borderTop: '1px solid #e0e4ef', background: '#fff' }}>
                  <div style={{ color: '#2a4d8f', fontWeight: 500, marginBottom: 6 }}>Vista previa:</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {folder.docs.length === 0 && <div style={{ color: '#bbb', fontStyle: 'italic' }}>Sin documentos</div>}
                    {folder.docs.map((doc: { name: string }, i: number) => (
                      <div key={doc.name + i} style={{ background: '#e0e4ef', borderRadius: 6, padding: '6px 14px', fontSize: 14, color: '#22335a' }}>{doc.name}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </section>
          {/* Sección de documentos (solo proyectos) */}
          <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', border: '1px solid #e0e4ef', padding: 32 }}>
            <h3 style={{ color: '#22335a', marginBottom: 10 }}>Documentos de proyectos</h3>
            <div style={{ color: '#888', fontStyle: 'italic', marginBottom: 8 }}>Todos los documentos creados en cada carpeta (solo proyectos).</div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 10 }}>
              {projectFolders.flatMap((folder: { name: string; docs: { name: string }[] }) => folder.docs.map((doc: { name: string }) => ({ doc, folder }))).map(({ doc, folder }: { doc: { name: string }; folder: { name: string } }, idx: number) => (
                <div key={doc.name + folder.name + idx} style={{ minWidth: 180, color: '#2a4d8f', background: '#f8fafd', borderRadius: 8, padding: 16, border: '1px solid #e0e4ef' }}>
                  <strong>{doc.name}</strong>
                  <div style={{ fontSize: 13, color: '#888', margin: '6px 0 8px 0' }}>Proyecto: {folder.name}</div>
                </div>
              ))}
              {/* Más documentos aquí en el futuro */}
            </div>
          </section>
        </div>
      );
    case 'multiventana': {
      // Estado para pestañas y pestaña activa
      interface TabType {
        id: number;
        title: string;
        content: React.ReactNode;
      }
      const [tabs, setTabs] = React.useState<TabType[]>(() => {
        const saved = window.localStorage.getItem('multiventana-tabs');
        if (saved) {
          try {
            const parsed: { id: number; title: string }[] = JSON.parse(saved);
            return parsed.map((t) => ({ ...t, content: <CanvasEditor key={t.id} /> }));
          } catch {
            return [{ id: 1, title: 'Documento 1', content: <CanvasEditor key={1} /> }];
          }
        }
        return [{ id: 1, title: 'Documento 1', content: <CanvasEditor key={1} /> }];
      });
      const [activeTab, setActiveTab] = React.useState<number>(() => {
        const saved = window.localStorage.getItem('multiventana-activeTab');
        return saved ? Number(saved) : 1;
      });
      const [renamingTabId, setRenamingTabId] = React.useState<number|null>(null);
      const [renameValue, setRenameValue] = React.useState('');

      // Guardar en localStorage cuando tabs o activeTab cambian
      React.useEffect(() => {
        window.localStorage.setItem('multiventana-tabs', JSON.stringify(tabs.map((t: TabType) => ({ id: t.id, title: t.title }))));
        window.localStorage.setItem('multiventana-activeTab', String(activeTab));
      }, [tabs, activeTab]);

      // Agregar nueva pestaña
      const addTab = () => {
        const newId = tabs.length > 0 ? Math.max(...tabs.map((t: TabType) => t.id)) + 1 : 1;
        setTabs((prev: TabType[]) => [...prev, { id: newId, title: `Documento ${newId}`, content: <CanvasEditor key={newId} /> }]);
        setActiveTab(newId);
      };

      // Cerrar pestaña
      const closeTab = (id: number) => {
        setTabs((prev: TabType[]) => prev.filter((t: TabType) => t.id !== id));
        if (activeTab === id && tabs.length > 1) {
          const idx = tabs.findIndex((t: TabType) => t.id === id);
          const nextTab = tabs[idx - 1] || tabs[idx + 1];
          setActiveTab(nextTab.id);
        } else if (tabs.length === 1) {
          setActiveTab(0);
        }
      };

      // Renombrar pestaña
      const startRenaming = (id: number, current: string) => {
        setRenamingTabId(id);
        setRenameValue(current);
      };
      const finishRenaming = () => {
        if (renamingTabId !== null) {
          setTabs((prev: TabType[]) => prev.map((t: TabType) => t.id === renamingTabId ? { ...t, title: renameValue.trim() || t.title } : t));
          setRenamingTabId(null);
        }
      };

      // Drag & drop para reordenar pestañas
      const [draggedTabId, setDraggedTabId] = React.useState<number|null>(null);
      const onDragStart = (id: number) => setDraggedTabId(id);
      const onDragOver = (e: React.DragEvent, id: number) => {
        e.preventDefault();
        if (draggedTabId === null || draggedTabId === id) return;
        setTabs((prev: TabType[]) => {
          const fromIdx = prev.findIndex((t: TabType) => t.id === draggedTabId);
          const toIdx = prev.findIndex((t: TabType) => t.id === id);
          if (fromIdx === -1 || toIdx === -1) return prev;
          const newTabs = [...prev];
          const [moved] = newTabs.splice(fromIdx, 1);
          newTabs.splice(toIdx, 0, moved);
          return newTabs;
        });
      };
      const onDragEnd = () => setDraggedTabId(null);

      // Renderizado
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          {/* Barra de pestañas superior */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            background: 'linear-gradient(90deg, #f8fafd 60%, #e0e4ef 100%)',
            border: '2px solid #2a4d8f',
            borderRadius: 10,
            margin: '32px 0 0 0',
            minWidth: 900,
            maxWidth: 1200,
            width: '90%',
            height: 60,
            position: 'relative',
            boxShadow: '0 4px 16px #0001',
            overflowX: 'auto',
          }}>
            {/* Barra de navegación simple */}
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
              {tabs.map((tab: TabType) => (
                <div
                  key={tab.id}
                  style={{ display: 'flex', alignItems: 'center', height: '100%', position: 'relative', opacity: draggedTabId === tab.id ? 0.5 : 1 }}
                  draggable
                  onDragStart={() => onDragStart(tab.id)}
                  onDragOver={e => onDragOver(e, tab.id)}
                  onDragEnd={onDragEnd}
                  onDrop={onDragEnd}
                >
                  {renamingTabId === tab.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={finishRenaming}
                      onKeyDown={e => { if (e.key === 'Enter') finishRenaming(); if (e.key === 'Escape') setRenamingTabId(null); }}
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        padding: '8px 18px',
                        border: '1.5px solid #2a4d8f',
                        borderRadius: 6,
                        margin: '0 2px',
                        minWidth: 120,
                        outline: 'none',
                        background: '#fff',
                        color: '#22335a',
                      }}
                    />
                  ) : (
                    <button
                      style={{
                        background: activeTab === tab.id ? '#e0e4ef' : 'none',
                        border: 'none',
                        color: '#22335a',
                        fontWeight: 600,
                        fontSize: 16,
                        padding: '10px 28px',
                        borderRadius: 0,
                        borderBottom: activeTab === tab.id ? '4px solid #2a4d8f' : '4px solid transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        margin: 0,
                        height: '100%',
                        position: 'relative',
                        minWidth: 120,
                      }}
                      onClick={() => setActiveTab(tab.id)}
                      onDoubleClick={() => startRenaming(tab.id, tab.title)}
                      title="Doble clic para renombrar"
                    >
                      {tab.title}
                    </button>
                  )}
                  {tabs.length > 1 && (
                    <span
                      onClick={() => closeTab(tab.id)}
                      style={{ color: '#888', marginLeft: -8, marginRight: 8, cursor: 'pointer', fontSize: 20, position: 'absolute', right: 0, top: 8 }}
                      title="Cerrar pestaña"
                    >×</span>
                  )}
                </div>
              ))}
              {/* Botón para agregar pestaña */}
              <button
                onClick={addTab}
                style={{
                  background: '#2a4d8f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 22px',
                  fontSize: 22,
                  fontWeight: 700,
                  marginLeft: 18,
                  cursor: 'pointer',
                  height: 40,
                  alignSelf: 'center',
                  marginTop: 0,
                  boxShadow: '0 2px 8px #0002',
                }}
                title="Agregar documento/lienzo"
              >
                +
              </button>
            </div>
          </div>
          {/* Área de documento/lienzo activo */}
          <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
            {tabs.find((t: TabType) => t.id === activeTab)?.content || (
              <div style={{ color: '#888', fontSize: 20, marginTop: 40 }}>No hay documento seleccionado.</div>
            )}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
};

const RightPanel: React.FC<{ section: Section }> = ({ section }) => {
  switch (section) {
    case 'inicio':
      return (
        <div>
          <h3 style={{ color: '#2a4d8f', marginBottom: 12 }}>Ayuda Rápida</h3>
          <ul style={{ color: '#444', fontSize: 15, paddingLeft: 18 }}>
            <li>Selecciona una sección del menú lateral.</li>
            <li>Comienza un nuevo proyecto o explora tus documentos.</li>
          </ul>
        </div>
      );
    case 'editor':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ color: '#2a4d8f', marginBottom: 8 }}>Herramientas de Edición</h3>
          <hr style={{ border: 'none', borderTop: '1px solid #e0e4ef', margin: '8px 0' }} />
          <section>
            <strong style={{ color: '#22335a' }}>Figuras geométricas</strong>
            <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>(Círculo, rectángulo, rombo, polígono...)</div>
          </section>
          <hr style={{ border: 'none', borderTop: '1px solid #e0e4ef', margin: '8px 0' }} />
          <section>
            <strong style={{ color: '#22335a' }}>Conectores inteligentes</strong>
            <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>(Flechas, líneas curvas, automáticas)</div>
          </section>
          <hr style={{ border: 'none', borderTop: '1px solid #e0e4ef', margin: '8px 0' }} />
          <section>
            <strong style={{ color: '#22335a' }}>Iconoteca</strong>
            <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>(Símbolos comunes, emojis)</div>
          </section>
          <hr style={{ border: 'none', borderTop: '1px solid #e0e4ef', margin: '8px 0' }} />
          <section>
            <strong style={{ color: '#22335a' }}>Cuadro de texto flexible</strong>
            <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>(Agregar y editar texto libremente)</div>
          </section>
          <hr style={{ border: 'none', borderTop: '1px solid #e0e4ef', margin: '8px 0' }} />
          <section>
            <strong style={{ color: '#22335a' }}>Tablas</strong>
            <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>(Celdas editables, conexiones)</div>
          </section>
          <hr style={{ border: 'none', borderTop: '1px solid #e0e4ef', margin: '8px 0' }} />
          <section>
            <strong style={{ color: '#22335a' }}>Gráfica de pastel</strong>
            <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>(Sectores editables, colores y datos)</div>
          </section>
        </div>
      );
    case 'configuracion':
      // Atajos de teclado
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ color: '#2a4d8f', marginBottom: 8 }}>Preferencias</h3>
          <ul style={{ color: '#444', fontSize: 15, paddingLeft: 18, marginBottom: 18 }}>
            <li>Atajos de teclado, temas de color, autocorrección.</li>
            <li>Configuración de autoguardado y accesibilidad.</li>
          </ul>
          <hr style={{ border: 'none', borderTop: '1px solid #e0e4ef', margin: '8px 0' }} />
          <section>
            <strong style={{ color: '#22335a', fontSize: 16 }}>Atajos de teclado</strong>
            <table style={{ width: '100%', marginTop: 10, fontSize: 15, color: '#22335a', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ padding: '6px 8px' }}>Guardar</td><td style={{ padding: '6px 8px', color: '#2a4d8f', fontWeight: 600 }}>Ctrl + S</td></tr>
                <tr><td style={{ padding: '6px 8px' }}>Nuevo proyecto (Canvas)</td><td style={{ padding: '6px 8px', color: '#2a4d8f', fontWeight: 600 }}>Ctrl + N</td></tr>
                <tr><td style={{ padding: '6px 8px' }}>Exportar</td><td style={{ padding: '6px 8px', color: '#2a4d8f', fontWeight: 600 }}>Ctrl + E</td></tr>
                <tr><td style={{ padding: '6px 8px' }}>Importar</td><td style={{ padding: '6px 8px', color: '#2a4d8f', fontWeight: 600 }}>Ctrl + I</td></tr>
                <tr><td style={{ padding: '6px 8px' }}>Deshacer</td><td style={{ padding: '6px 8px', color: '#2a4d8f', fontWeight: 600 }}>Ctrl + Z</td></tr>
                <tr><td style={{ padding: '6px 8px' }}>Rehacer</td><td style={{ padding: '6px 8px', color: '#2a4d8f', fontWeight: 600 }}>Ctrl + Y</td></tr>
                <tr><td style={{ padding: '6px 8px' }}>Copiar</td><td style={{ padding: '6px 8px', color: '#2a4d8f', fontWeight: 600 }}>Ctrl + C</td></tr>
                <tr><td style={{ padding: '6px 8px' }}>Pegar</td><td style={{ padding: '6px 8px', color: '#2a4d8f', fontWeight: 600 }}>Ctrl + V</td></tr>
                <tr><td style={{ padding: '6px 8px' }}>Seleccionar todo</td><td style={{ padding: '6px 8px', color: '#2a4d8f', fontWeight: 600 }}>Ctrl + A</td></tr>
              </tbody>
            </table>
          </section>
        </div>
      );
    case 'datos':
      // Diseño de carpetas agrupadoras
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ color: '#2a4d8f', marginBottom: 8 }}>Carpetas agrupadoras</h3>
          <button style={{ background: '#2a4d8f', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontSize: 15, fontWeight: 600, marginBottom: 10, alignSelf: 'flex-start', boxShadow: '0 2px 8px #0001', cursor: 'pointer' }}>+ Nueva agrupación</button>
          {/* Ejemplo de carpeta agrupadora desplegable */}
          <div style={{ background: '#f8fafd', border: '1px solid #e0e4ef', borderRadius: 8, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', cursor: 'pointer', fontWeight: 600, color: '#22335a', fontSize: 16 }}>
              <span style={{ fontSize: 18, marginRight: 8 }}>📁</span>
              Carpeta: Proyecto Ciencia
              <span style={{ marginLeft: 'auto', fontSize: 18 }}>▼</span>
            </div>
            {/* Vista previa de archivos */}
            <div style={{ padding: '10px 24px', borderTop: '1px solid #e0e4ef', background: '#fff' }}>
              <div style={{ color: '#2a4d8f', fontWeight: 500, marginBottom: 6 }}>Vista previa:</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ background: '#e0e4ef', borderRadius: 6, padding: '6px 14px', fontSize: 14, color: '#22335a' }}>informe.pdf</div>
                <div style={{ background: '#e0e4ef', borderRadius: 6, padding: '6px 14px', fontSize: 14, color: '#22335a' }}>grafica.png</div>
                <div style={{ background: '#e0e4ef', borderRadius: 6, padding: '6px 14px', fontSize: 14, color: '#22335a' }}>datos.csv</div>
              </div>
              {/* Carpeta anidada */}
              <div style={{ marginTop: 10, marginLeft: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', fontWeight: 500, color: '#2a4d8f', fontSize: 15 }}>
                  <span style={{ fontSize: 16, marginRight: 6 }}>📁</span>
                  Subcarpeta: Resultados
                  <span style={{ marginLeft: 'auto', fontSize: 15 }}>▼</span>
                </div>
                <div style={{ padding: '6px 0 0 24px', color: '#22335a', fontSize: 14 }}>
                  <div style={{ background: '#e0e4ef', borderRadius: 6, padding: '4px 10px', marginBottom: 4 }}>resultados.json</div>
                </div>
              </div>
            </div>
          </div>
          {/* Más carpetas agrupadoras aquí en el futuro */}
        </div>
      );
    case 'datos':
      return (
        <div>
          <h3 style={{ color: '#2a4d8f', marginBottom: 12 }}>Opciones de Datos</h3>
          <ul style={{ color: '#444', fontSize: 15, paddingLeft: 18 }}>
            <li>Importa imágenes, PDF, CSV, JSON, XML.</li>
            <li>Exporta tus organizadores a PDF, SVG, PNG, JPG.</li>
          </ul>
        </div>
      );
    case 'configuracion':
      return (
        <div>
          <h3 style={{ color: '#2a4d8f', marginBottom: 12 }}>Preferencias</h3>
          <ul style={{ color: '#444', fontSize: 15, paddingLeft: 18 }}>
            <li>Atajos de teclado, temas de color, autocorrección.</li>
            <li>Configuración de autoguardado y accesibilidad.</li>
          </ul>
        </div>
      );
    case 'explorador':
      return (
        <div>
          <h3 style={{ color: '#2a4d8f', marginBottom: 12 }}>Explorador</h3>
          <ul style={{ color: '#444', fontSize: 15, paddingLeft: 18 }}>
            <li>Visualiza y organiza tus carpetas y documentos.</li>
            <li>Utiliza la búsqueda integrada.</li>
          </ul>
        </div>
      );
    case 'multiventana':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 32 }}>
          <div style={{
            border: '2px solid #2a4d8f',
            borderRadius: 10,
            padding: 18,
            marginBottom: 12,
            background: '#fff',
            boxShadow: '0 2px 8px #0001',
            minHeight: 120,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <strong style={{ color: '#22335a', fontSize: 18, marginBottom: 6 }}>Sección de carpetas</strong>
            <span style={{ color: '#888', fontSize: 15, marginBottom: 4 }}>Abre carpetas y accede a sus documentos.</span>
            <button style={{ background: '#2a4d8f', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontSize: 15, fontWeight: 600, marginTop: 10, boxShadow: '0 2px 8px #0001', cursor: 'pointer' }}>Abrir carpeta...</button>
            {/* Aquí se listarán carpetas disponibles en el futuro */}
          </div>
          <div style={{
            border: '2px solid #2a4d8f',
            borderRadius: 10,
            padding: 18,
            background: '#fff',
            boxShadow: '0 2px 8px #0001',
            minHeight: 120,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <strong style={{ color: '#22335a', fontSize: 18, marginBottom: 6 }}>Sección de archivos</strong>
            <span style={{ color: '#888', fontSize: 15, marginBottom: 4 }}>Visualiza y usa archivos/datos importados.</span>
            <button style={{ background: '#2a4d8f', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontSize: 15, fontWeight: 600, marginTop: 10, boxShadow: '0 2px 8px #0001', cursor: 'pointer' }}>Importar archivo...</button>
            {/* Aquí se listarán archivos/datos importados en el futuro */}
          </div>
        </div>
      );
    default:
      return null;
  }
};

const Welcome: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f4f6fa'}}>
    <div style={{background:'#fff',borderRadius:16,boxShadow:'0 4px 24px #0001',padding:'48px 40px',textAlign:'center'}}>
      <img src="logo.svg" alt="GraphOS Logo" style={{width:80,marginBottom:16}} onError={e => (e.currentTarget.style.display='none')}/>
      <h1 style={{color:'#2a4d8f',marginBottom:12}}>¡Bienvenido a GraphOS!</h1>
      <p style={{color:'#444',marginBottom:24}}>
        Tu espacio para crear, organizar y visualizar ideas con organizadores gráficos avanzados.<br/>
        Versión inicial de desarrollo.
      </p>
      <button style={{background:'#2a4d8f',color:'#fff',border:'none',borderRadius:8,padding:'12px 32px',fontSize:'1.1em',cursor:'pointer'}}
        onClick={onStart}>Comenzar</button>
    </div>
  </div>
);



const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [section, setSection] = useState<Section>('inicio');
  // Estado global de carpetas de proyectos
  const [projectFolders, setProjectFolders] = useState<{ name: string; path: string; docs: { name: string }[] }[]>([]);
  // Cuando se selecciona una plantilla o nuevo proyecto, ir a editor
  const goToEditor = () => setSection('editor');
  // Función para agregar carpeta
  const addProjectFolder = (folder: { name: string; path: string; docs: { name: string }[] }) => {
    setProjectFolders(prev => [...prev, folder]);
    setSection('explorador'); // Cambia automáticamente a la vista de explorador
  };
  return started ? (
    <PanelLayout
      left={<LeftPanel selected={section} onSelect={setSection} />}
      center={<CenterPanel section={section} onStartEditor={goToEditor} projectFolders={projectFolders} addProjectFolder={addProjectFolder} />}
      right={<RightPanel section={section} />}
    />
  ) : (
    <Welcome onStart={() => setStarted(true)} />
  );
};

export default App;
