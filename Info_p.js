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

const eD = ["DNI:", "NIE:", "PASSPORT:", "Passport:"];
const eID = ["AMDOCS ID:", "ID Cliente:"];
const eM = ["Tlf. contacto:", "Movil:"];
const eDir = ["Dirección de instalación:", "Direccion:", "Dirección facturación:"];
const eFin = [
  "Tipo de huella:",
  "Tipo de instalación:",
  "Movil:",
  "Tlf. contacto:",
  "DNI:",
  "PASSPORT:",
  "Passport:",
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
  : dni !== "[No encontrado]"
  ? "Passport"
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
    background: linear-gradient(135deg, #6d28d9, #9d4edd);
    color: white;
    padding: 14px 18px;
    border-radius: 12px;
    font-family: Arial, sans-serif;
    z-index: 999999999;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity .3s ease, transform .3s ease;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  `;
  t.innerHTML = `<strong style="display:block; margin-bottom:4px;">Copiado</strong><span style="font-size:12px;">${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "1";
    t.style.transform = "translateY(0)";
  }, 10);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateY(-10px)";
    setTimeout(() => t.remove(), 300);
  }, 2200);
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
      "• Pruebas realizadas: ONT en rojo en alarma, sin acceso remoto, se valida el cableado no presenta daños y no hay acceso a CPE\n",
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
      "• Pruebas realizadas: Se revisa en THOT que hay cortes en los últimos 7 días, se hace reinicio de fábrica, ajuste de cableado y separación de bandas, y la conexión a internet queda estable sin cortes\n" +
      "• Diagnóstico: Saturación temporal del CPE\n" +
      "• Solución: Se hace reinicio de fábrica, se dividen bandas y se comprueba con el cliente que el internet ya no tiene cortes",
    tecnico:
      "• Pruebas realizadas: Se valida en THOT bastantes cortes, reinicio de fábrica sin mejora tras prueba de conexión\n" +
      "• Diagnóstico: Señal degradada tras saturación del CPE\n" +
      "• Solución: Se envía contrata para revisión y posible cambio de CPE",
    nv2:
      "• Pruebas realizadas: Se valida en THOT cortes de poco tiempo persistentes, se aplicó reinicio de fábrica y se deja para validación de nivel 2\n" +
      "• Diagnóstico: Posible fallo en red o saturación del CPE\n" +
      "• Solución: Se escala a NV2 para revisión de red"
  },
  FTTH: {
    resuelto:
      "• Pruebas realizadas: Se revisó en Schaman que hay cortes, se reinicia de fábrica, se ajusta cableado y la señal queda estable en ambas bandas WiFi\n" +
      "• Diagnóstico: Saturación temporal del CPE\n" +
      "• Solución: Se hace reinicio de fábrica, se dividen bandas y se comprueba con el cliente que el internet ya no tiene cortes",
    tecnico:
      "• Pruebas realizadas: Cortes en Schaman, reinicio de fábrica sin mejora\n" +
      "• Diagnóstico: Posible daño en CPE\n" +
      "• Solución: Se envía contrata para revisión y posible cambio de CPE",
    nv2:
      "• Pruebas realizadas: Cortes persistentes validados en Schaman, se hace pruebas con videos y en red pero sigue ocurriendo y sin mejora\n" +
      "• Diagnóstico: Posible fallo en red\n" +
      "• Solución: Se escala a NV2 para revisión de red"
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
    "• Pruebas realizadas: Reinicio de fábrica, separación de bandas, test de velocidad correcto\n" +
    "• Diagnóstico: Saturación del router\n" +
    "• Solución: Se realizó reinicio de fábrica, se separan bandas y se comprueba con el cliente que el internet ya no va lento",
  tecnico:
    "• Pruebas realizadas: Reinicio de fábrica sin mejora, test bajo\n" +
    "• Diagnóstico: Posible daño en CPE o nodo\n" +
    "• Solución: Se envía contrata para revisión y posible cambio de CPE",
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
  separar:
    "• Pruebas realizadas: Se valida en Schaman bandas unificadas se separan y se configura nombre\n" +
    "• Diagnóstico: Desea separar bandas para uso personal\n" +
    "• Solución: Se separan bandas y se comprueba conexión correcta",
  no:
    "• Pruebas realizadas: No se pudo acceder al router\n" +
    "• Diagnóstico: CPE no responde\n" +
    "• Solución: Se envía contrata; es Voxont y no hay acceso remoto"
};

