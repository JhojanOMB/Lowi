javascript:(function () {

    const url = window.location.href;

    function cargar(script) {
        const s = document.createElement("script");
        s.src = script + "?t=" + Date.now(); // evita caché
        document.body.appendChild(s);
    }

    /* ================= BO WEB ================= */
    if (url.includes("lowi.es/bo/milowi/user/")) {
        cargar("https://cdn.jsdelivr.net/gh/JhojanOMB/Lowi@main/boweb.js");
        return;
    }

    /* ================= JIRA ================= */
    if (url.includes("jsm.enabler.es/servicedesk/customer/portal/")) {

        // Script principal de Jira
        cargar("https://cdn.jsdelivr.net/gh/JhojanOMB/Lowi@main/jira.js");

        // Esperar que cargue la página y buscar TT-XXXXXX
        setTimeout(() => {

            const texto = document.body.innerText || "";

            if (/TT-\d{4,}/i.test(texto)) {
                cargar("https://cdn.jsdelivr.net/gh/JhojanOMB/Lowi@main/tt.js");
            }

        }, 1500);

        return;
    }

    alert("Página no soportada");

})();