javascript:(() => {
  /* ================= FONT AWESOME ================= */
  if (!document.querySelector('link[data-fa]')) {
    const fa = document.createElement("link");
    fa.rel = "stylesheet";
    fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
    fa.dataset.fa = "true";
    document.head.appendChild(fa);
  }

  /* ================= ESTILOS ================= */
  if (!document.getElementById("toast-styles")) {
    const style = document.createElement("style");
    style.id = "toast-styles";
    style.innerHTML = `
      @keyframes slideIn {
        0% { transform: translateX(120%) scale(0.9); opacity: 0; }
        70% { transform: translateX(-10px) scale(1.02); opacity: 1; }
        100% { transform: translateX(0) scale(1); }
      }
      .toast-animado {
        animation: slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
    `;
    document.head.appendChild(style);
  }

  /* ================= UTILIDADES ================= */
  const xp = x => document.evaluate(x, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  const wait = t => new Promise(r => setTimeout(r, t));

  const fmt = d => {
    const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${String(d.getDate()).padStart(2, "0")}/${m[d.getMonth()]}/${String(d.getFullYear()).slice(2)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const nextLab = d => {
    if (d.getDay() === 5) d.setDate(d.getDate() + 3);
    else if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    else d.setDate(d.getDate() + 1);
    return d;
  };

  function setNativeValue(input, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    const prototype = Object.getPrototypeOf(input);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(input, value);
    } else if (valueSetter) {
      valueSetter.call(input, value);
    } else {
      input.value = value;
    }
  }

  /* ================= LOADER ================= */
  function loaderShow() {
    if (document.getElementById("loader")) return;

    const l = document.createElement("div");
    l.id = "loader";
    Object.assign(l.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "300px",
      background: "rgba(42,0,63,.95)",
      color: "#fff",
      padding: "16px",
      borderRadius: "14px",
      fontFamily: "Segoe UI,sans-serif",
      fontSize: "13px",
      zIndex: 999999,
      boxShadow: "0 8px 20px rgba(0,0,0,.5)"
    });

    l.innerHTML = `
      <div id="ltext" style="margin-bottom:10px;font-weight:600">
        <i class="fa-solid fa-spinner fa-spin"></i> Iniciando…
      </div>
      <div style="height:8px;background:#ffffff30;border-radius:6px;overflow:hidden">
        <div id="lbar" style="height:100%;width:0%;background:#9b4dff;transition:width .2s"></div>
      </div>`;
    document.body.appendChild(l);
  }

  const loader = p => {
    const b = document.getElementById("lbar");
    if (b) b.style.width = p + "%";
  };

  const loaderText = t => {
    const lt = document.getElementById("ltext");
    if (lt) lt.innerHTML = t;
  };

  const loaderHide = () => {
    const l = document.getElementById("loader");
    if (l) l.remove();
  };

  /* ================= TOAST ================= */
  function toastOK(sel) {
    const t = document.createElement("div");
    t.className = "toast-animado";
    Object.assign(t.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "linear-gradient(135deg, #2a003f 0%, #150022 100%)",
      color: "#f6f0ff",
      padding: "16px 20px",
      borderRadius: "14px",
      fontFamily: "Segoe UI,sans-serif",
      fontSize: "13.5px",
      zIndex: 999999,
      boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
      maxWidth: "380px",
      borderLeft: "5px solid #9b4dff"
    });

    t.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <div style="background:#420066;padding:8px 10px;border-radius:50%">
          <i class="fa-solid fa-circle-check" style="color:#c58cff;font-size:18px"></i>
        </div>
        <div>
          <div style="font-weight:700;color:#fff;margin-bottom:2px;letter-spacing:0.5px">PROCESO EXITOSO</div>
          <div style="color:#dcc7ff;font-size:12px">Se autoseleccionó correctamente:</div>
          <div style="font-weight:600;margin-top:4px;color:#fff;background:#370454;padding:4px 8px;border-radius:6px;font-size:11.5px">${sel}</div>
        </div>
      </div>`;
    document.body.appendChild(t);

    setTimeout(() => {
      t.style.transition = "all 0.4s ease";
      t.style.opacity = "0";
      t.style.transform = "translateX(40px)";
      setTimeout(() => t.remove(), 400);
    }, 6500);
  }

  /* ================= MENÚ ================= */
  function menuAverias(lista) {
    return new Promise(resolve => {
      const filtrada = lista.filter(t => !t.includes("TÉCNICO DIRECTO") && !t.includes("PROBLEMA CONFIGURACIÓN DE RED"));

      const ov = document.createElement("div");
      Object.assign(ov.style, {
        position: "fixed",
        inset: 0,
        background: "rgba(20,10,30,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999
      });

      const box = document.createElement("div");
      Object.assign(box.style, {
        background: "#260038",
        padding: "20px 16px 16px 16px",
        borderRadius: "14px",
        width: "460px",
        color: "#eee",
        fontFamily: "Segoe UI,sans-serif",
        position: "relative",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
      });

      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
      Object.assign(closeBtn.style, {
        position: "absolute",
        top: "10px",
        right: "12px",
        background: "none",
        border: "none",
        color: "#a58cb3",
        cursor: "pointer",
        fontSize: "18px"
      });
      closeBtn.onclick = () => {
        ov.remove();
        resolve(null);
      };
      box.appendChild(closeBtn);

      box.insertAdjacentHTML(
        "beforeend",
        `<div style="text-align:center;font-weight:600;margin-bottom:14px;font-size:14px"><i class="fa-solid fa-list-check"></i> Seleccione Tipo de Avería</div>`
      );

      const grid = document.createElement("div");
      Object.assign(grid.style, {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px"
      });

      filtrada.forEach(t => {
        const b = document.createElement("button");
        let ico = "fa-circle-exclamation";
        if (t.includes("INCOMUNICADO")) ico = "fa-ban";
        if (t.includes("MASIVA")) ico = "fa-tower-broadcast";
        if (t.includes("LENTITUD")) ico = "fa-gauge-high";
        if (t.includes("CORTES")) ico = "fa-plug-circle-xmark";
        if (t.includes("DESPERFECTO")) ico = "fa-screwdriver-wrench";
        if (t.includes("UMBRALES")) ico = "fa-chart-line";

        b.innerHTML = `<i class="fa-solid ${ico}" style="color:#c58cff"></i><span style="margin-left:8px">${t}</span>`;
        Object.assign(b.style, {
          display: "flex",
          alignItems: "center",
          padding: "12px",
          fontSize: "11px",
          background: "#34004d",
          color: "#f6f0ff",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          textAlign: "left",
          transition: "all 0.2s"
        });
        b.onmouseover = () => b.style.background = "#420066";
        b.onmouseout = () => b.style.background = "#34004d";
        b.onclick = () => {
          ov.remove();
          resolve(t);
        };
        grid.appendChild(b);
      });

      box.appendChild(grid);
      ov.appendChild(box);
      document.body.appendChild(ov);
    });
  }

  /* ================= SELECTOR REACT ================= */
  async function selectRSPorTexto(input, textoObjetivo) {
    if (!input || !textoObjetivo) return false;

    const container = input.closest(
      '.atlas-select__control, .css-1et8t39-control, .sr-rs__control, .css-4avucx-control, .css-b4cy4q-control, .css-5a7vsu-container, [class*="-control"]'
    );

    const getSelectionText = () => {
      if (!container) return "";
      const txt = container.textContent || "";
      if (
        txt.includes("Search for an object") ||
        txt.includes("Select...") ||
        txt.includes("Seleccionar cuestionario")
      ) {
        return "";
      }
      return txt.trim();
    };

    if (getSelectionText().toLowerCase() === textoObjetivo.toLowerCase()) {
      return true;
    }

    let intentos = 0;
    while (intentos < 2) {
      input.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      await wait(300);

      setNativeValue(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));

      setNativeValue(input, textoObjetivo);
      input.dispatchEvent(new Event("input", { bubbles: true }));

      await wait(600);

      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, bubbles: true }));
      await wait(400);

      if (getSelectionText().toLowerCase() === textoObjetivo.toLowerCase()) {
        return true;
      }

      intentos++;
      await wait(200);
    }

    return false;
  }

  /* ================= MAIN ================= */
  (async () => {
    try {
      const averias = [
        "INCOMUNICADO TOTAL - PROBLEMA DE SINCRONISMO - NEBAL/FFTH",
        "INCOMUNICADO TOTAL - PROBLEMA SINCRONISMO - HFC",
        "CLIENTE AFECTADO POR AVERÍA MASIVA",
        "RETROPORTABILIDAD",
        "LENTITUD EN LA CONEXIÓN",
        "CORTES EN EL SERVICIO",
        "FUERA DE UMBRALES",
        "NO NAVEGA",
        "INCOMUNICADO TOTAL - NO LEVANTA IP",
        "CPE CON FALLOS EN PUERTOS LAN",
        "DESPERFECTO INTERNO",
        "DESPERFECTO EXTERNO"
      ];

      const sel = await menuAverias(averias);
      if (!sel) return;

      const summaryField = document.getElementById("summary");
      if (summaryField) {
        summaryField.value = sel;
        summaryField.dispatchEvent(new Event("input", { bubbles: true }));
      }

      loaderShow();

      /* PRIORIDAD */
      loaderText("<i class='fa-solid fa-bolt'></i> Configurando Prioridad...");
      loader(15);
      const prioridadInput = document.querySelector(
        '#react-select-customfield_16817-instance-input, input[id*="prioridad"], input[id*="priority"]'
      );
      if (prioridadInput) {
        await selectRSPorTexto(prioridadInput, "1 - Crítico");
      }

      const esMasiva = sel.includes("MASIVA");

      if (!esMasiva) {
        /* GRUPO */
        loaderText("<i class='fa-solid fa-users'></i> Rellenando Grupo... (Campo 16800)");
        loader(35);
        const grupoInput = document.querySelector('[id*="insight-atlas-select-16800"] input, #insight-atlas-select-16800 input');
        if (grupoInput) {
          await selectRSPorTexto(grupoInput, "Envío técnico (Fibra Vodafone)");
          await wait(400);
        }

        /* TIPO */
        loaderText("<i class='fa-solid fa-layer-group'></i> Rellenando Tipo... (Campo 16801)");
        loader(60);
        const tipoInput = document.querySelector('[id*="insight-atlas-select-16801"] input, #insight-atlas-select-16801 input');
        const tipoTexto = sel.includes("DESPERFECTO") ? "Reclamación de Banda Ancha" : "Avería de banda ancha";
        if (tipoInput) {
          await selectRSPorTexto(tipoInput, tipoTexto);
          await wait(400);
        }

        /* SUBTIPO */
        let subtipoTexto = "";
        if (sel.includes("INCOMUNICADO") || sel.includes("PUERTOS LAN")) {
          subtipoTexto = "Net Incomunicado - No Conecta";
        } else if (sel.includes("NO LEVANTA")) {
          subtipoTexto = "Net Mala Calidad - Equipo";
        } else if (sel.includes("LENTITUD") || sel.includes("CORTES")) {
          subtipoTexto = "Net Mala Calidad - Lentitud o Cortes";
        } else if (sel.includes("NO NAVEGA") || sel.includes("UMBRALES")) {
          subtipoTexto = "Net No Navega - Ciertas páginas";
        } else if (sel.includes("DESPERFECTO INTERNO")) {
          subtipoTexto = "Desperfectos en casa del cliente - Interior";
        } else if (sel.includes("DESPERFECTO EXTERNO")) {
          subtipoTexto = "Desperfectos en casa del cliente - Exterior";
        }

        if (subtipoTexto !== "") {
          loaderText("<i class='fa-solid fa-sitemap'></i> Rellenando Subtipo... (Campo 16802)");
          loader(75);
          const subtipoInput = document.querySelector('[id*="insight-atlas-select-16802"] input, #insight-atlas-select-16802 input');
          if (subtipoInput) {
            await selectRSPorTexto(subtipoInput, subtipoTexto);
            await wait(400);
          }
        }
      }

      /* CD1 */
      loaderText("<i class='fa-solid fa-clipboard-question'></i> Configurando CD1...");
      loader(85);
      const cd1Cont = document.getElementById("cd-1");
      if (cd1Cont) {
        const cd1Input = cd1Cont.querySelector('input[type="text"]');
        if (cd1Input) {
          await selectRSPorTexto(cd1Input, "N/A");
        }
      }
      await wait(400);

      /* FECHAS */
      loaderText("<i class='fa-solid fa-calendar-check'></i> Calculando Fechas...");
      loader(95);

      const now = new Date();
      const f1 = xp('//*[@id="customfield_16825"]');
      const f2 = xp('//*[@id="customfield_16823"]');
      const f3 = xp('//*[@id="customfield_16824"]');
      const f4 = xp('//*[@id="customfield_16833"]');

      if (f1) f1.value = fmt(now);

      const sd = nextLab(new Date(now));
      sd.setHours(8, 0, 0, 0);
      if (f2) f2.value = fmt(sd);

      const ed = new Date(sd);
      ed.setHours(16, 0, 0, 0);
      if (f3) f3.value = fmt(ed);

      if (f4) f4.value = "OK";

      /* TELÉFONOS */
      const tp = document.getElementById("customfield_16820");
      const ta = document.getElementById("customfield_16821");
      if (tp && ta && tp.value) {
        ta.value = tp.value;
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }

      /* FINAL */
      loaderText("<i class='fa-solid fa-circle-check'></i> Completado");
      loader(100);
      await wait(500);
      loaderHide();
      toastOK(sel);
    } catch (e) {
      loaderHide();
      alert("⚠️ Detenido por control de Jira: " + e.message);
    }
  })();
})();