const plantillaBandas = estado => baseBandas() + textosBandas[estado];

// =========================
// WIFI CONTRASEÑA
// =========================

const baseWifi = () =>
  encabezado() +
  "• Qué dice el cliente que le sucede: Quiero cambiar la contraseña del WiFi\n";

const textosWifi = {
  resuelto:
    "• Pruebas realizadas: Se accede al router, se modifica la clave\n" +
    "• Diagnóstico: Requería cambio de clave\n" +
    "• Solución: Se cambió la contraseña y se comprueba conexión correcta con la nueva clave",
  no:
    "• Pruebas realizadas: No se pudo acceder al router\n" +
    "• Diagnóstico: CPE no responde\n" +
    "• Solución: Se envía contrata; es Voxont y no hay acceso remoto"
};

const plantillaWifi = estado => baseWifi() + textosWifi[estado];

// =========================
// AVERÍA MASIVA
// =========================

const baseMasiva = () => encabezado();

const textosMasiva = {
  informacion:
    "• Qué dice el cliente que le sucede: No tengo wifi aún, ¿qué ha pasado con la incidencia?\n" +
    "• Pruebas realizadas: Se accede a Schaman, sigue avería presente, se valida en Smart que hay una avería masiva en curso, se lee la información y se le da al cliente\n" +
    "• Diagnóstico: Solo quiere saber sobre la masiva\n" +
    "• Solución: Se revisa la avería masiva y se le da al cliente información de lo que está ocurriendo, solicitándole que espere",
  ticket:
    "• Qué dice el cliente que le sucede: No tengo wifi\n" +
    "• Pruebas realizadas: Se accede a Schaman, se valida que hay una avería masiva presente, se valida en Smart la avería masiva en curso, y se le informa al cliente de tiempos aproximados y de un posible bono de datos mientras se resuelve\n" +
    "• Diagnóstico: Solo quiere saber sobre la masiva\n" +
    "• Solución: Se revisa la avería masiva y se le da al cliente información de lo que está ocurriendo, se le pide que espere y se crea ticket"
};

const plantillaMasiva = estado => baseMasiva() + textosMasiva[estado];

// =========================
// FUERA DE UMBRALES
// =========================

const baseFuera = () =>
  encabezado() +
  "• Qué dice el cliente que le sucede: El internet va y viene o va muy lento\n";

const textosFuera = {
  HFC: {
    resuelto:
      "• Pruebas realizadas: Se valida en THOT parámetros fuera de umbrales, se reinicia de fábrica, se reinician parámetros SNMP, flaps y QoS, separación de bandas, test correcto\n" +
      "• Diagnóstico: Saturación del router o parámetros degradados\n" +
      "• Solución: Se reinicia de fábrica, se reinician parámetros SNMP, se dividen bandas y se comprueba con el cliente que el internet ya no tiene cortes ni lentitud ni parámetros fuera de umbral",
    no:
      "• Pruebas realizadas: Fuera de umbrales en THOT, reinicio de fábrica y reinicio de parámetros sin mejora\n" +
      "• Diagnóstico: posible daño en nodo o CPE\n" +
      "• Solución: Se envía contrata para revisión y posible cambio de CPE o revisión de nodo"
  },
  FTTH: {
    resuelto:
      "• Pruebas realizadas: Se revisa en Schaman parámetros fuera de umbrales, se hace reinicio de fábrica, separación de bandas, test correcto\n" +
      "• Diagnóstico: Saturación del router\n" +
      "• Solución: Se deja resuelto",
    no:
      "• Pruebas realizadas: Fuera de umbrales en Schaman\n" +
      "• Diagnóstico: posible daño en nodo o CPE\n" +
      "• Solución: Se envía contrata para revisión y posible cambio de CPE o revisión de nodo"
  }
};

