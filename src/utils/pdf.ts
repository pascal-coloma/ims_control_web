import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";
import dayjs from "dayjs";
import type { DocumentoAtencion } from "../types/api";

function formatearHora(hora: string | undefined): string {
  if (!hora) return "—";
  if (hora.includes(":")) return hora;
  if (hora.length < 4) return hora;
  return `${hora.slice(0, 2)}:${hora.slice(2, 4)}`;
}

function formatearFechaHora(iso: string): string {
  if (!iso) return "—";
  return dayjs(iso).format("DD/MM/YYYY HH:mm");
}

/** Builds the signed-document HTML and opens the browser print dialog so it can be saved as PDF. */
export function generatePDF(data: DocumentoAtencion): void {
  const {
    atencion,
    paciente,
    registrado_por,
    recibido_por,
    signos_vitales,
    preinforme,
    cronologia,
    insumos_utilizados,
    Hash,
  } = data;

  const verifyUrl = `${window.location.origin}/api/documentos/verificar/?hash=${Hash}`;
  const qrSvg = renderToStaticMarkup(
    createElement(QRCodeSVG, { value: verifyUrl, size: 64, marginSize: 1 }),
  );

  const signosRows = signos_vitales
    .map(
      (s) => `
    <tr>
      <td>${formatearHora(s.hora)}</td>
      <td>${s.presion_sistolica}/${s.presion_diastolica}</td>
      <td>${Math.round((s.presion_diastolica * 2 + s.presion_sistolica) / 3)}</td>
      <td>${s.frecuencia_cardiaca}</td>
      <td>—</td>
      <td>${s.fr}</td>
      <td>${s.saturacion_oxigeno}%</td>
      <td>${s.fio2}%</td>
      <td>${s.temperatura}°C</td>
      <td>${s.hgt}</td>
      <td>${s.gcs}</td>
      <td>${s.eva}</td>
    </tr>
  `,
    )
    .join("");

  const insumosRows = insumos_utilizados
    .map(
      (i) => `
    <tr>
      <td>${i.insumo__insumo__nombre_insumo}</td>
      <td>—</td>
      <td>${i.cantidad_usada}</td>
      <td>${i.observaciones ?? "—"}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8"/>
      <title>Ficha de Atención #${atencion.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: Arial, sans-serif;
          font-size: 10px;
          color: #1a1a2e;
          padding: 16px;
          background: white;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 2px solid #1a3a6b;
          padding: 8px 12px;
          margin-bottom: 6px;
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logo-box {
          background: #1a3a6b;
          color: white;
          font-size: 18px;
          font-weight: 900;
          padding: 4px 10px;
          letter-spacing: 2px;
          border-radius: 2px;
        }
        .logo-sub {
          font-size: 8px;
          color: #1a3a6b;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .header-title {
          font-size: 13px;
          font-weight: 900;
          color: #1a3a6b;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-align: right;
        }
        .header-folio {
          font-size: 9px;
          color: #666;
          text-align: right;
        }
        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-bottom: 6px;
        }
        .section {
          border: 1px solid #1a3a6b;
          margin-bottom: 6px;
        }
        .section-title {
          background: #1a3a6b;
          color: white;
          font-size: 9px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 3px 8px;
        }
        .section-body {
          padding: 6px 8px;
        }
        .field-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 4px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 3px;
        }
        .field-row:last-child { border-bottom: none; margin-bottom: 0; }
        .field-label {
          font-size: 8px;
          font-weight: bold;
          color: #1a3a6b;
          text-transform: uppercase;
          white-space: nowrap;
          min-width: 80px;
        }
        .field-value {
          font-size: 10px;
          color: #1a1a1a;
          flex: 1;
          border-bottom: 1px solid #aaa;
          min-height: 14px;
          padding-left: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9px;
        }
        th {
          background: #e8edf5;
          color: #1a3a6b;
          font-weight: bold;
          text-align: center;
          padding: 3px 2px;
          border: 1px solid #1a3a6b;
          font-size: 8px;
        }
        td {
          border: 1px solid #aab;
          text-align: center;
          padding: 4px 2px;
          height: 18px;
          font-size: 9px;
        }
        tr:nth-child(even) td { background: #f5f7fb; }
        .crono-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .crono-cell {
          border: 1px solid #aab;
          padding: 4px 6px;
        }
        .crono-label {
          font-size: 7px;
          font-weight: bold;
          color: #1a3a6b;
          text-transform: uppercase;
        }
        .crono-value {
          font-size: 11px;
          min-height: 16px;
          border-bottom: 1px solid #aaa;
          margin-top: 2px;
        }
        .firma-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px;
          margin-top: 6px;
        }
        .firma-box {
          border: 1px solid #1a3a6b;
          padding: 6px 8px;
        }
        .firma-label {
          font-size: 8px;
          font-weight: bold;
          color: #1a3a6b;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .firma-line {
          border-top: 1px solid #aaa;
          font-size: 8px;
          color: #999;
          padding-top: 2px;
        }
        .hash-box {
          margin-top: 6px;
          border: 1px solid #ddd;
          padding: 4px 8px;
          background: #f9f9f9;
          font-size: 7px;
          color: #666;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hash-text {
          word-break: break-all;
          flex: 1;
        }
        .condicion-row {
          display: flex;
          gap: 12px;
          padding: 6px 8px;
          align-items: center;
        }
        .badge-check {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: bold;
        }
        .checkbox {
          width: 12px;
          height: 12px;
          border: 1.5px solid #1a3a6b;
          display: inline-block;
          border-radius: 2px;
          background: ${preinforme?.estado_paciente === "estable" ? "#1a3a6b" : "white"};
        }
        .checkbox-inestable {
          width: 12px;
          height: 12px;
          border: 1.5px solid #1a3a6b;
          display: inline-block;
          border-radius: 2px;
          background: ${preinforme?.estado_paciente === "inestable" ? "#E53935" : "white"};
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>

      <!-- HEADER -->
      <div class="header">
        <div class="header-logo">
          <div class="logo-box">IMS</div>
          <div>
            <div class="logo-sub">Intensive Medicine On The Street</div>
            <div class="logo-sub">Registro de Atención Prehospitalaria</div>
          </div>
        </div>
        <div>
          <div class="header-title">Ficha de Atención</div>
          <div class="header-folio">N° Atención: ${atencion.id}</div>
          <div class="header-folio">Fecha: ${formatearFechaHora(atencion.hora_salida)}</div>
          <div class="header-folio">Estado: ${atencion.estado_sello}</div>
        </div>
      </div>

      <!-- PACIENTE -->
      <div class="section">
        <div class="section-title">Datos del Paciente</div>
        <div class="section-body">
          <div class="field-row">
            <span class="field-label">Nombre</span>
            <span class="field-value">${paciente?.nombre_completo ?? "—"}</span>
          </div>
          <div class="field-row">
            <span class="field-label">RUT</span>
            <span class="field-value">${paciente?.rut ?? "—"}</span>
          </div>
        </div>
      </div>

      <!-- MAIN GRID -->
      <div class="main-grid">

        <!-- COLUMNA IZQUIERDA -->
        <div>
          <!-- Datos Atención -->
          <div class="section">
            <div class="section-title">Datos de la Atención</div>
            <div class="section-body">
              <div class="field-row">
                <span class="field-label">Hora Salida</span>
                <span class="field-value">${formatearFechaHora(atencion.hora_salida)}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Hora Llegada</span>
                <span class="field-value">${formatearFechaHora(atencion.hora_llegada)}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Despacho N°</span>
                <span class="field-value">${atencion.despacho}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Ambulancia N°</span>
                <span class="field-value">${atencion.ambulancia}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Registrado por</span>
                <span class="field-value">${registrado_por?.nombre_completo ?? "—"} (${registrado_por?.rut ?? "—"}) — ${registrado_por?.rol ?? "—"}</span>
              </div>
            </div>
          </div>

          <!-- Pre Informe -->
          <div class="section">
            <div class="section-title">Pre Informe</div>
            <div class="section-body">
              <div class="field-row">
                <span class="field-label">Motivo</span>
                <span class="field-value">${preinforme?.motivo_llamado ?? "—"}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Pre Informe</span>
                <span class="field-value">${preinforme?.pre_informe ?? "—"}</span>
              </div>
            </div>
          </div>

          <!-- Condición -->
          <div class="section">
            <div class="section-title">Condición del Paciente</div>
            <div class="condicion-row">
              <div class="badge-check">
                <span class="checkbox"></span> Estable
              </div>
              <div class="badge-check">
                <span class="checkbox-inestable"></span> Inestable
              </div>
            </div>
          </div>

          <!-- Insumos -->
          <div class="section">
            <div class="section-title">Insumos Utilizados</div>
            <table>
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th>Dilución</th>
                  <th>Dosis</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                ${insumosRows || "<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>"}
              </tbody>
            </table>
          </div>
        </div>

        <!-- COLUMNA DERECHA -->
        <div>
          <!-- Signos Vitales -->
          <div class="section">
            <div class="section-title">Signos Vitales</div>
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>PA</th>
                  <th>PAM</th>
                  <th>FC</th>
                  <th>Ritmo</th>
                  <th>FR</th>
                  <th>SAT O2</th>
                  <th>FIO2</th>
                  <th>T°</th>
                  <th>HGT</th>
                  <th>GCS</th>
                  <th>EVA</th>
                </tr>
              </thead>
              <tbody>
                ${signosRows || "<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>"}
              </tbody>
            </table>
          </div>

          <!-- Cronología -->
          <div class="section">
            <div class="section-title">Cronología</div>
            <div class="crono-grid">
              <div class="crono-cell">
                <div class="crono-label">Hora Llamada</div>
                <div class="crono-value">${formatearHora(cronologia?.hora_llamada)}</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Despacho Móvil</div>
                <div class="crono-value">${formatearHora(cronologia?.despacho_movil)}</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Llegada QTH1</div>
                <div class="crono-value">${formatearHora(cronologia?.llegada_qth1)}</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Salida QTH1</div>
                <div class="crono-value">${formatearHora(cronologia?.salida_qth1)}</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Llegada QTH2</div>
                <div class="crono-value">${formatearHora(cronologia?.llegada_qth2)}</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Salida QTH2</div>
                <div class="crono-value">${formatearHora(cronologia?.salida_qth2)}</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Categoría</div>
                <div class="crono-value" style="font-weight:900; font-size:16px; color:#1a3a6b;">${cronologia?.categoria ?? "—"}</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Estado Sello</div>
                <div class="crono-value">${atencion.estado_sello}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FIRMAS -->
      <div class="firma-row">
        <div class="firma-box">
          <div class="firma-label">Médico Receptor</div>
          <div style="font-size:10px; margin-bottom: 4px;">RUT: ${recibido_por || "—"}</div>
          <div style="min-height: 18px;"></div>
          <div class="firma-line">Nombre y firma</div>
        </div>
        <div class="firma-box">
          <div class="firma-label">Categoría</div>
          <div style="font-size:24px; font-weight:900; color:#1a3a6b; text-align:center; padding: 8px 0;">${cronologia?.categoria ?? "—"}</div>
        </div>
        <div class="firma-box">
          <div class="firma-label">Integridad del Documento</div>
          <div style="font-size:9px; color:#22c55e; font-weight:bold;">${atencion.estado_sello === "Firmado" ? "✓ Documento Firmado" : "Pendiente"}</div>
        </div>
      </div>

      <!-- HASH + QR DE VERIFICACIÓN -->
      <div class="hash-box">
        <span class="hash-text"><strong>Hash SHA-256:</strong> ${Hash}</span>
        ${qrSvg}
      </div>

    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error(
      "No se pudo abrir la ventana de impresión. Verifica que los pop-ups estén permitidos en el navegador.",
    );
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
}
