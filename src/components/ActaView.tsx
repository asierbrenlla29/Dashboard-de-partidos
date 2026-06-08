import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  FileText, 
  Calendar, 
  MapPin, 
  User, 
  Users, 
  ClipboardList, 
  Plus, 
  CheckSquare, 
  Square, 
  Trash2, 
  Printer, 
  Copy, 
  Download, 
  RefreshCcw, 
  Settings, 
  Info,
  Clock,
  CheckCircle,
  FileCode,
  Check,
  FileSpreadsheet
} from "lucide-react";

interface GeneralCommitment {
  id: string;
  task: string;
  assignee: string;
  status: "pending" | "progress" | "done";
}

export const ActaView: React.FC = () => {
  const { sheetData, filteredRecords, theme } = useApp();

  // Basic meeting metadata
  const [title, setTitle] = useState("Acta de Reunión - Análisis de Datos");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 16); // format: YYYY-MM-DDThh:mm
  });
  const [location, setLocation] = useState("Plataforma de Datos Looker (Remoto)");
  const [facilitator, setFacilitator] = useState("Asier Brenlla (asierbrenlla11@gmail.com)");
  const [secretary, setSecretary] = useState("Secretaría de Analítica");
  const [attendees, setAttendees] = useState("Asier Brenlla, Miembros del Equipo Analítico");

  // Column mapping states
  const [titleCol, setTitleCol] = useState<string>("");
  const [descCol, setDescCol] = useState<string>("");
  const [supportedCols, setSupportedCols] = useState<string[]>([]);

  // Individual record notes
  // Allows users to add specific agreements/decisions to each spreadsheet row in the acta
  const [recordNotes, setRecordNotes] = useState<{ [index: number]: string }>({});

  // General commitments (next steps list)
  const [commitments, setCommitments] = useState<GeneralCommitment[]>([
    { id: "1", task: "Revisar los datos anómalos detectados en el informe", assignee: "Asier Brenlla", status: "progress" },
    { id: "2", task: "Sincronizar nuevas filas de la hoja de Google Sheets para validación", assignee: "Equipo General", status: "pending" }
  ]);
  const [newCommitmentTask, setNewCommitmentTask] = useState("");
  const [newCommitmentAssignee, setNewCommitmentAssignee] = useState("");

  // Signatures
  const [presidentSigner, setPresidentSigner] = useState("Moderador del Panel");
  const [secretarySigner, setSecretarySigner] = useState("Asier Brenlla (Redactor)");

  // Copy success toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-detect best columns for rendering when data is loaded
  useEffect(() => {
    if (sheetData && sheetData.columns.length > 0) {
      const cols = sheetData.columns;
      // Heuristically find an identifier column or fallback to first
      setTitleCol(cols[0] || "");
      // Set second column as description or fallback to first
      setDescCol(cols[1] || cols[0] || "");
      // Other metadata columns (exclude title and description by default to keep clean)
      setSupportedCols(cols.slice(2, 6)); 
    }
  }, [sheetData]);

  if (!sheetData) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80">
        <Info className="w-12 h-12 text-teal-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-350">Por favor, espera a que se carguen los datos para ver el acta.</p>
      </div>
    );
  }

  // Handle support columns checkboxes toggle
  const toggleSupportedCol = (colName: string) => {
    setSupportedCols(prev => 
      prev.includes(colName) 
        ? prev.filter(c => c !== colName) 
        : [...prev, colName]
    );
  };

  // Add a general action plan commitment
  const addCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommitmentTask.trim()) return;

    const newId = String(Date.now() + Math.random());
    setCommitments([
      ...commitments,
      {
        id: newId,
        task: newCommitmentTask.trim(),
        assignee: newCommitmentAssignee.trim() || "Sin asignar",
        status: "pending"
      }
    ]);
    setNewCommitmentTask("");
    setNewCommitmentAssignee("");
  };

  // Delete commitment
  const deleteCommitment = (id: string) => {
    setCommitments(prev => prev.filter(c => c.id !== id));
  };

  // Toggle commitment status
  const cycleCommitmentStatus = (id: string) => {
    setCommitments(prev => prev.map(c => {
      if (c.id === id) {
        if (c.status === "pending") return { ...c, status: "progress" };
        if (c.status === "progress") return { ...c, status: "done" };
        return { ...c, status: "pending" };
      }
      return c;
    }));
  };

  // Handle individual row comment changes
  const handleRowNoteChange = (index: number, noteText: string) => {
    setRecordNotes(prev => ({
      ...prev,
      [index]: noteText
    }));
  };

  // Reset all options to default
  const resetActaToDefaults = () => {
    if (confirm("¿Estás seguro de que deseas reiniciar los detalles del acta a los valores iniciales? Se perderán las notas personalizadas.")) {
      setTitle("Acta de Reunión - Análisis de Datos");
      setDate(new Date().toISOString().slice(0, 16));
      setLocation("Plataforma de Datos Looker (Remoto)");
      setFacilitator("Asier Brenlla (asierbrenlla11@gmail.com)");
      setSecretary("Secretaría de Analítica");
      setAttendees("Asier Brenlla, Miembros del Equipo Analítico");
      setRecordNotes({});
      setCommitments([
        { id: "1", task: "Revisar los datos anómalos detectados en el informe", assignee: "Asier Brenlla", status: "progress" },
        { id: "2", task: "Sincronizar nuevas filas de la hoja de Google Sheets para validación", assignee: "Equipo General", status: "pending" }
      ]);
      setPresidentSigner("Moderador del Panel");
      setSecretarySigner("Asier Brenlla (Redactor)");
    }
  };

  // Markdown generator
  const generateMarkdownPayload = () => {
    const formattedDate = new Date(date).toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    let md = `# ${title.toUpperCase()}\n\n`;
    md += `**FECHA Y HORA:** ${formattedDate}\n`;
    md += `**LUGAR:** ${location}\n`;
    md += `**FACILITADOR / PRESIDENTE:** ${facilitator}\n`;
    md += `**SECRETARIO / REDACTOR:** ${secretary}\n`;
    md += `**ASISTENTES:** ${attendees}\n\n`;
    md += `### RESUMEN ESTADÍSTICO DE LOS DATOS FILTRADOS\n`;
    md += `- **Número total de registros cargados:** ${sheetData?.records.length}\n`;
    md += `- **Número de registros incluidos en esta acta:** ${filteredRecords.length}\n\n`;

    md += `### 1. PUNTOS DEL DÍA Y REGISTROS DE DATOS\n`;
    md += `A continuación se detallan los elementos de datos discutidos según el estado de los filtros actual:\n\n`;

    if (filteredRecords.length === 0) {
      md += `*No se registraron elementos de datos filtrados para esta sección.*\n\n`;
    } else {
      filteredRecords.forEach((record, index) => {
        const itemTitle = String(record[titleCol] || `Asunto #${index + 1}`);
        const itemDesc = String(record[descCol] || "Sin descripción principal");
        md += `#### Elemento #${index + 1}: ${itemTitle}\n`;
        md += `- **${descCol}:** ${itemDesc}\n`;
        
        // Include support columns
        supportedCols.forEach(col => {
          if (record[col] !== undefined && record[col] !== null && record[col] !== "") {
            md += `- **${col}:** ${record[col]}\n`;
          }
        });

        // Include manual discussions notes
        const customNote = recordNotes[index];
        if (customNote && customNote.trim()) {
          md += `* **Acuerdo/Decisión específica:** ${customNote.trim()}\n`;
        }
        md += `\n`;
      });
    }

    md += `### 2. COMPROMISOS ADICIONALES Y PRÓXIMOS PASOS\n`;
    if (commitments.length === 0) {
      md += `No se definieron compromisos adicionales.\n\n`;
    } else {
      commitments.forEach((c, idx) => {
        const statusIcon = c.status === "done" ? "[X] (Completado)" : (c.status === "progress" ? "[/] (En Proceso)" : "[ ] (Pendiente)");
        md += `${idx + 1}. ${statusIcon} **Tareas:** ${c.task} | **Responsable:** ${c.assignee}\n`;
      });
      md += `\n`;
    }

    md += `### 3. CIERRE DEL ACTA Y FIRMAS\n`;
    md += `Sin más asuntos que tratar, se da por concluida la sesión. En testimonio de lo cual firman el presente documento:\n\n`;
    md += `-----------------------------------------------\n`;
    md += `Presidente / Moderador:\n`;
    md += `${presidentSigner}\n\n\n`;
    md += `-----------------------------------------------\n`;
    md += `Secretario / Redactor:\n`;
    md += `${secretarySigner}\n`;

    return md;
  };

  // Plaintext txt generator
  const generatePlaintextPayload = () => {
    return generateMarkdownPayload();
  };

  // Copy to clipboard helper
  const handleCopyClipboard = () => {
    const payload = generateMarkdownPayload();
    navigator.clipboard.writeText(payload)
      .then(() => {
        showToast("¡Acta copiada al portapapeles en formato Markdown!");
      })
      .catch(err => {
        console.error(err);
        showToast("Error al copiar al portapapeles. Prueba seleccionando manualmente.");
      });
  };

  // Download acta as file
  const handleDownloadTxt = () => {
    const payload = generatePlaintextPayload();
    const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // Create friendly filename: acta_reunion_YYYY_MM_DD.txt
    const cleanDate = date.split("T")[0] || "fecha";
    link.href = url;
    link.download = `acta_reunion_${cleanDate}.txt`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("¡Archivo de acta descargado correctamente!");
  };

  // Print system handler
  const handlePrint = () => {
    window.print();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const formattedDateString = useMemo(() => {
    if (!date) return "";
    const parsedDate = new Date(date);
    return parsedDate.toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }, [date]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Dynamic CSS override block exclusively for beautiful printing templates */}
      <style>{`
        @media print {
          /* General resets */
          body, html {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt !important;
            font-family: 'Inter', system-ui, sans-serif !important;
          }
          /* Hide non-printable app scaffolding */
          header, 
          footer, 
          #kpi-cards-grid, 
          #sidebar-container, 
          #dashboard-view-panel, 
          #table-view-section, 
          #acta-actions-sidebar, 
          #editor-panel, 
          .no-print,
          .kpi-row-print-ignore {
            display: none !important;
          }
          /* Force printable container to occupy full width */
          #printable-acta-card {
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0px !important;
            margin: 0px !important;
            display: block !important;
          }
          /* Override light/dark elements */
          #printable-acta-card * {
            color: #000000 !important;
            background-color: transparent !important;
            border-color: #e2e8f0 !important;
          }
          /* Hide custom note inputs, show notes as standard paragraphs during print */
          .acta-note-input {
            display: none !important;
          }
          .acta-note-print-visible {
            display: block !important;
          }
          .signature-area {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Floating friendly action toast warning */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-teal-600 dark:bg-teal-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2.5 z-50 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 bg-teal-800 rounded-full p-0.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner - Information Alert */}
      <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-colors no-print ${
        theme === "black" 
          ? "bg-neutral-950 border-neutral-800 text-slate-300" 
          : "bg-teal-50/50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/40 text-slate-700 dark:text-slate-350"
      }`}>
        <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-teal-800 dark:text-teal-400">¿Qué es el Modo Acta?</p>
          <p className="leading-relaxed">
            Esta sección te permite estructurar y redactar un <strong>acta formal de reunión</strong> directamente a partir de las filas y datos filtrados actualmente en la barra lateral. Úsalo como plantilla de reporte ejecutivo para exportar a PDF, copiar en formato Markdown para correos o guardar en archivo plano.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ACTIVE REUNIÓN EDITOR PANEL (no-print) */}
        <div id="editor-panel" className="xl:col-span-5 flex flex-col gap-5 no-print">
          
          {/* Metadata Accordion Panel */}
          <div className={`border rounded-xl p-4.5 shadow-sm transition-colors ${theme === "black" ? "bg-neutral-950 border-neutral-800" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80"}`}>
            <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-700">
              <Settings className="w-4.5 h-4.5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Configuración del Acta</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Título de la Sesión</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none transition-colors ${
                    theme === "black" 
                      ? "bg-black border-neutral-850 text-neutral-200 focus:border-teal-500" 
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-300 focus:border-teal-600"
                  }`}
                  placeholder="Ej. Acta de Reunión Looker Analytics"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-2 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none transition-colors ${
                      theme === "black" 
                        ? "bg-black border-neutral-850 text-neutral-200 focus:border-teal-500" 
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-300 focus:border-teal-600"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Lugar / Medio</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`w-full px-2 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none transition-colors ${
                      theme === "black" 
                        ? "bg-black border-neutral-850 text-neutral-200 focus:border-teal-500" 
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-300 focus:border-teal-600"
                    }`}
                    placeholder="Ej. Google Meet"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Presidente / Moderador</label>
                <input
                  type="text"
                  value={facilitator}
                  onChange={(e) => setFacilitator(e.target.value)}
                  className={`w-full px-3 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none transition-colors ${
                    theme === "black" 
                      ? "bg-black border-neutral-850 text-neutral-200 focus:border-teal-500" 
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-300 focus:border-teal-600"
                  }`}
                  placeholder="Moderador"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Redactor / Secretario</label>
                <input
                  type="text"
                  value={secretary}
                  onChange={(e) => setSecretary(e.target.value)}
                  className={`w-full px-3 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none transition-colors ${
                    theme === "black" 
                      ? "bg-black border-neutral-850 text-neutral-200 focus:border-teal-500" 
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-300 focus:border-teal-600"
                  }`}
                  placeholder="Asesor Técnico"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Asistentes Convocados</label>
                <textarea
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none transition-colors resize-y ${
                    theme === "black" 
                      ? "bg-black border-neutral-850 text-neutral-200 focus:border-teal-500" 
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-300 focus:border-teal-600"
                  }`}
                  placeholder="Delegados, ingenieros..."
                />
              </div>
            </div>
          </div>

          {/* MAPPING COMPONENT: Google Sheet Data Dynamic Linker */}
          <div className={`border rounded-xl p-4.5 shadow-sm transition-colors ${theme === "black" ? "bg-neutral-950 border-neutral-800" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80"}`}>
            <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-700">
              <FileSpreadsheet className="w-4.5 h-4.5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Mapeo de Columnas</h3>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Indica qué columnas de Google Sheets representan el título de cada punto y su reporte descriptivo de discusión.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-450 mb-1">Columna: Título del Punto</label>
                <select
                  value={titleCol}
                  onChange={(e) => setTitleCol(e.target.value)}
                  className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer focus:outline-none transition-colors ${
                    theme === "black" 
                      ? "bg-black border-neutral-850 text-neutral-300 focus:border-teal-500" 
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 focus:border-teal-600"
                  }`}
                >
                  {sheetData.columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-450 mb-1">Columna: Resumen / Detalle Principal</label>
                <select
                  value={descCol}
                  onChange={(e) => setDescCol(e.target.value)}
                  className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer focus:outline-none transition-colors ${
                    theme === "black" 
                      ? "bg-black border-neutral-850 text-neutral-300 focus:border-teal-500" 
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 focus:border-teal-600"
                  }`}
                >
                  {sheetData.columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-450 mb-1.5">Columnas Secundarias en Acta</label>
                <div className="max-h-28 overflow-y-auto border border-slate-150 dark:border-slate-700 rounded-lg p-2 space-y-1.5 text-xs bg-slate-50/40 dark:bg-slate-900/30">
                  {sheetData.columns.map(col => {
                    const isChecked = supportedCols.includes(col);
                    const isPrimary = col === titleCol || col === descCol;
                    return (
                      <label 
                        key={col} 
                        className={`flex items-center gap-2 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                          isPrimary ? "opacity-35 cursor-not-allowed" : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isPrimary}
                          onChange={() => toggleSupportedCol(col)}
                          className="rounded text-teal-600 focus:ring-teal-500 h-3 w-3"
                        />
                        <span className="truncate">{col}</span>
                        {isPrimary && <span className="text-[9px] font-bold text-teal-600 px-1 py-0.2 bg-teal-50 dark:bg-teal-900/40 rounded ml-auto">Principal</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC COMMITMENTS SECTION (General Resolutions Actions Tasklist) */}
          <div className={`border rounded-xl p-4.5 shadow-sm transition-colors ${theme === "black" ? "bg-neutral-950 border-neutral-800" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80"}`}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
              <ClipboardList className="w-4.5 h-4.5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Compromisos / Tareas</h3>
            </div>

            <form onSubmit={addCommitment} className="space-y-2 mb-3.5">
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  placeholder="Nueva tarea acordada..."
                  value={newCommitmentTask}
                  onChange={(e) => setNewCommitmentTask(e.target.value)}
                  className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none transition-colors ${
                    theme === "black" 
                      ? "bg-black border-neutral-850 text-neutral-200 focus:border-teal-500" 
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 focus:border-teal-600"
                  }`}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Responsable (ej. Asier)"
                    value={newCommitmentAssignee}
                    onChange={(e) => setNewCommitmentAssignee(e.target.value)}
                    className={`flex-1 px-2.5 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none transition-colors ${
                      theme === "black" 
                        ? "bg-black border-neutral-850 text-neutral-200 focus:border-teal-500" 
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 focus:border-teal-600"
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center gap-1 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {commitments.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs italic">
                  No hay compromisos pendientes.
                </div>
              ) : (
                commitments.map((c) => (
                  <div 
                    key={c.id} 
                    className={`p-2 rounded-lg border text-xs flex items-start gap-2.5 justify-between transition-all ${
                      theme === "black" ? "bg-black border-neutral-900" : "bg-slate-50/50 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-750"
                    }`}
                  >
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                      <button 
                        type="button" 
                        onClick={() => cycleCommitmentStatus(c.id)}
                        className="mt-0.5 text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
                        title="Cambiar estado"
                      >
                        {c.status === "done" ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : c.status === "progress" ? (
                          <Clock className="w-4 h-4 text-amber-500" />
                        ) : (
                          <CheckSquare className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1 leading-snug">
                        <p className={`font-semibold text-slate-700 dark:text-slate-300 ${c.status === "done" ? "line-through opacity-55 text-slate-450" : ""}`}>
                          {c.task}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                          <User className="w-2.5 h-2.5 inline" />
                          <span>Responsable: <strong className="text-slate-500 dark:text-slate-400">{c.assignee}</strong></span>
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => deleteCommitment(c.id)}
                      className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer"
                      title="Eliminar compromiso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SIGNATURE FIELDS */}
          <div className={`border rounded-xl p-4.5 shadow-sm transition-colors ${theme === "black" ? "bg-neutral-950 border-neutral-800" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80"}`}>
            <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-700">
              <User className="w-4.5 h-4.5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Firmantes del Acta</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nombre Presidente (o Moderador)</label>
                <input
                  type="text"
                  value={presidentSigner}
                  onChange={(e) => setPresidentSigner(e.target.value)}
                  className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none transition-colors ${
                    theme === "black" 
                      ? "bg-black border-neutral-850 text-neutral-250" 
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nombre Secretario (Redactor)</label>
                <input
                  type="text"
                  value={secretarySigner}
                  onChange={(e) => setSecretarySigner(e.target.value)}
                  className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none transition-colors ${
                    theme === "black" 
                      ? "bg-black border-neutral-850 text-neutral-250" 
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300"
                  }`}
                />
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: PREVIEW & ACTION EXPORTS WORKPLACE */}
        <div className="xl:col-span-7 flex flex-col gap-5">
          
          {/* Action Header Export Center (no-print) */}
          <div id="acta-actions-sidebar" className={`border rounded-xl p-4 shadow-sm transition-colors no-print flex flex-wrap items-center justify-between gap-3.5 ${
            theme === "black" ? "bg-neutral-950 border-neutral-800" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80"
          }`}>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Acciones del Acta</h3>
                <span className="text-[10px] text-slate-450">{filteredRecords.length} filas seleccionadoras</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                title="Generar PDF o Imprimir en Papel A4"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>

              <button
                onClick={handleCopyClipboard}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg font-bold transition-colors cursor-pointer ${
                  theme === "black" 
                    ? "bg-neutral-900 hover:bg-neutral-850 border-neutral-800 text-slate-200" 
                    : "bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 border-transparent text-slate-750 dark:text-slate-250"
                }`}
                title="Copiar contenido formateado en Markdown"
              >
                <Copy className="w-3.5 h-3.5 text-teal-500" />
                <span>Copiar MD</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg font-bold transition-colors cursor-pointer ${
                  theme === "black" 
                    ? "bg-neutral-900 hover:bg-neutral-850 border-neutral-800 text-slate-200" 
                    : "bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 border-transparent text-slate-750 dark:text-slate-250"
                }`}
                title="Descargar acta como archivo de texto (.txt)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Descargar</span>
              </button>

              <button
                onClick={resetActaToDefaults}
                className={`p-2 rounded-lg transition-colors cursor-pointer border ${
                  theme === "black" 
                    ? "bg-transparent text-neutral-450 hover:bg-neutral-900 border-neutral-800" 
                    : "bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700"
                }`}
                title="Restaurar valores de acta"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* PRINTABLE REAL-TIME PREVIEW CARD (A4 paper styled) */}
          <div 
            id="printable-acta-card" 
            className={`rounded-xl p-6.5 sm:p-9.5 md:p-12 shadow-md border relative transition-all max-h-[820px] overflow-y-auto scrollbar-thin ${
              theme === "black" 
                ? "bg-zinc-950 border-neutral-850 text-slate-300" 
                : "bg-white dark:bg-slate-900/60 border-slate-250/70 dark:border-slate-750 text-slate-850 dark:text-slate-300"
            }`}
          >
            {/* Paper Corner Watermark (no-print) */}
            <div className="absolute top-4 right-4 no-print flex items-center gap-1 px-2 py-0.5 bg-teal-50 dark:bg-teal-950/40 rounded border border-teal-100/30 text-[9px] font-bold text-teal-600">
              <FileCode className="w-2.5 h-2.5" />
              <span>VISTA PREVIA DEL DOCUMENTO</span>
            </div>

            {/* Main Header Document Area */}
            <div className="space-y-6">
              <div className="text-center pb-5 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
                  {title || "Acta de Reunión"}
                </h1>
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider mt-1.5 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                  <span>Documento de Reporte Oficial</span>
                </p>
              </div>

              {/* Session Meta fields info panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-450 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-550 uppercase tracking-widest">Fecha y Hora</span>
                    <strong className="text-slate-800 dark:text-slate-200">{formattedDateString}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-450 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-550 uppercase tracking-widest">Lugar</span>
                    <strong className="text-slate-800 dark:text-slate-200">{location || "N/A"}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-slate-450 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-550 uppercase tracking-widest">Presidente / Moderador</span>
                    <strong className="text-slate-800 dark:text-slate-200">{facilitator || "N/A"}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-slate-450 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-550 uppercase tracking-widest">Secretario / Redactor</span>
                    <strong className="text-slate-800 dark:text-slate-200">{secretary || "N/A"}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 sm:col-span-2 pt-2 border-t border-slate-100/80 dark:border-slate-800/80">
                  <Users className="w-4 h-4 text-slate-450 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-550 uppercase tracking-widest">Asistentes</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{attendees || "N/A"}</strong>
                  </div>
                </div>
              </div>

              {/* Data Summary Stats Block */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl space-y-1 text-xs">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block mb-1">Métricas del Subconjunto de Datos</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-slate-400">Total Filas en Hoja:</span>
                    <strong className="text-sm text-slate-700 dark:text-slate-300">{sheetData.records.length}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">Elementos Incluidos (Filtrados):</span>
                    <strong className="text-sm text-slate-700 dark:text-slate-300">{filteredRecords.length}</strong>
                  </div>
                </div>
              </div>

              {/* SECTION 1: ITEMS FROM SPREADSHEET (Acuerdos por fila) */}
              <div className="space-y-4 pt-4 border-t border-slate-150 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5.5 h-5.5 bg-slate-150 dark:bg-slate-850 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200">1</span>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Puntos del Día & Discusión de Registros</h2>
                </div>

                <div className="space-y-5">
                  {filteredRecords.length === 0 ? (
                    <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-slate-400 text-xs italic">
                      No hay registros filtrados cargados. Aplica filtros o realiza búsquedas en el menú lateral para cargar asuntos a discutir en el acta.
                    </div>
                  ) : (
                    filteredRecords.map((record, index) => {
                      const itemTitle = String(record[titleCol] || `Asunto #${index + 1}`);
                      const itemDesc = String(record[descCol] || "");
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-4 rounded-xl border transition-all ${
                            theme === "black" 
                              ? "bg-neutral-900 text-neutral-300 border-neutral-850" 
                              : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-755"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2.5 mb-2.5">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {index + 1}. {itemTitle}
                            </h4>
                          </div>

                          {/* Primary descriptive column mapped */}
                          {itemDesc && (
                            <div className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed pl-1">
                              <span className="font-bold text-slate-500 dark:text-slate-450 mr-1.5">{descCol}:</span> {itemDesc}
                            </div>
                          )}

                          {/* Secondary specific attributes */}
                          {supportedCols.length > 0 && (
                            <div className="mt-2 text-[11px] grid grid-cols-2 gap-x-4 gap-y-1.5 pl-1 text-slate-500">
                              {supportedCols.map(col => {
                                const valStr = String(record[col] ?? "");
                                if (!valStr) return null;
                                return (
                                  <div key={col} className="truncate">
                                    <strong className="font-bold text-slate-400/80 mr-1 uppercase text-[9px] tracking-wide">{col}:</strong>
                                    <span className="text-slate-700 dark:text-slate-300">{valStr}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* MANUAL NOTE WRITING: Beautifully customized comment editor */}
                          <div className="mt-3.5 pt-3 border-t border-slate-200/50 dark:border-slate-755">
                            <span className="block text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1.5 no-print">Acuerdos / Decisiones Tomadas</span>
                            
                            {/* Form Input element shown ONLY in non-print mode */}
                            <textarea
                              rows={1}
                              value={recordNotes[index] || ""}
                              onChange={(e) => handleRowNoteChange(index, e.target.value)}
                              placeholder="Escribe acuerdos tomados, conclusiones o tareas particulares para este punto..."
                              className={`acta-note-input w-full px-2.5 py-1.5 border rounded-lg text-xs leading-relaxed focus:outline-none transition-colors resize-y ${
                                theme === "black" 
                                  ? "bg-black border-neutral-850 text-neutral-300 focus:border-teal-500" 
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 focus:border-teal-600"
                              }`}
                            />

                            {/* Solid Text Element shown ONLY during print output */}
                            <div className="acta-note-print-visible hidden text-slate-900 italic text-xs leading-relaxed border-l-2 border-teal-500 pl-3">
                              {recordNotes[index] && recordNotes[index].trim() ? (
                                <p className="font-medium text-slate-950">
                                  <strong>Acuerdo:</strong> {recordNotes[index].trim()}
                                </p>
                              ) : (
                                <p className="text-slate-400">Sin comentarios ni decisiones adicionales para este elemento durante la sesión (Aprobado estándar).</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* SECTION 2: INDEPENDENT ACTION PLANS (Compromisos generales) */}
              <div className="space-y-4 pt-5 border-t border-slate-150 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5.5 h-5.5 bg-slate-150 dark:bg-slate-850 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200">2</span>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Compromisos Generales y Plan de Acción</h2>
                </div>

                <div className="border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-3.5 py-2.5">Estado</th>
                        <th className="px-3.5 py-2.5">Tarea / Compromiso acordado</th>
                        <th className="px-3.5 py-2.5 text-right">Responsable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                      {commitments.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-slate-400 italic">No se han registrado compromisos de acción en esta sesión.</td>
                        </tr>
                      ) : (
                        commitments.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/10 transition-colors">
                            <td className="px-3.5 py-2.5 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[9px] inline-block text-center uppercase tracking-wider font-extrabold ${
                                c.status === "done" 
                                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
                                  : (c.status === "progress" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400")
                              }`}>
                                {c.status === "done" ? "Completado" : (c.status === "progress" ? "En Proceso" : "Pendiente")}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-800 dark:text-slate-200 font-semibold">{c.task}</td>
                            <td className="px-3.5 py-2.5 text-right font-bold text-slate-600 dark:text-slate-400">{c.assignee}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: SIGNATURES CLOSE */}
              <div className="signature-area pt-10 mt-8 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 leading-relaxed mb-10">
                  Sin más temas que tratar, se levantó la sesión a la hora indicada precedentemente. Para constancia de lo actuado, se redacta y firma el presente documento por las partes intervinientes como certificado de conformidad administrativa.
                </p>

                <div className="grid grid-cols-2 gap-8 text-center text-xs pt-4">
                  <div>
                    <div className="border-t border-dashed border-slate-300 dark:border-slate-700 w-full pt-2"></div>
                    <strong className="block text-slate-800 dark:text-slate-200 uppercase tracking-wide font-black text-[10px]">{presidentSigner}</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Presidente / Moderador</span>
                  </div>

                  <div>
                    <div className="border-t border-dashed border-slate-300 dark:border-slate-700 w-full pt-2"></div>
                    <strong className="block text-slate-800 dark:text-slate-200 uppercase tracking-wide font-black text-[10px]">{secretarySigner}</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Secretario / Redactor</span>
                  </div>
                </div>
              </div>

              {/* Footer details (only on print) */}
              <div className="hidden print:block text-center pt-8 border-t border-slate-100 text-[9px] text-slate-400 text-slate-400/80">
                Documento de Acta oficial redactado mediante el Looker Sheets Analytical Engine. Fecha: {date.replace("T", " ")}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
