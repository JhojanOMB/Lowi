// =========================
// CARGAR ICONOS
// =========================

const s = document.createElement("link");
s.rel = "stylesheet";
s.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
document.head.appendChild(s);

// =========================
// LIMPIAR TEXTO
// =========================

const limpiar = t =>
  t
    .replace(/\(Modificar\)/g, "")
    .replace(/[.\|$]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// =========================
// EXTRAER TEXTO
// =========================

const extraerTexto = etiquetas => {
  const nodos = document.querySelectorAll("span,div,li,p");
  for (const nodo of nodos) {
    const texto = nodo.textContent.trim();
    const etiqueta = etiquetas.find(e => texto.includes(e));
    if (!etiqueta) continue;
    let valor = texto.split(etiqueta)[1]?.trim() || "";
    valor = valor.split(/\n|\|/)[0].trim();
    return limpiar(valor);
  }
  return "[No encontrado]";
};

// =========================
// DEFINIR ETIQUETAS
// =========================

const eD = ["DNI:", "NIE:"];
const eID = ["AMDOCS ID:", "ID Cliente:"];
const eM = ["Tlf. contacto:", "Movil:"];
const eDir = ["Dirección de instalación:", "Direccion:", "Dirección facturación:"];
const eFin = [
  "Tipo de huella:",
  "Tipo de instalación:",
  "Movil:",
  "Tlf. contacto:",
  "DNI:",
  "ID Cliente:",
  "Fecha creación:",
  "Segmento:",
  "Cuenta bancaria:",
  "Sap ID:",
  "App instalada:",
  "Suscripción ID:",
  "Tarifa:",
  "Fecha activación:",
  "Plan de suscripción actual:",
  "Linea móvil adicional :",
  "ICC:",
  "Portabilidad",
  "Operador donante:",
  "Cargo pendiente:",
  "Motivo de congelamiento:",
  "Factura en papel:",
  "Idioma de la factura:",
  "Crear Ticket",
  "Histórico de planes"
];

// =========================
// EXTRAER DIRECCIONES
// =========================

const extraerDirecciones = () => {
  const resultados = [];
  for (const etiqueta of eDir) {
    const nodos = Array.from(document.querySelectorAll("span,div,li,p")).filter(
      n => n.textContent.includes(etiqueta)
    );
    for (const nodo of nodos) {
      let texto = nodo.textContent;
      let idx = texto.indexOf(etiqueta);
      let valor = texto.slice(idx + etiqueta.length).trim();
      let siguiente = nodo.nextSibling;
      while (siguiente) {
        let contenido =
          siguiente.nodeType === Node.TEXT_NODE
            ? siguiente.textContent.trim()
            : siguiente.nodeType === Node.ELEMENT_NODE
            ? siguiente.textContent.trim()
            : "";
        if (eFin.some(f => contenido.includes(f))) break;
        valor += " " + contenido;
        siguiente = siguiente.nextSibling;
      }
      valor = limpiar(valor);
      for (const fin of eFin) {
        const pos = valor.indexOf(fin);
        if (pos > -1) valor = valor.slice(0, pos).trim();
      }
      if (valor && valor !== "[No encontrado]" && !resultados.includes(valor)) {
        resultados.push(valor);
      }
    }
  }
  if (resultados.length === 0) return "[No encontrado]";
  if (resultados.length === 1) return resultados[0];
  const lista = resultados.map((e, i) => `${i + 1}. ${e}`).join("\n\n");
  const sel = prompt(
    "Se han detectado varias direcciones:\n\n" + lista + "\n\nIndica el número:"
  );
  const idx = parseInt(sel) - 1;
  return !isNaN(idx) && resultados[idx] ? resultados[idx] : resultados[0];
};

// =========================
// EXTRAER NOMBRE
// =========================

const extraerNombre = () => {
  try {
    const nodo = document.evaluate(
      '//*[@id="content-main"]/div/div[3]/div[1]/span[1]',
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    return nodo
      ? limpiar(nodo.textContent.replace(/^Nombre:/, ""))
      : "[No encontrado]";
  } catch {
    return "[No encontrado]";
  }
};

// =========================
// DETECTAR TECNOLOGÍA
// =========================

const detectarTecnologia = () => {
  const texto = document.body.innerText.toUpperCase();
  if (texto.includes("HFC")) return "HFC";
  if (
    texto.includes("NEBAL") ||
    texto.includes("NEBAF") ||
    texto.includes("FTTH")
  )
    return "FTTH";
  return "DESCONOCIDA";
};

// =========================
// DATOS DEL CLIENTE
// =========================

const nombre = extraerNombre();
const dni = extraerTexto(eD);
const id = extraerTexto(eID);
const movil = extraerTexto(eM);
const direccion = extraerDirecciones();
const tipoDoc = /^\d{8}[A-Z]$/.test(dni)
  ? "DNI"
  : /^[XYZ]\d{7}[A-Z]$/.test(dni)
  ? "NIE"
  : "Documento";
const dniFmt = `${tipoDoc}: ${dni}`;

// =========================
// ENCABEZADO
// =========================

const encabezado = () =>
  "PLANTILLA FRONT SOPORTE // CONSULTAS GENERALES\n" +
  `• Nombre: ${nombre}\n` +
  `• ${dniFmt}\n` +
  `• ID: ${id}\n` +
  `• Dirección: ${direccion}\n` +
  `• # Móvil: ${movil}\n`;

// =========================
// COPIAR AL PORTAPAPELES
// =========================

const copiar = texto => {
  const ta = document.createElement("textarea");
  ta.value = texto;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
};

// =========================
// TOAST "COPIADO"
// =========================

const mostrarToast = msg => {
  const t = document.createElement("div");
  t.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #7b2cbf;
    color: white;
    padding: 12px 18px;
    border-radius: 8px;
    font-family: Arial;
    z-index: 999999999;
    opacity: 0;
    transition: opacity .3s;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => (t.style.opacity = "1"), 10);
  setTimeout(() => {
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 300);
  }, 2000);
};