const plantillaFueraUmbrales = estado => {
  const tech = detectarTecnologia().includes("HFC") ? "HFC" : "FTTH";
  return baseFuera() + textosFuera[tech][estado];
};

// =========================
// INCOMUNICADO POR IP
// =========================

const baseIncomIP = () =>
  encabezado() + "• Qué dice el cliente que le sucede: No tengo internet\n";

const textosIncomIP = {
  resuelto:
    "• Pruebas realizadas: Ajuste de cableado, reinicio manual de fábrica, apertura de bandas, y el servicio levanta con IP correctamente\n" +
    "• Diagnóstico: CPE saturado\n" +
    "• Solución: Se deja resuelto",
  no:
    "• Pruebas realizadas: CPE incomunicado por IP\n" +
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
// TV

const baseTVCanal = () =>
  encabezado() +
  "• Qué dice el cliente que le sucede: No ve algún canal\n";

const plantillaTVCanal = () =>
  baseTVCanal() +
  "• Pruebas realizadas: Se verifica señal del deco y se explica al cliente cuál es el canal directamente\n" +
  "• Diagnóstico: Cliente no localiza el canal\n" +
  "• Solución: Se le indica el canal directo y se confirma que ya lo ve\n";

const baseTVDeportivos = () =>
  encabezado() +
  "• Qué dice el cliente que le sucede: No le salen los canales deportivos\n";

const plantillaTVDeportivos = () =>
  baseTVDeportivos() +
  "• Pruebas realizadas: Reinicio de fábrica al deco, se configura desde el inicio con el cliente y se revisa la lista de canales\n" +
  "• Diagnóstico: El deco necesita reconfiguración completa\n" +
  "• Solución: Reinicio de fábrica al deco, configuración inicial con el cliente y verificación de canales deportivos\n";

// =========================
// ERROR 101
// =========================

const base101 = () =>
  encabezado() +
  "• Qué dice el cliente que le sucede: Me sale error 101\n";

const textos101 = {
  informacion:
    "• Pruebas realizadas: Se valida en logística que está en reparto, aún no han pasado 48 horas desde el deco\n" +
    "• Diagnóstico: No se ha activado el deco porque logística no ha notificado aún\n" +
    "• Solución: Se indica al cliente que espere a que logística confirme la entrega del deco y que el servicio se active automáticamente",
  nv2:
    "• Pruebas realizadas: Se verificó el estado en logística, está entregado y ya pasaron 48 horas, se revisa la MAC y no es la misma\n" +
    "• Diagnóstico: MAC diferente\n" +
    "• Solución: Se escala a NV2 para revisión de error 101"
};

const plantilla101 = estado => base101() + textos101[estado];

// =========================
// TÉCNICO INCUMPLIDO
// =========================

const baseTecnicoIncumplido = () => encabezado();

const textosTecnicoIncumplido = {
  esperaCita:
    "• Qué dice el cliente que le sucede: Tengo cita con el técnico\n" +
    "• Pruebas realizadas: Se valida la cita programada en Smart, se verifica la fecha y hora de la cita y se informa al cliente que no ha pasado el tiempo de espera\n" +
    "• Diagnóstico: Cita aún en tiempo de espera\n" +
    "• Solución: Se informa al cliente que debe esperar dentro de la franja horaria indicada y se le pide paciencia",
  incumplimiento:
    "• Qué dice el cliente que le sucede: El técnico no vino a la cita\n" +
    "• Pruebas realizadas: Se verifica en Smart que la cita ya pasó y se valida que el técnico no presentó la visita\n" +
    "• Diagnóstico: Incumplimiento de visita técnica\n" +
    "• Solución: Se disculpa con el cliente y se reporta al técnico en base black list"
};

const plantillaTecnicoIncumplido = estado =>
  baseTecnicoIncumplido() + textosTecnicoIncumplido[estado];

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
  tv: {
    canal: () => plantillaTVCanal(),
    deportivos: () => plantillaTVDeportivos()
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
    informacion: () => plantilla101("informacion"),
    nv2: () => plantilla101("nv2")
  },
  tecnicoIncumplido: {
    esperaCita: () => plantillaTecnicoIncumplido("esperaCita"),
    incumplimiento: () => plantillaTecnicoIncumplido("incumplimiento")
  }
};

