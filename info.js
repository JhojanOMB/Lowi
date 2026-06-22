  (() => {
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
      background: linear-gradient(135deg, #c59bff, #7b2cbf);
      color: white;
      padding: 16px 20px;
      border-radius: 14px;
      font-family: 'Segoe UI', Arial, sans-serif;
      z-index: 999999999;
      opacity: 0;
      transform: translateY(12px);
      transition: opacity .3s ease, transform .3s ease;
      box-shadow: 0 12px 35px rgba(0,0,0,0.25), 0 0 30px rgba(199,125,255,0.3);
      max-width: 350px;
      border: 1px solid rgba(255,255,255,0.2);
    `;
    t.innerHTML = `<strong style="display:block; margin-bottom:6px; color:#f3e6ff; font-size:13px"><i class="fa-solid fa-check-circle" style="margin-right:8px"></i>Excelente</strong><span style="font-size:12px;line-height:1.5;">${msg}</span>`;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "1";
      t.style.transform = "translateY(0)";
    }, 10);
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateY(-10px)";
      setTimeout(() => t.remove(), 300);
    }, 2500);
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
        "• Pruebas realizadas: Se revisa en THOT que hay cortes en los últimos 7 días, se hace reinicio de fábrica y reinicio de parámetros (reinicio de flaps, reinicio de cablemodem y reinicio de snmp), ajuste de cableado y separación de bandas, y la conexión a internet queda estable sin cortes\n" +
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
      "• Pruebas realizadas: Reinicio de fábrica sin mejora, test bajo en 5G\n" +
      "• Diagnóstico: Posible daño en CPE o nodo\n" +
      "• Solución: Se envía contrata para revisión y posible cambio de CPE",
    nv2:
      "• Pruebas realizadas: Reset de fábrica si está persistente bajo en banda 5G y en cableado\n" +
      "• Diagnóstico: Posible fallo de saturación\n" +
      "• Solución: Se escala a NV2 por lentitud persistente tras reinicio de fábrica para revisión de red"
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
      "• Solución: Se envía contrata; cpe no hay acceso remoto"
  };

  const plantillaBandas = estado => baseBandas() + textosBandas[estado];

  // =========================
  // WIFI CONTRASEÑA
  // =========================

  const baseContraseña = () =>
    encabezado();

  const textosContraseña = {
    resuelto:
      "• Qué dice el cliente que le sucede: Quiero cambiar la contraseña del WiFi\n" +
      "• Pruebas realizadas: Se accede al router, se modifica la clave\n" +
      "• Diagnóstico: Requería cambio de clave\n" +
      "• Solución: Se cambió la contraseña y se comprueba conexión correcta con la nueva clave",
    nv2:
      "• Qué dice el cliente que le sucede: Quiero cambiar la contraseña del WiFi\n" +    
      "• Pruebas realizadas: No se pudo acceder al router\n" +
      "• Diagnóstico: CPE no responde\n" +
      "• Solución: Se envía escala nv2 para validación de si pueden cambiarla ellos ya que cpe no hay acceso remoto",
    cambiaCliente:
      "• Qué dice el cliente que le sucede: Quiero cambiar la contraseña del WiFi yo mismo\n" +
      "• Pruebas realizadas: Se indica paso a paso al cliente como entrar al router y se le indica que en la pegatina del router estan las credenciales para que ingrese,s e le explica en que pestaña y ya la modifica\n" +
      "• Diagnóstico: Requería cambio de clave\n" +
      "• Solución: Se le indica al cliente que en la pegatina del router estan las credenciales para que ingrese al router, se le explica en que pestaña puede cambiar la contraseña y se le guía para que lo haga él mismo, se comprueba conexión correcta con la nueva clave"

  };

  const plantillaContraseña = estado => baseContraseña() + textosContraseña[estado];

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
        "• Pruebas realizadas: Fuera de umbrales en THOT, reinicio de fábrica y reinicio de parámetros (reinicio de flaps, reinicio de cablemodem y reinicio de snmp) sin mejora\n" +
        "• Diagnóstico: posible daño en nodo o cpe\n" +
        "• Solución: Se envía contrata para revisión y posible cambio de cpe"
    },
    FTTH: {
      resuelto:
        "• Pruebas realizadas: Se revisa en Schaman parámetros fuera de umbrales, se hace reinicio de fábrica, separación de bandas, ya no sale fuera de umbrales\n" +
        "• Diagnóstico: Saturación del router\n" +
        "• Solución: Se deja Se valdia conexion con el cliente que el internet ya no tiene cortes ni lentitud ni parámetros fuera de umbral",
      no:
        "• Pruebas realizadas: Se revisa en Schaman parámetros fuera de umbrales, se hace reinicio de fábrica, separación de bandas, sigue saliendo fuera de umbrales\n" +
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
      "• Solución: Se deja conexión estable y se comprueba con el cliente que el internet ya funciona correctamente",
    no:
      "• Pruebas realizadas: CPE incomunicado por ip en Schaman, se le hace reinicio de fábrica y sigue sin levantar ip, se revisa el cableado esta bien conectado en el puerto correspondiente \n" +
      "• Diagnóstico: pérdida de ip por posible saturación\n" +
      "• Solución: Se envía contrata para revisión y posible cambio de CPE"
  };

  const plantillaIncomIP = estado => baseIncomIP() + textosIncomIP[estado];

  const baseIncomWarning = () =>
    encabezado() + "• Qué dice el cliente que le sucede: No tengo internet\n";

  const textosIncomWarning = {
    resuelto:
      "• Pruebas realizadas: Se revisa en Schaman que el servicio está en warning, se le hace reinicio de fábrica al router, se ajusta el cableado y se comprueba que el servicio levanta con IP correctamente y ya no aparece en warning\n" +
      "• Diagnóstico: CPE saturado\n" + 
      "• Solución: Se deja conexión estable y se comprueba con el cliente que el internet ya funciona correctamente",
    tecnico:
      "• Pruebas realizadas: Se revisa en Schaman que el servicio está en warning, se le hace reinicio de fábrica al router, se ajusta el cableado y sigue sin levantar ip, se revisa el cableado esta bien conectado en el puerto correspondiente \n" +
      "• Diagnóstico: pérdida de conexión por posible saturación\n" +
      "• Solución: Se envía contrata para revisión y posible cambio de CPE"
  };

  const plantillaIncomWarning = estado => baseIncomWarning() + textosIncomWarning[estado];

  // =========================
  // MANDO TV
  // =========================

  const baseMando = () =>
    encabezado() 

  const textosMando = {
    mandoEmpareja:
      "• Qué dice el cliente que le sucede: El mando no funciona\n" +
      "• Pruebas realizadas: Se hacen flujos de Schaman emparejamiento nuevamente desde el menú de configuración en accesorios, cambio de pilas, mando ya funciona correctamente\n" +
      "• Diagnóstico: desconfiguración\n" +
      "• Solución: Se deja emparejamiento del mando con el deco de manera corecta y se comprueba que responde a órdenes",
    mandoNoEmpareja:
      "• Qué dice el cliente que le sucede: El mando no funciona\n" +
      "• Pruebas realizadas: mando sin luces, no empareja al decodificador\n" +
      "• Diagnóstico: Mando defectuoso\n" +
      "• Solución: Se escala a NV2 para cambio",
    mandoRoto:
      "• Qué dice el cliente que le sucede: El mando se me rompió\n" +
      "• Pruebas realizadas: Mando totalmente dañado no da señal de absolutamente nada se procede a escalar para cambio\n" +
      "• Diagnóstico: Mando totalmente roto\n" +
      "• Solución: Se escala a NV2 para cambio de mando"
  };

  const plantillaMando = estado => baseMando() + textosMando[estado];

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

  const baseTecnico = () => encabezado();

  const textosTecnico = {
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

  const plantillaTecnico = estado =>
    baseTecnico() + textosTecnico[estado];

  // =========================
  // NO ACCESO INTERNET - IMPAGO
  // =========================

  const baseNoAccesoImpago = () =>
    encabezado() + "• Qué dice el cliente que le sucede: No tengo acceso a internet\n";

  const textosNoAccesoImpago = {
    impago:
      "• Pruebas realizadas: Se valida en Schaman que el servicio está congelado por impago, se verifica en BO Web esta frozen\n" +
      "• Diagnóstico: No hay fibra por impago del cliente\n" +
      "• Solución: Se envía a servicio al cliente para validar si pagó y descongelen el servicio"
  };

  const plantillaNoAccesoImpago = () => baseNoAccesoImpago() + textosNoAccesoImpago.impago;

  // =========================
  // ERROR 106 - TV
  // =========================

  const base106 = () =>
    encabezado() +
    "• Qué dice el cliente que le sucede: Me sale error 106\n";

  const textos106 = {
    resuelto:
      "• Pruebas realizadas: Se revisa la MAC del deco, es la misma registrada en el sistema, se realiza reinicio de fábrica y el error se resuelve\n" +
      "• Diagnóstico: Desconfiguración del deco\n" +
      "• Solución: Se realiza reinicio de fábrica y se verifica que el error ya no aparece",
    nv2:
      "• Pruebas realizadas: Se revisa la MAC del deco, no es la misma registrada en el sistema\n" +
      "• Diagnóstico: MAC diferente, posible cambio de decodificador y nuevo MAC\n" +
      "• Solución: Se escala a NV2 para revisión y validación de equipamiento"
  };

  const plantilla106 = estado => base106() + textos106[estado];

  // =========================
  // MIGRACIONES
  // =========================

  const basesMigracion = () =>
    encabezado();

  const textosMigracion = {
    sinNotas:
      "• Qué dice el cliente que le sucede: Quiero migrar a fibra óptica\n" +
      "• Pruebas realizadas: Se accede al expediente técnico y no hay notas del técnico anterior\n" +
      "• Diagnóstico: No hay información técnica disponible\n" +
      "• Solución: Se requiere levantar nueva visita técnica para evaluar viabilidad de la migración",
    conNotas:
      "• Qué dice el cliente que le sucede: Solicita migración de HFC a fibra óptica\n" +
      "• Pruebas realizadas: Se revisa expediente técnico y se valida que se pueden realizar el proceso, se prepara plantilla de migración\n" +
      "• Diagnóstico: Migración es viable\n" +
      "• Solución: Se envía en plantilla de migraciones y se le informa al cliente que lo van a llamar para refirmar el contrato con el mismo precio y la nueva tecnología"
  };

  const plantillaMigracion = estado => basesMigracion() + textosMigracion[estado];

  const baseLlamadaOtros = () =>
    encabezado();

  const textosLlamadaOtros = {
    factura:  
      "• Qué dice el cliente que le sucede: Mi llamada no es por el internet es por la factura\n" +
      "• Pruebas realizadas: Ninguna, cliente no indica gestión para la fibra solo quiere saber sobre su factura\n" +
      "• Diagnóstico: Llamada sin motivo de fallos en la fibra\n" +
      "• Solución: Se revisa desde impersonar y se le explica, igualmente se le indica al cliente que para temas de facturación debe llamar a servicio al cliente, se pasa a servicio al cliente para que le den la información que requiere sobre su factura",
    datosMoviles:
      "• Qué dice el cliente que le sucede: Mi llamada no es por el internet es por los datos móviles de mi movil\n" +
      "• Pruebas realizadas: Ninguna, cliente no indica gestión para la fibra solo quiere saber sobre sus datos móviles\n" +
      "• Diagnóstico: Llamada sin motivo de fallos en la fibra\n" +
      "• Solución: Se le indica al cliente que para temas de datos móviles debe llamar a servicio al cliente, se pasa a servicio al cliente para que le den la información que requiere sobre sus datos móviles"
    
  };    

  const plantillaLlamadaOtros = estado =>
    baseLlamadaOtros() + textosLlamadaOtros[estado];  

  const baseLlamadanovalida = () =>
    encabezado();

  const textosLlamadaNoValida = { 
    noValidaCuelga:
      "• Qué dice el cliente que le sucede: no dice nada\n" +
      "• Pruebas realizadas: Ninguna, cliente cuelga la llamada no se puede gestionar\n" +
      "• Diagnóstico: Llamada no válida\n" +
      "• Solución: Se tipifica como llamada no válida y se cierra el caso sin gestión",
    noValidaFicha:
      "• Qué dice el cliente que le sucede: indica mal el DNI\n" +
      "• Pruebas realizadas: Ninguna, cliente indico DNI incorrecto para la gestión\n" +
      "• Diagnóstico: Ficha no válida\n" +
      "• Solución: Se tipifica como ficha no válida y se cierra para abrir una nueva con DNI correcto para su gestión",
    noValidaSinDNI: 
      "• Qué dice el cliente que le sucede: no indica DNI\n" +
      "• Pruebas realizadas: Ninguna, cliente no indica DNI para la gestión\n" +
      "• Diagnóstico: Ficha sin DNI\n" +
      "• Solución: Se tipifica como ficha sin DNI y se cierra llamada ya que no tiene DNI para gestionar el caso, se le indica al cliente que vuelva a llamar con su DNI para poder gestionar su caso"
  };  

  const plantillaLlamadanovalida = estado =>
    baseLlamadanovalida() + textosLlamadaNoValida[estado];


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
    contraseña: {
      resuelto: () => plantillaContraseña("resuelto"),
      nv2: () => plantillaContraseña("nv2"),
      cambiaCliente: () => plantillaContraseña("cambiaCliente")
    },
    mando: {
      resuelto: () => plantillaMando("mandoEmpareja"),
      no: () => plantillaMando("mandoNoEmpareja"),
      roto: () => plantillaMando("mandoRoto")
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
    incomwarning: {
      resuelto: () => plantillaIncomIP("resuelto"),
      tecnico: () => plantillaIncomTotal()
    },
    error101: {
      informacion: () => plantilla101("informacion"),
      nv2: () => plantilla101("nv2")
    },
    tecnico: {
      esperaCita: () => plantillaTecnico("esperaCita"),
      incumplimiento: () => plantillaTecnico("incumplimiento")
    },
    noAccesoImpago: {
      impago: () => plantillaNoAccesoImpago()
    },
    error106: {
      resuelto: () => plantilla106("resuelto"),
      nv2: () => plantilla106("nv2")
    },
    migracion: {
      sinNotas: () => plantillaMigracion("sinNotas"),
      conNotas: () => plantillaMigracion("conNotas")
    },
    llamadaNoValida: {  
      noValidaCuelga: () => plantillaLlamadanovalida("noValidaCuelga"),
      noValidaFicha: () => plantillaLlamadanovalida("noValidaFicha"),
      noValidaSinDNI: () => plantillaLlamadanovalida("noValidaSinDNI")
    },
    llamadaOtros: {
      factura: () => plantillaLlamadaOtros("factura"),
      datosMoviles: () => plantillaLlamadaOtros("datosMoviles")
    }
  };

  // =========================
  // AVISOS / INFO POR PLANTILLA
  // =========================

  const crearMensajes = (infoTexto, avisoTexto, avisoTitulo = "Aviso") => ({
    info: {
      tipo: "info",
      titulo: "Info",
      texto: infoTexto
    },
    aviso: {
      tipo: "warning",
      titulo: avisoTitulo,
      texto: avisoTexto
    }
  });

  const avisosPlantillas = {
    "plantillaOriginal.normal": crearMensajes(
      "Plantilla limpia para consultas generales.",
      "No dejes campos en blanco, completa la información de la llamada."
    ),
    "incomTotal.tecnico": crearMensajes(
      "Usa esta opción cuando el cliente se queda sin internet por completo.",
      "Confirma tecnología, luces del equipo y cableado antes de enviar contrata."
    ),
    "cortes.resuelto": crearMensajes(
      "Plantilla para cortes resueltos tras reinicio, ajuste de bandas y validación final.",
      "Anota que el cliente confirmó estabilidad antes de cerrar."
    ),
    "cortes.tecnico": crearMensajes(
      "Úsala cuando los cortes persisten y necesitas enviar técnico.",
      "Deja claro que los cortes continúan tras las pruebas realizadas."
    ),
    "cortes.nv2": crearMensajes(
      "Úsala cuando los cortes siguen y se debe escalar a NV2.",
      "Incluye evidencia de cortes persistentes y pruebas ya aplicadas."
    ),
    "lentitud.resuelto": crearMensajes(
      "Plantilla para lentitud resuelta tras reinicio, separación de bandas y test correcto.",
      "No olvides verificar y anotar la velocidad obtenida en el test.",
      "Importante"
    ),
    "lentitud.tecnico": crearMensajes(
      "Plantilla para lentitud que persiste y requiere envío de técnico.",
      "No olvides verificar y anotar la velocidad obtenida en el test.",
      "Importante"
    ),
    "lentitud.nv2": crearMensajes(
      "Plantilla para lentitud persistente que debe revisarse por NV2.",
      "No olvides verificar y anotar la velocidad obtenida en el test.",
      "Importante"
    ),
    "contraseña.resuelto": crearMensajes(
      "Se cambia la contraseña del WiFi y se comprueba conexión correcta.",
      "Confirma que el cliente ya conecta con la nueva contraseña."
    ),
    "contraseña.nv2": crearMensajes(
      "Se usa cuando no se puede acceder al router y toca escalar.",
      "Indica que no hubo acceso remoto al CPE antes de escalar."
    ),
    "contraseña.cambiaCliente": crearMensajes(
      "Se le enseña al cliente a entrar al router y cambiar la clave por su cuenta.",
      "Confirma que el cliente entendió los pasos y pudo conectar."
    ),
    "masiva.informacion": crearMensajes(
      "Se informa al cliente sobre la avería masiva y se le pide esperar.",
      "No crees visita individual si la masiva sigue activa."
    ),
    "masiva.ticket": crearMensajes(
      "Se informa sobre la masiva, tiempos aproximados y posible bono de datos.",
      "Confirma que el ticket quedó creado y el cliente fue informado."
    ),
    "fuera.resuelto": crearMensajes(
      "Se corrigen parámetros fuera de umbral y se valida que ya quedó estable.",
      "Verifica que los parámetros ya no aparecen fuera de umbral antes de cerrar."
    ),
    "fuera.no": crearMensajes(
      "Úsala cuando persisten los parámetros fuera de umbral y hay que enviar técnico.",
      "Incluye que el reinicio y ajuste de parámetros no corrigieron el fallo."
    ),
    "bandas.separar": crearMensajes(
      "Se separan 2.4 GHz y 5 GHz para dejar las redes por separado.",
      "Confirma con el cliente el nombre de las redes y conexión final."
    ),
    "incomIP.resuelto": crearMensajes(
      "Se levanta la IP correctamente tras reinicio y ajuste de cableado.",
      "Comprueba navegación antes de cerrar la gestión."
    ),
    "incomIP.no": crearMensajes(
      "Se usa cuando sigue sin levantar IP y toca enviar contrata.",
      "Deja registrado que el CPE no levanta IP tras reinicio y revisión de cableado."
    ),
    "incomwarning.resuelto": crearMensajes(
      "Se usa cuando el servicio aparece en warning y queda resuelto tras reinicio, cableado y validación de IP.",
      "Confirma que ya no aparece warning y que navega correctamente."
    ),
    "incomwarning.tecnico": crearMensajes(
      "Se usa cuando el servicio sigue en warning y se requiere enviar contrata o escalar la revisión.",
      "Registra que el warning persiste tras las pruebas."
    ),
    "tecnico.esperaCita": crearMensajes(
      "La cita sigue dentro de la franja horaria y todavía no hay incumplimiento.",
      "No reportes incumplimiento si la franja de cita no ha terminado."
    ),
    "tecnico.incumplimiento": crearMensajes(
      "Se usa cuando el técnico ya incumplió la visita.",
      "Valida fecha y franja exacta antes de reportar al técnico."
    ),
    "noAccesoImpago.impago": crearMensajes(
      "Se usa cuando el servicio aparece congelado por impago.",
      "Derivar a Servicio al Cliente para validar pago y descongelación."
    ),
    "llamadaNoValida.noValidaCuelga": crearMensajes(
      "Se tipifica como llamada no válida porque el cliente cuelga.",
      "Asegúrate de que no hubo gestión posible antes de cerrar."
    ),
    "llamadaNoValida.noValidaFicha": crearMensajes(
      "Se tipifica como ficha no válida porque el DNI fue incorrecto.",
      "Indica que se debe abrir una nueva ficha con el DNI correcto."
    ),
    "llamadaNoValida.noValidaSinDNI": crearMensajes(
      "Se cierra porque el cliente no dio DNI para gestionar.",
      "Recuerda pedir al cliente que vuelva a llamar con el DNI."
    ),
    "llamadaOtros.factura": crearMensajes(
      "Se usa cuando la llamada no corresponde a fibra y el cliente consulta sobre facturación.",
      "Deriva a Servicio al Cliente si necesita gestión de factura."
    ),
    "llamadaOtros.datosMoviles": crearMensajes(
      "Se usa cuando la llamada no corresponde a fibra y el cliente consulta sobre datos móviles.",
      "Deriva a Servicio al Cliente si necesita gestión de línea móvil."
    ),
    "mando.resuelto": crearMensajes(
      "Se empareja el mando, se cambian pilas y se valida funcionamiento.",
      "Confirma que el mando responde a órdenes antes de cerrar."
    ),
    "mando.no": crearMensajes(
      "Se usa cuando el mando no responde y toca escalar por fallo.",
      "Anota si no tiene luces, no empareja o no responde."
    ),
    "tv.canal": crearMensajes(
      "Se indica al cliente cuál es el canal que no localiza.",
      "Confirma que el cliente ya ve el canal indicado."
    ),
    "tv.deportivos": crearMensajes(
      "Se reinicia el deco y se revisa la lista completa de canales deportivos.",
      "Valida que los canales deportivos aparezcan después de reconfigurar."
    ),
    "error101.informacion": crearMensajes(
      "Se usa cuando el deco aún no cumplió el tiempo de activación.",
      "Confirma si ya pasaron o no las 48 horas antes de escalar."
    ),
    "error101.nv2": crearMensajes(
      "Se usa cuando ya pasaron las 48 horas y toca escalar por MAC diferente.",
      "Incluye la MAC validada y que el equipo figura entregado."
    ),
    "error106.resuelto": crearMensajes(
      "Se resuelve con reinicio de fábrica y validación de MAC correcta.",
      "Confirma que la MAC coincide y el error ya no aparece."
    ),
    "error106.nv2": crearMensajes(
      "Se usa cuando la MAC no coincide y hay que escalar.",
      "Adjunta o anota la MAC que ve el cliente y la registrada."
    ),
    "migracion.sinNotas": crearMensajes(
      "No hay notas técnicas y se debe levantar nueva visita.",
      "No confirmes viabilidad sin notas o validación técnica."
    ),
    "migracion.conNotas": crearMensajes(
      "La migración es viable y se informa al cliente que lo llamarán para refirmar.",
      "Confirma que se mantiene precio y que se requiere refirma."
    )
  };

  const infoPlantillaDefault = {
    tipo: "info",
    titulo: "Info",
    texto: "Información rápida sobre cuándo usar esta plantilla."
  };

  const avisoPlantillaDefault = {
    tipo: "warning",
    titulo: "Aviso",
    texto: "Plantilla copiada. Revisa que los datos del cliente y la gestión realizada coincidan antes de cerrar."
  };

  const obtenerInfoPlantilla = option =>
    avisosPlantillas[option]?.info || infoPlantillaDefault;

  const obtenerAvisoPostCopia = option =>
    avisosPlantillas[option]?.aviso || avisoPlantillaDefault;

  // =========================
  // TOASTS BONITOS
  // =========================

  const mostrarAviso = (titulo, texto, tipo = "warning") => {
    const estilos = {
      warning: {
        fondo: "linear-gradient(135deg, #2d1a3a, #7b2cbf)",
        borde: "rgba(199, 125, 255, 0.45)",
        icono: "fa-triangle-exclamation",
        posicion: "center"
      },
      info: {
        fondo: "linear-gradient(135deg, #1e1b4b, #7c3aed)",
        borde: "rgba(199, 125, 255, 0.45)",
        icono: "fa-circle-info",
        posicion: "top-right"
      }
    };

    const e = estilos[tipo] || estilos.warning;

    const t = document.createElement("div");
    t.style = `
      position: fixed;
      ${e.posicion === "center" ? "top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.96);" : "top: 20px; right: 20px; transform: translateY(-12px);"}
      background: ${e.fondo};
      color: white;
      padding: 14px 18px;
      border-radius: 14px;
      font-family: 'Segoe UI', Arial, sans-serif;
      z-index: 999999999;
      opacity: 0;
      transition: opacity .25s ease, transform .25s ease;
      box-shadow: 0 12px 35px rgba(0,0,0,0.25), 0 0 30px ${e.borde};
      max-width: 360px;
      border: 1px solid ${e.borde};
    `;

    t.innerHTML = `
      <strong style="display:block; margin-bottom:6px; color:#fff5d6; font-size:13px">
        <i class="fa-solid ${e.icono}" style="margin-right:8px"></i>${titulo}
      </strong>
      <span style="font-size:12px;line-height:1.5;">${texto}</span>
    `;

    document.body.appendChild(t);

    setTimeout(() => {
      t.style.opacity = "1";
      if (e.posicion === "center") {
        t.style.transform = "translate(-50%, -50%) scale(1)";
      } else {
        t.style.transform = "translateY(0)";
      }
    }, 10);

    setTimeout(() => {
      t.style.opacity = "0";
      if (e.posicion === "center") {
        t.style.transform = "translate(-50%, -50%) scale(0.96)";
      } else {
        t.style.transform = "translateY(-12px)";
      }
      setTimeout(() => t.remove(), 250);
    }, 2600);
  };

  // =========================
  // BOTÓN INFO CON DROP INLINE
  // =========================

  const cerrarDropsInfo = () => {
    document.querySelectorAll(".dropInfo").forEach(d => d.remove());
  };

const inyectarBotonesInfoDuplicado = () => {
  const botones = Array.from(document.querySelectorAll(".btnMenu"));

  botones.forEach(btn => {
    if (btn.dataset.infoProcesado === "1") return;
    btn.dataset.infoProcesado = "1";

    const opt = btn.getAttribute("data-opt");
    const info = obtenerInfoPlantilla(opt);

    const fila = document.createElement("div");
    fila.className = "filaAccion";

    btn.parentNode.insertBefore(fila, btn);
    fila.appendChild(btn);

    const infoWrap = document.createElement("div");
    infoWrap.className = "infoWrap";
    infoWrap.innerHTML = `
      <button type="button" class="btnInfo" aria-label="Ver información">
        <i class="fa-solid fa-circle-info"></i>
      </button>
      <div class="dropInfo">
        <div class="dropInfoTitulo">
          <i class="fa-solid fa-circle-info"></i>
          ${info.titulo}
        </div>
        <div class="dropInfoTexto">${info.texto}</div>
      </div>
    `;

    fila.appendChild(infoWrap);
  });
};

// =========================
// MENÚ COMPLETO
// =========================

if (document.getElementById("menuCopi")) {
  return;
}

const inyectarBotonesInfo = () => {
  const botones = Array.from(document.querySelectorAll(".btnMenu"));
  let timeoutCerrarDrop;

  const mostrarDropInfo = (btn, aviso) => {
    clearTimeout(timeoutCerrarDrop);
    cerrarDropsInfo();

    const drop = document.createElement("div");
    drop.className = "dropInfo dropInfoPortal";
    drop.innerHTML = `
      <div class="dropInfoTitulo">
        <i class="fa-solid ${aviso.tipo === "warning" ? "fa-triangle-exclamation" : "fa-circle-info"}"></i>
        ${aviso.titulo}
      </div>
      <div class="dropInfoTexto">${aviso.texto}</div>
    `;

    document.body.appendChild(drop);

    const rect = btn.getBoundingClientRect();
    const abrirIzquierda = rect.right + 10 + drop.offsetWidth > window.innerWidth;
    const left = abrirIzquierda
      ? rect.left - drop.offsetWidth - 10
      : rect.right + 10;
    const minY = drop.offsetHeight / 2 + 10;
    const maxY = window.innerHeight - drop.offsetHeight / 2 - 10;
    const top = Math.max(minY, Math.min(rect.top + rect.height / 2, maxY));

    drop.style.setProperty("left", `${Math.max(10, left)}px`, "important");
    drop.style.setProperty("top", `${top}px`, "important");
    drop.addEventListener("mouseenter", () => clearTimeout(timeoutCerrarDrop));
    drop.addEventListener("mouseleave", () => cerrarDropsInfo());
    requestAnimationFrame(() => drop.classList.add("dropInfoVisible"));
  };

  const programarCierreDrop = () => {
    clearTimeout(timeoutCerrarDrop);
    timeoutCerrarDrop = setTimeout(cerrarDropsInfo, 120);
  };

  botones.forEach(btn => {
    if (btn.dataset.infoProcesado === "1") return;
    btn.dataset.infoProcesado = "1";

    const opt = btn.getAttribute("data-opt");
    const info = obtenerInfoPlantilla(opt);

    const fila = document.createElement("div");
    fila.className = "filaAccion";

    btn.parentNode.insertBefore(fila, btn);
    fila.appendChild(btn);

    const infoWrap = document.createElement("div");
    infoWrap.className = "infoWrap";
    infoWrap.innerHTML = `
      <button type="button" class="btnInfo" aria-label="Ver información">
        <i class="fa-solid fa-circle-info"></i>
      </button>
    `;

    fila.appendChild(infoWrap);

    const btnInfo = infoWrap.querySelector(".btnInfo");
    btnInfo.addEventListener("mouseenter", () => mostrarDropInfo(btnInfo, info));
    btnInfo.addEventListener("focus", () => mostrarDropInfo(btnInfo, info));
    btnInfo.addEventListener("click", e => {
      e.stopPropagation();
      mostrarDropInfo(btnInfo, info);
    });
    infoWrap.addEventListener("mouseleave", programarCierreDrop);
    btnInfo.addEventListener("blur", programarCierreDrop);
  });

  document.addEventListener("scroll", cerrarDropsInfo, true);
  window.addEventListener("resize", cerrarDropsInfo);
};

const menu = document.createElement("div");
menu.innerHTML = `
  <div id="menuCopi" style="
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    padding: 12px !important;
    border-radius: 18px !important;
    box-shadow: 0 0 40px rgba(128,0,255,0.4), 0 0 60px rgba(199,125,255,0.2) !important;
    z-index: 999999 !important;
    width: min(320px, 65vw) !important;
    max-height: 88vh !important;
    overflow-y: auto !important;
    font-family: 'Segoe UI', Arial, sans-serif !important;
    font-size: 13px !important;
    text-align: left !important;
    background: linear-gradient(135deg, #1a0f1f 0%, #2d1a3a 100%) !important;
    color:white !important;
    border: 2px solid #7b2cbf !important;
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
      font-size:16px !important;
      margin-bottom:8px !important;
    "></i>Generador de Plantillas</h2>

    <p style="
      text-align:center !important;
      margin-top:-4px !important;
      color:#a89cc9 !important;
      font-size:11px !important;
      font-weight:500 !important;
    ">Elige la categoría y tipificación</p>

    <!-- INTERNET -->
    <div class="grupo">
      <div class="tituloGrupo abierto">
        <i class="fa-solid fa-wifi"></i> Internet / WiFi
        <i class="fa-solid fa-chevron-down" style="float:right;margin-left:auto;"></i>
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
          Contraseña
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="contraseña.resuelto" class="btnMenu">Cambio de Contraseña</button>
          <button data-opt="contraseña.nv2" class="btnMenu">Escalar a NV2</button>
          <button data-opt="contraseña.cambiaCliente" class="btnMenu">Cambiada por Cliente</button>
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
          Incomunicado Warning
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="incomwarning.resuelto" class="btnMenu">Resuelto</button>
          <button data-opt="incomwarning.tecnico" class="btnMenu">Envío de técnico</button>
        </div>

        <div class="subtituloGrupo">
          Técnico
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="tecnico.esperaCita" class="btnMenu">Aún en tiempo de cita</button>
          <button data-opt="tecnico.incumplimiento" class="btnMenu">Técnico incumplió</button>
        </div>

        <div class="subtituloGrupo">
          Sin Acceso - Impago
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="noAccesoImpago.impago" class="btnMenu">Servicio Congelado</button>
        </div>

        <div class="subtituloGrupo">
          Llamada No Válida
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="llamadaNoValida.noValidaCuelga" class="btnMenu">Llamada Cuelga</button>
          <button data-opt="llamadaNoValida.noValidaFicha" class="btnMenu">Ficha No Válida</button>
          <button data-opt="llamadaNoValida.noValidaSinDNI" class="btnMenu">Sin DNI</button>
        </div>

        <div class="subtituloGrupo">
          Llamada Otros Motivos
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="llamadaOtros.factura" class="btnMenu">Consulta sobre Factura</button>
          <button data-opt="llamadaOtros.datosMoviles" class="btnMenu">Consulta sobre Datos Móviles</button>
        </div>

        <div class="subtituloGrupo">
          Migraciones
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="migracion.sinNotas" class="btnMenu">Sin Notas Técnicas</button>
          <button data-opt="migracion.conNotas" class="btnMenu">Migración Viable</button>
        </div>

      </div>
    </div>

    <!-- TV -->
    <div class="grupo">
      <div class="tituloGrupo">
        <i class="fa-solid fa-tv"></i> Televisión
        <i class="fa-solid fa-chevron-down" style="float:right;margin-left:auto;"></i>
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

        <div class="subtituloGrupo">
          Error 106
          <i class="fa-solid fa-chevron-down" style="float:right;"></i>
        </div>
        <div class="subcontenidoGrupo">
          <button data-opt="error106.resuelto" class="btnMenu">Resuelto con Reinicio</button>
          <button data-opt="error106.nv2" class="btnMenu">Escalar a NV2</button>
        </div>
      </div>
    </div>

    <style>
      #menuCopi::-webkit-scrollbar {
        width: 10px;
      }
      #menuCopi::-webkit-scrollbar-track {
        background: rgba(106, 39, 176, 0.1);
        border-radius: 10px;
      }
      #menuCopi::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #9d4edd, #c77dff);
        border-radius: 10px;
      }
      #menuCopi::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #c77dff, #e0aaff);
      }

      .filaAccion {
        display: flex !important;
        gap: 6px !important;
        margin: 3px 0 !important;
        align-items: center !important;
      }

      .filaAccion .btnMenu {
        flex: 1 !important;
        margin: 0 !important;
      }

      .infoWrap {
        position: relative !important;
        flex: 0 0 34px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .btnInfo {
        width: 34px !important;
        height: 34px !important;
        min-width: 34px !important;
        border-radius: 8px !important;
        border: 1px solid rgba(199,125,255,.35) !important;
        background: rgba(124,58,237,.25) !important;
        color: #fff !important;
        cursor: pointer !important;
        transition: .2s !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .btnInfo:hover {
        background: rgba(124,58,237,.5) !important;
        transform: translateY(-1px) !important;
      }

      .btnInfo i {
        font-size: 14px !important;
      }

      .dropInfo {
        position: absolute !important;
        left: calc(100% + 10px) !important;
        top: 50% !important;
        transform: translateY(-50%) translateX(-8px) !important;
        width: 250px !important;
        background: linear-gradient(135deg, #1e1b4b, #7c3aed) !important;
        color: white !important;
        border-radius: 12px !important;
        padding: 12px 14px !important;
        box-shadow: 0 12px 35px rgba(0,0,0,0.25), 0 0 30px rgba(199,125,255,0.25) !important;
        border: 1px solid rgba(199,125,255,0.45) !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        transition: opacity .2s ease, transform .2s ease, visibility .2s ease !important;
        z-index: 9999999 !important;
      }

      .dropInfoPortal {
        position: fixed !important;
        visibility: visible !important;
        pointer-events: auto !important;
        z-index: 999999999 !important;
      }

      .dropInfoPortal.dropInfoVisible {
        opacity: 1 !important;
        transform: translateY(-50%) translateX(0) !important;
      }

      .infoWrap:hover .dropInfo,
      .infoWrap:focus-within .dropInfo {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        transform: translateY(-50%) translateX(0) !important;
      }

      .dropInfoTitulo {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        margin-bottom: 6px !important;
        color: #fff5d6 !important;
      }

      .dropInfoTexto {
        font-size: 12px !important;
        line-height: 1.5 !important;
        color: #f4ecff !important;
      }

      .btnMenu {
        width: 100% !important;
        padding: 8px 12px !important;
        border-radius: 8px !important;
        border: 1px solid rgba(199, 125, 255, 0.3) !important;
        color: white !important;
        background: linear-gradient(135deg, #7b2cbf, #9d4edd) !important;
        cursor: pointer !important;
        transition: .2s !important;
        font-size: 12px !important;
        font-weight: 500 !important;
      }

      .btnMenu:hover {
        background: linear-gradient(135deg, #9d4edd, #c77dff) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(199, 125, 255, 0.3) !important;
      }

      .tituloGrupo {
        padding: 10px 12px !important;
        background: linear-gradient(135deg, #2d1a3a, #3b2250) !important;
        border-radius: 10px !important;
        margin-top: 8px !important;
        cursor: pointer !important;
        font-weight: 600 !important;
        font-size: 13px !important;
        border: 1.5px solid #7b2cbf !important;
        transition: .2s !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      .tituloGrupo:hover {
        background: linear-gradient(135deg, #3b2250, #4a2e5f) !important;
        border-color: #9d4edd !important;
        transform: translateX(2px) !important;
      }

      .tituloGrupo i:first-child {
        color: #c77dff !important;
        min-width: 20px !important;
      }

      .subtituloGrupo {
        padding: 6px 10px !important;
        background: rgba(45, 26, 58, 0.7) !important;
        border-radius: 8px !important;
        margin-top: 4px !important;
        cursor: pointer !important;
        font-size: 12px !important;
        border: 1px solid #9d4edd !important;
        transition: .15s !important;
        font-weight: 500 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
      }

      .subtituloGrupo:hover {
        background: rgba(61, 34, 80, 0.9) !important;
        border-color: #c77dff !important;
      }

      .subcontenidoGrupo {
        display: none;
        margin-left: 6px !important;
        margin-top: 3px !important;
        padding: 6px 0 6px 6px !important;
        border-left: 3px solid #c77dff !important;
        margin-bottom: 6px !important;
      }

      .tituloGrupo i, .subtituloGrupo i {
        pointer-events: none !important;
      }
    </style>
  </div>
`;

document.body.appendChild(menu);
inyectarBotonesInfo();

// =========================
// SUBMENÚS
// =========================

menu.querySelectorAll(".subtituloGrupo").forEach(sub => {
  sub.addEventListener("click", () => {
    const cont = sub.nextElementSibling;
    cont.style.display = cont.style.display === "block" ? "none" : "block";
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

      if (texto instanceof Promise) {
        texto = await texto;
      }

      copiar(texto);

      const nombrePlantilla = btn.textContent.trim() || option;

      mostrarToast(`Plantilla copiada: ${nombrePlantilla}`);

      const aviso = obtenerAvisoPostCopia(option);

      setTimeout(() => {
        mostrarAviso(aviso.titulo, aviso.texto, aviso.tipo);
      }, 150);

      menu.remove();
    } else {
      mostrarAviso("Error", "Plantilla no encontrada", "warning");
    }
  });
});

// =========================
// CERRAR MENÚ
// =========================

menu.querySelector("#cerrarMenu").addEventListener("click", () => {
  menu.remove();
});
})();