// =========================
// MODAL ONT
// =========================

const detectarONT = () => {
  return new Promise(resolve => {
    const fondo = document.createElement("div");
    fondo.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999999;
    `;
    const modal = document.createElement("div");
    modal.style = `
      background: #1e1e1e;
      padding: 25px;
      border-radius: 12px;
      width: 320px;
      text-align: center;
      color: white;
      font-family: Arial;
      box-shadow: 0 0 20px rgba(0,0,0,.4);
    `;
    modal.innerHTML = `
      <h3 style="margin-top:0; color:#c59bff;">¿Tiene ONT externa?</h3>
      <p style="font-size:14px; color:#ccc;">Selecciona una opción</p>
      <button id="ontSi" style="margin:10px; padding:10px 20px; background:#7b2cbf; border:none; border-radius:8px; color:white; cursor:pointer;">Sí</button>
      <button id="ontNo" style="margin:10px; padding:10px 20px; background:#444; border:none; border-radius:8px; color:white; cursor:pointer;">No</button>
    `;
    fondo.appendChild(modal);
    document.body.appendChild(fondo);
    document.getElementById("ontSi").onclick = () => {
      fondo.remove();
      resolve(true);
    };
    document.getElementById("ontNo").onclick = () => {
      fondo.remove();
      resolve(false);
    };
  });
};

// =========================
// PLANTILLAS
// =========================

// ORIGINAL
const plantillaOriginal = () =>
  encabezado() +
  "• Qué dice el cliente que le sucede:\n" +
  "• Pruebas realizadas:\n" +
  "• Diagnóstico:\n" +
  "• Solución:";

// --- Incomunicado Total ---
const baseIncomunicado = () =>
  encabezado() + "• Qué dice el cliente que le sucede: No tengo internet\n";

const textosIncomunicado = {
  HFC: {
    pruebas:
      "• Pruebas realizadas: router con luces intermitentes, sin acceso remoto al cpe, se valida cableado sin daños\n",
    diag: "• Diagnóstico: posible daño en acometida HFC\n",
    sol: "• Solución: se envía contrata para arreglo de acometida"
  },
  FTTH_ONT: {
    pruebas:
      "• Pruebas realizadas: ONT en rojo en alarm, sin acceso remoto, se valida el cableado no presenta daños y no hay acceso a cpe\n",
    diag: "• Diagnóstico: posible daño en tramo óptico\n",
    sol: "• Solución: se envía contrata para arreglo de acometida"
  },
  FTTH_NO_ONT: {
    pruebas:
      "• Pruebas realizadas: router con ONT integrada sin sincronismo, se valida el cableado no presenta daños, conectado correctamente router\n",
    diag: "• Diagnóstico: posible daño en fibra\n",
    sol: "• Solución: se envía contrata para arreglo de acometida"
  }
};

const plantillaIncomTotal = async () => {
  const tech = detectarTecnologia();
  let tipo;
  if (tech === "HFC") {
    tipo = "HFC";
  } else {
    const tieneOnt = await detectarONT();
    tipo = tieneOnt ? "FTTH_ONT" : "FTTH_NO_ONT";
  }
  const t = textosIncomunicado[tipo];
  return baseIncomunicado() + t.pruebas + t.diag + t.sol;
};

// =========================
// CORTES
// =========================

const baseCortes = () =>
  encabezado() +
  "• Qué dice el cliente que le sucede: El internet va y viene\n";

const textosCortes = {
  HFC: {
    resuelto:
      "• Pruebas realizadas: Reinicio de fábrica, ajuste de cableado, señal estable\n" +
      "• Diagnóstico: Saturación temporal\n" +
      "• Solución: Se hace reinicio de fabrica, se dividen bandas y se comprueba con cliente que el internet ya no tiene cortes",
    tecnico:
      "• Pruebas realizadas: Se valido en Thot bastantes cortes, reinicio de fábrica\n" +
      "• Diagnóstico: Señal degradada\n" +
      "• Solución: Se envía contrata",
    nv2:
      "• Pruebas realizadas: Se valido en Thot cortes de poco tiempo persistentes, se aplico reinicio de fábrica, y se deja para validación de nivel 2\n" +
      "• Diagnóstico: Posible fallo en red o saturación de cpe\n" +
      "• Solución: Se escala a NV2"
  },
  FTTH: {
    resuelto:
      "• Pruebas realizadas: Reinicio de fábrica, ajuste de cableado, señal estable\n" +
      "• Diagnóstico: Saturación temporal\n" +
      "• Solución: Se hace reinicio de fabrica, se dividen bandas y se comprueba con cliente que el internet ya no tiene cortes",
    tecnico:
      "• Pruebas realizadas: Cortes en Schaman, reinicio sin mejora\n" +
      "• Diagnóstico: Posible daño en cpe\n" +
      "• Solución: Se envía contrata",
    nv2:
      "• Pruebas realizadas: Cortes persistentes\n" +
      "• Diagnóstico: Posible fallo en red\n" +
      "• Solución: Se escala a NV2"
  }
};

const plantillaCortes = estado => {
  const tech = detectarTecnologia().includes("HFC") ? "HFC" : "FTTH";
  return baseCortes() + textosCortes[tech][estado];
};

// =========================
// LENTITUD
// =========================

const baseLentitud = () =>
  encabezado() +
  "• Qué dice el cliente que le sucede: Me va muy lento el internet\n";

const textosLentitud = {
  resuelto:
    "• Pruebas realizadas: Reinicio, separación de bandas, test correcto\n" +
    "• Diagnóstico: Saturación del router\n" +
    "• Solución: Se deja resuelto",
  tecnico:
    "• Pruebas realizadas: Reinicio sin mejora, test bajo\n" +
    "• Diagnóstico: Posible daño en cpe o nodo\n" +
    "• Solución: Se envía contrata",
  nv2:
    "• Pruebas realizadas: Test persistente bajo\n" +
    "• Diagnóstico: Posible fallo en red\n" +
    "• Solución: Se escala a NV2"
};

const plantillaLentitud = estado => baseLentitud() + textosLentitud[estado];

// =========================
// BANDAS
// =========================

const baseBandas = () =>
  encabezado() +
  "• Qué dice el cliente que le sucede: Necesito separar la red wifi\n";

const textosBandas = {
  resuelto:
    "• Pruebas realizadas: Se valida en schaman bandas unificadas se separan y se configura nombre\n" +
    "• Diagnóstico: Desea separar bandas para uso personal\n" +
    "• Solución: Se separan bandas y se comprueba conexión correcta",
  no:
    "• Pruebas realizadas: No se pudo acceder al router\n" +
    "• Diagnóstico: Cpe no responde\n" +
    "• Solución: Se envía contrata es voxont no hay acceso remoto"
};

const plantillaBandas = estado => baseBandas() + textosWifi[estado];

// =========================
// WIFI CONTRASEÑA
// =========================

const baseWifi = () =>
  encabezado() +
  "• Qué dice el cliente que le sucede: Quiero cambiar la contraseña del WiFi\n";

const textosWifi = {
  resuelto:
    "• Pruebas realizadas: Se accede al router, se modifica clave\n" +
    "• Diagnóstico: Requería cambio de clave\n" +
    "• Solución: Se deja resuelto",
  no:
    "• Pruebas realizadas: No se pudo acceder al router\n" +
    "• Diagnóstico: Cpe no responde\n" +
    "• Solución: Se envía contrata es voxont no hay acceso remoto"
};

const plantillaWifi = estado => baseWifi() + textosWifi[estado];

// =========================
// AVERÍA MASIVA
// =========================

const baseMasiva = () => encabezado();

const textosMasiva = {
  informacion:
    "• Qué dice el cliente que le sucede: No tengo wifi aún, ¿qué ha pasado con la incidencia?\n" +
    "• Pruebas realizadas: Se accede a Schaman, sigue averia presente, se valdia en Smart averia masiva en curso, se lee información y se le da al cliente\n" +
    "• Diagnóstico: Solo quiere saber sobre la masiva\n" +
    "• Solución: Se revisa averia masiva y se le da la información al cliente de lo que esta ocurriendo y se le pide espere",
  ticket:
    "• Qué dice el cliente que le sucede: No tengo wifi\n" +
    "• Pruebas realizadas: Se accede a Schaman, se valida averia masiva presente, se valdia en Smart averia masiva en curso, se le informa al cliente de tiempos aproxiamdos y bono de datos mientras se resuelve\n" +
    "• Diagnóstico: Solo quiere saber sobre la masiva\n" +
    "• Solución: Se revisa averia masiva y se le da la información al cliente de lo que esta ocurriendo y se le pide espere se crea ticket"
};

const plantillaMasiva = estado => baseMasiva() + textosMasiva[estado];

// =========================
// FUERA DE UMBRALES
// =========================

const baseFuera = () =>
  encabezado() +
  "• Qué dice el cliente que le sucede: El internet va y viene o va muy lento\n";

const textosFuera = {
  resuelto:
    "• Pruebas realizadas: reinicio, separación de bandas, test correcto\n" +
    "• Diagnóstico: saturación del router\n" +
    "• Solución: Se deja resuelto",
  no:
    "• Pruebas realizadas: fuera de umbrales en Schaman\n" +
    "• Diagnóstico: posible daño en nodo o cpe\n" +
    "• Solución: Se envía contrata"
};

const plantillaFueraUmbrales = estado =>
  baseFuera() + textosFuera[estado];

// =========================
// INCOMUNICADO POR IP
// =========================

const baseIncomIP = () =>
  encabezado() + "• Qué dice el cliente que le sucede: No tengo internet\n";

const textosIncomIP = {
  resuelto:
    "• Pruebas realizadas: ajuste de cableado, reinicio manual, apertura de bandas; levanta servicio\n" +
    "• Diagnóstico: cpe saturado\n" +
    "• Solución: Se deja resuelto",
  no:
    "• Pruebas realizadas: cpe incomunicado por IP\n" +
    "• Diagnóstico: pérdida de IP\n" +
    "• Solución: Se envía contrata"
};

const plantillaIncomIP = estado => baseIncomIP() + textosIncomIP[estado];

// =========================
// MANDO TV
// =========================

const baseMando = () =>
  encabezado() +
  "• Qué dice el cliente que le sucede: El mando no funciona\n";

const textosMando = {
  resuelto:
    "• Pruebas realizadas: emparejamiento, cambio de pilas, mando responde\n" +
    "• Diagnóstico: desconfiguración\n" +
    "• Solución: Se deja resuelto",
  no:
    "• Pruebas realizadas: mando sin luces, no empareja\n" +
    "• Diagnóstico: mando defectuoso\n" +
    "• Solución: Se escala a NV2 para cambio"
};

const plantillaMando = estado => baseMando() + textosMando[estado];

// =========================
// ERROR 101
// =========================

const plantilla101 = estado => baseMando() + textosMando[estado];

// =========================
// OBJETO DE PLANTILLAS
// =========================

const plantillas = {
  plantillaOriginal: {
    normal: () => plantillaOriginal()
  },
  incomTotal: {
    tecnico: () => plantillaIncomTotal()
  },
  cortes: {
    resuelto: () => plantillaCortes("resuelto"),
    tecnico: () => plantillaCortes("tecnico"),
    nv2: () => plantillaCortes("nv2")
  },
  lentitud: {
    resuelto: () => plantillaLentitud("resuelto"),
    tecnico: () => plantillaLentitud("tecnico"),
    nv2: () => plantillaLentitud("nv2")
  },
  bandas: {
    separar: () => plantillaBandas("separar")
  },
  wifi: {
    resuelto: () => plantillaWifi("resuelto"),
    no: () => plantillaWifi("no")
  },
  mando: {
    resuelto: () => plantillaMando("resuelto"),
    no: () => plantillaMando("no")
  },
  masiva: {
    informacion: () => plantillaMasiva("informacion"),
    ticket: () => plantillaMasiva("ticket")
  },
  fuera: {
    resuelto: () => plantillaFueraUmbrales("resuelto"),
    no: () => plantillaFueraUmbrales("no")
  },
  incomIP: {
    resuelto: () => plantillaIncomIP("resuelto"),
    no: () => plantillaIncomIP("no")
  },
  error101: {
    unico: () => plantilla101()
  }
};

// =========================
// MENÚ COMPLETO
// =========================

const menu = document.createElement("div");
menu.innerHTML = `
  <div id="menuCopi" style="
    position: fixed !important;
    top: 50% !important;
    right: 20px !important;
    transform: translateY(-50%) !important;
    padding: 14px !important;
    border-radius: 12px !important;
    box-shadow: 0 0 20px rgba(128,0,255,0.35) !important;
    z-index: 999999 !important;
    width: 260px !important;
    max-height: 75vh !important;
    overflow-y: auto !important;
    font-family: Arial !important;
    text-align: left !important;
    background:#1a0f1f !important;
    color:white !important;
    border: 1px solid #5a1e80 !important;
  ">
    <div id="cerrarMenu" style="
      position:absolute !important;
      top:8px !important;
      right:10px !important;
      font-size:18px !important;
      cursor:pointer !important;
      color:#ff6b6b !important;
    "><i class="fa-solid fa-xmark"></i></div>

    <h2 style="
      margin-top:0 !important;
      text-align:center !important;
      color:#d9a6ff !important;
      font-weight:600 !important;
      letter-spacing:.5px !important;
      font-size:17px !important;
      margin-bottom:4px !important;
    ">Generador de Plantillas</h2>

    <p style="
      text-align:center !important;
      margin-top:-6px !important;
      color:#c9c9c9 !important;
      font-size:12px !important;
    ">Selecciona la tipificación que necesites</p>

    <!-- INTERNET -->
    <div class="grupo">
      <div class="tituloGrupo abierto">
        <i class="fa-solid fa-wifi"></i> Internet / WiFi
        <i class="fa-solid fa-chevron-down" style="float:right;"></i>
      </div>
      <div class="contenidoGrupo" style="display:block !important;">
        <div class="subtituloGrupo">
          Info Limpia
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="plantillaOriginal.normal" class="btnMenu">Copiar</button>
        </div>

        <div class="subtituloGrupo">
          Incomunicado Total
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="incomTotal.tecnico" class="btnMenu">Envío de Técnico</button>
        </div>

        <div class="subtituloGrupo">
          Cortes
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="cortes.resuelto" class="btnMenu">Resuelto</button>
          <button data-opt="cortes.tecnico" class="btnMenu">Envío de técnico</button>
          <button data-opt="cortes.nv2" class="btnMenu">Escalar a NV2</button>
        </div>

        <div class="subtituloGrupo">
          Lentitud
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="lentitud.resuelto" class="btnMenu">Resuelto</button>
          <button data-opt="lentitud.tecnico" class="btnMenu">Envío de técnico</button>
          <button data-opt="lentitud.nv2" class="btnMenu">Escalar a NV2</button>
        </div>

        <div class="subtituloGrupo">
          Cambio Contraseña
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="wifi.resuelto" class="btnMenu">Cambio de Contraseña</button>
        </div>

        <div class="subtituloGrupo">
          Avería Masiva
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="masiva.informacion" class="btnMenu">Información</button>
          <button data-opt="masiva.ticket" class="btnMenu">Ticket Creado</button>
        </div>

        <div class="subtituloGrupo">
          Fuera de umbrales
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="fuera.resuelto" class="btnMenu">Resuelto</button>
          <button data-opt="fuera.no" class="btnMenu">Envio de Técnico</button>
        </div>

        <div class="subtituloGrupo">
          Bandas
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="bandas.separadas" class="btnMenu">Separa Bandas 2.4/5G</button>
        </div>

        <div class="subtituloGrupo">
          Incomunicado IP
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="incomIP.resuelto" class="btnMenu">Resuelto</button>
          <button data-opt="incomIP.no" class="btnMenu">Envio de Técnico</button>
        </div>
      </div>
    </div>

    <!-- TV -->
    <div class="grupo">
      <div class="tituloGrupo">
        <i class="fa-solid fa-tv"></i> TV
        <i class="fa-solid fa-chevron-down" style="float:right;"></i>
      </div>
      <div class="contenidoGrupo" style="display:none !important;">
        <div class="subtituloGrupo">
          Mando
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="mando.resuelto" class="btnMenu">Resuelto</button>
          <button data-opt="mando.no" class="btnMenu">No resuelto</button>
        </div>

        <div class="subtituloGrupo">
          Error 101
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="error101.unico" class="btnMenu">Esperar activación</button>
        </div>
      </div>
    </div>

    <style>
      /* Scroll personalizado */
      #menuCopi::-webkit-scrollbar {
        width: 8px;
      }
      #menuCopi::-webkit-scrollbar-track {
        background: #2a0f3a;
        border-radius: 10px;
      }
      #menuCopi::-webkit-scrollbar-thumb {
        background: #9d4edd;
        border-radius: 10px;
      }
      #menuCopi::-webkit-scrollbar-thumb:hover {
        background: #c77dff;
      }

      /* Botones */
      .btnMenu {
        width: 100% !important;
        padding: 7px !important;
        margin: 4px 0 !important;
        border-radius: 8px !important;
        border: none !important;
        color: white !important;
        background: #7b2cbf !important;
        cursor: pointer !important;
        transition: .15s !important;
        font-size: 13px !important;
      }
      .btnMenu:hover {
        background: #9d4edd !important;
        transform: translateY(-2px) !important;
      }

      /* Grupos */
      .tituloGrupo {
        padding: 10px !important;
        background: #2a0f3a !important;
        border-radius: 8px !important;
        margin-top: 10px !important;
        cursor: pointer !important;
        font-weight: bold !important;
        font-size: 14px !important;
        border: 1px solid #5a1e80 !important;
      }
      .tituloGrupo:hover {
        background: #3a1450 !important;
      }

      /* Subgrupos */
      .subtituloGrupo {
        padding: 6px !important;
        background: #2d1a3a !important;
        border-radius: 6px !important;
        margin-top: 6px !important;
        cursor: pointer !important;
        font-size: 13px !important;
        border: 1px solid #5a1e80 !important;
      }
      .subtituloGrupo:hover {
        background: #3b2250 !important;
      }

      /* Subcontenido alineado */
      .subcontenidoGrupo {
        display: none;
        margin-left: 8px !important;
        padding-left: 8px !important;
        border-left: 2px solid #9d4edd !important;
        margin-bottom: 6px !important;
      }

      .tituloGrupo i, .subtituloGrupo i {
        pointer-events: none !important;
      }
    </style>
  </div>