// =========================
// MENÚ COMPLETO
// =========================

if (document.getElementById("menuCopi")) {
  return;
}

const menu = document.createElement("div");
menu.innerHTML = `
  <div id="menuCopi" style="
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    padding: 10px !important;
    border-radius: 16px !important;
    box-shadow: 0 0 28px rgba(128,0,255,0.35) !important;
    z-index: 999999 !important;
    width: min(350px, 70vw) !important;
    max-height: 85vh !important;
    overflow-y: auto !important;
    font-family: Arial !important;
    font-size: 12px !important;
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
      font-size:15px !important;
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
          <button data-opt="fuera.no" class="btnMenu">Envío de técnico</button>
        </div>

        <div class="subtituloGrupo">
          Bandas
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="bandas.separar" class="btnMenu">Separa Bandas 2.4/5G</button>
        </div>

        <div class="subtituloGrupo">
          Incomunicado IP
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="incomIP.resuelto" class="btnMenu">Resuelto</button>
          <button data-opt="incomIP.no" class="btnMenu">Envío de técnico</button>
        </div>

        <div class="subtituloGrupo">
          Técnico Incumplido
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="tecnicoIncumplido.esperaCita" class="btnMenu">Aún en tiempo de cita</button>
          <button data-opt="tecnicoIncumplido.incumplimiento" class="btnMenu">Técnico incumplió</button>
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
          Canales
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="tv.canal" class="btnMenu">No ve algún canal</button>
          <button data-opt="tv.deportivos" class="btnMenu">No salen canales deportivos</button>
        </div>

        <div class="subtituloGrupo">
          Error 101
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="error101.informacion" class="btnMenu">Esperar activación</button>
          <button data-opt="error101.nv2" class="btnMenu">Escalar a NV2</button>
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
        padding: 6px !important;
        margin: 2px 0 !important;
        border-radius: 8px !important;
        border: none !important;
        color: white !important;
        background: #7b2cbf !important;
        cursor: pointer !important;
        transition: .15s !important;
        font-size: 12px !important;
      }
      .btnMenu:hover {
        background: #9d4edd !important;
        transform: translateY(-2px) !important;
      }

      /* Grupos */
      .tituloGrupo {
        padding: 6px !important;
        background: #2a0f3a !important;
        border-radius: 8px !important;
        margin-top: 6px !important;
        cursor: pointer !important;
        font-weight: bold !important;
        font-size: 13px !important;
        border: 1px solid #5a1e80 !important;
      }
      .tituloGrupo:hover {
        background: #3a1450 !important;
      }

      /* Subgrupos */
      .subtituloGrupo {
        padding: 3px !important;
        background: #2d1a3a !important;
        border-radius: 6px !important;
        margin-top: 3px !important;
        cursor: pointer !important;
        font-size: 12px !important;
        border: 1px solid #5a1e80 !important;
      }
      .subtituloGrupo:hover {
        background: #3b2250 !important;
      }

      /* Subcontenido alineado */
      .subcontenidoGrupo {
        display: none;
        margin-left: 4px !important;
        padding-left: 4px !important;
        border-left: 2px solid #9d4edd !important;
        margin-bottom: 4px !important;
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
      const nombrePlantilla = btn.textContent.trim() || option;
      mostrarToast(`Plantilla copiada: ${nombrePlantilla}`);
      menu.remove();
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