`;

document.body.appendChild(menu);

// =========================
// SUBMENÚS
// =========================

menu.querySelectorAll(".subtituloGrupo").forEach(sub => {
  sub.addEventListener("click", () => {
    const cont = sub.nextElementSibling;
    cont.style.display =
      cont.style.display === "block" ? "none" : "block";
  });
});

// =========================
// GRUPOS
// =========================

menu.querySelectorAll(".tituloGrupo").forEach(t => {
  t.addEventListener("click", () => {
    const cont = t.nextElementSibling;
    const abierto = t.classList.contains("abierto");
    menu.querySelectorAll(".contenidoGrupo").forEach(x => (x.style.display = "none"));
    menu.querySelectorAll(".tituloGrupo").forEach(x => x.classList.remove("abierto"));
    if (!abierto) {
      cont.style.display = "block";
      t.classList.add("abierto");
    }
  });
});

// =========================
// BOTONES → COPIAR
// =========================

menu.querySelectorAll(".btnMenu").forEach(btn => {
  btn.addEventListener("click", async () => {
    const option = btn.getAttribute("data-opt");
    const [grupo, clave] = option.split(".");
    const fn = plantillas?.[grupo]?.[clave];
    if (typeof fn === "function") {
      let texto = fn();
      if (texto instanceof Promise) texto = await texto;
      copiar(texto);
      mostrarToast("Copiado correctamente");
    } else {
      mostrarToast("Error: plantilla no encontrada");
    }
  });
});

// =========================
// CERRAR MENÚ
// =========================

menu.querySelector("#cerrarMenu").addEventListener("click", () => {
  menu.remove();
});