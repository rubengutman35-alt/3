const STORAGE_KEYS = {
    productos: "sv_productos_v1",
    clientes: "sv_clientes_v1",
    ventas: "sv_ventas_v1"
};

const DATOS_INICIALES = {
    productos: [
        { id: 1, nombre: "Teclado Mecánico RGB", categoria: "Periféricos", precio: 320, stock: 8, imagen: "../img/teclado.jpg" },
        { id: 2, nombre: "Mouse Inalámbrico", categoria: "Periféricos", precio: 110, stock: 15, imagen: "../img/mouse.jpg" },
        { id: 3, nombre: "Monitor 24\" Full HD", categoria: "Monitores", precio: 1020, stock: 2, imagen: "../img/monitor.jpg" }
    ],
    clientes: [
        { ci: "8452190", nombre: "Carlos Mamani", telefono: "71548920", estado: "Activo" },
        { ci: "9123456", nombre: "Ana Quispe", telefono: "68941230", estado: "Activo" }
    ],
    ventas: [
        { id: "#001", cliente: "Carlos Mamani", producto: "Teclado Mecánico RGB", total: 320 },
        { id: "#002", cliente: "Ana Quispe", producto: "Mouse Inalámbrico", total: 110 },
        { id: "#003", cliente: "Luis Condori", producto: "Monitor 24\" Full HD", total: 1020 }
    ]
};

function inicializarDatos() {
    if (!localStorage.getItem(STORAGE_KEYS.productos)) {
        localStorage.setItem(STORAGE_KEYS.productos, JSON.stringify(DATOS_INICIALES.productos));
    }
    if (!localStorage.getItem(STORAGE_KEYS.clientes)) {
        localStorage.setItem(STORAGE_KEYS.clientes, JSON.stringify(DATOS_INICIALES.clientes));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ventas)) {
        localStorage.setItem(STORAGE_KEYS.ventas, JSON.stringify(DATOS_INICIALES.ventas));
    }
}

function obtenerDatos(key) {
    return JSON.parse(localStorage.getItem(key) || "[]");
}

function guardarDatos(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function formatoBs(monto) {
    return `Bs. ${Number(monto).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

document.addEventListener("DOMContentLoaded", () => {
    inicializarDatos();

    const loginForm = document.getElementById("loginForm");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");
    const pagina = document.body.dataset.page;

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const usuario = document.getElementById("usuario").value.trim();
            const password = document.getElementById("password").value.trim();
            const mensajeError = document.getElementById("mensajeError");

            const USER_VALIDO = "admin";
            const EMAIL_VALIDO = "admin@tienda.com";
            const PASS_VALIDO = "12345";

            if (usuario === "" || password === "") {
                mensajeError.textContent = "Por favor, completa todos los campos.";
                return;
            }

            if ((usuario === USER_VALIDO || usuario === EMAIL_VALIDO) && password === PASS_VALIDO) {
                mensajeError.textContent = "";
                sessionStorage.setItem("sesionActiva", "true");
                window.location.href = "pages/inicio.html";
            } else {
                mensajeError.textContent = "Usuario o contraseña incorrectos.";
            }
        });
        return;
    }

    if (btnCerrarSesion) {
        if (sessionStorage.getItem("sesionActiva") !== "true") {
            window.location.href = "../index.html";
            return;
        }
        btnCerrarSesion.addEventListener("click", () => {
            sessionStorage.removeItem("sesionActiva");
            window.location.href = "../index.html";
        });
    }

    if (pagina === "inicio") {
        renderInicio();
        const btnReset = document.getElementById("btnResetDatos");
        if (btnReset) {
            btnReset.addEventListener("click", () => {
                localStorage.setItem(STORAGE_KEYS.productos, JSON.stringify(DATOS_INICIALES.productos));
                localStorage.setItem(STORAGE_KEYS.clientes, JSON.stringify(DATOS_INICIALES.clientes));
                localStorage.setItem(STORAGE_KEYS.ventas, JSON.stringify(DATOS_INICIALES.ventas));
                renderInicio();
            });
        }
    }

    if (pagina === "productos") {
        configurarProductos();
    }

    if (pagina === "clientes") {
        configurarClientes();
    }
});

function renderInicio() {
    const productos = obtenerDatos(STORAGE_KEYS.productos);
    const clientes = obtenerDatos(STORAGE_KEYS.clientes);
    const ventas = obtenerDatos(STORAGE_KEYS.ventas);

    const totalVentas = ventas.reduce((acc, v) => acc + Number(v.total), 0);
    document.getElementById("kpiVentas").textContent = formatoBs(totalVentas);
    document.getElementById("kpiConteoVentas").textContent = `${ventas.length} ventas registradas`;
    document.getElementById("kpiProductos").textContent = productos.length;
    document.getElementById("kpiClientes").textContent = clientes.length;

    const tbody = document.getElementById("tablaVentasBody");
    tbody.innerHTML = ventas.slice().reverse().map((v) => `
        <tr>
            <td>${v.id}</td>
            <td>${v.cliente}</td>
            <td>${v.producto}</td>
            <td>${formatoBs(v.total)}</td>
        </tr>
    `).join("");

    const avisosContenedor = document.getElementById("listaAvisos");
    const stockBajo = productos.filter((p) => Number(p.stock) <= 3);

    let avisosHTML = "";
    if (stockBajo.length > 0) {
        avisosHTML += stockBajo.map((p) => `
            <article class="aviso">
                <h4>Stock Bajo</h4>
                <p>${p.nombre}: quedan ${p.stock} unidad(es).</p>
            </article>
        `).join("");
    } else {
        avisosHTML += `
            <article class="aviso">
                <h4>Inventario Estable</h4>
                <p>Todos los productos tienen stock suficiente.</p>
            </article>
        `;
    }

    avisosHTML += `
        <article class="aviso">
            <h4>Cierre de Caja</h4>
            <p>Recuerda verificar el cuadre antes de las 20:00.</p>
        </article>
    `;
    avisosContenedor.innerHTML = avisosHTML;
}

function configurarProductos() {
    const form = document.getElementById("formProducto");
    const buscarInput = document.getElementById("buscarProducto");
    const msg = document.getElementById("msgProducto");

    cargarSelectClientes();
    renderProductos("");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nombre = document.getElementById("prodNombre").value.trim();
        const categoria = document.getElementById("prodCategoria").value;
        const precio = parseFloat(document.getElementById("prodPrecio").value);
        const stock = parseInt(document.getElementById("prodStock").value, 10);
        const imagen = document.getElementById("prodImagen").value;

        if (!nombre || isNaN(precio) || precio <= 0 || isNaN(stock) || stock < 0) {
            msg.textContent = "Completa nombre, precio mayor a 0 y stock válido.";
            msg.classList.add("error");
            return;
        }

        const productos = obtenerDatos(STORAGE_KEYS.productos);
        productos.push({
            id: Date.now(),
            nombre,
            categoria,
            precio,
            stock,
            imagen
        });
        guardarDatos(STORAGE_KEYS.productos, productos);

        msg.textContent = "Producto agregado correctamente.";
        msg.classList.remove("error");
        form.reset();
        renderProductos(buscarInput.value.trim().toLowerCase());
    });

    buscarInput.addEventListener("input", () => {
        renderProductos(buscarInput.value.trim().toLowerCase());
    });
}

function cargarSelectClientes() {
    const select = document.getElementById("clienteVentaSelect");
    if (!select) return;
    const clientes = obtenerDatos(STORAGE_KEYS.clientes);
    select.innerHTML = clientes.length
        ? clientes.map((c) => `<option value="${c.nombre}">${c.nombre} (CI: ${c.ci})</option>`).join("")
        : `<option value="Cliente General">Cliente General</option>`;
}

function renderProductos(filtro) {
    const grid = document.getElementById("gridProductos");
    const productos = obtenerDatos(STORAGE_KEYS.productos);

    const filtrados = productos.filter((p) =>
        p.nombre.toLowerCase().includes(filtro) || p.categoria.toLowerCase().includes(filtro)
    );

    if (filtrados.length === 0) {
        grid.innerHTML = `<p>No se encontraron productos.</p>`;
        return;
    }

    grid.innerHTML = filtrados.map((p) => `
        <article class="card">
            <img src="${p.imagen}" alt="${p.nombre}" class="card-img" onerror="this.style.display='none'">
            <span class="badge-cat">${p.categoria}</span>
            <h3>${p.nombre}</h3>
            <p class="numero">${formatoBs(p.precio)}</p>
            <p class="stock-info">Stock disponible: <strong>${p.stock}</strong></p>
            <div class="card-actions">
                <button type="button" class="btn-sm btn-vender" onclick="registrarVenta(${p.id})" ${p.stock <= 0 ? "disabled" : ""}>
                    ${p.stock > 0 ? "Vender (1 ud.)" : "Sin stock"}
                </button>
                <button type="button" class="btn-sm btn-eliminar" onclick="eliminarProducto(${p.id})">Eliminar</button>
            </div>
        </article>
    `).join("");
}

function registrarVenta(idProducto) {
    const productos = obtenerDatos(STORAGE_KEYS.productos);
    const ventas = obtenerDatos(STORAGE_KEYS.ventas);
    const selectCliente = document.getElementById("clienteVentaSelect");
    const msgVenta = document.getElementById("msgVentaRapida");
    const buscarInput = document.getElementById("buscarProducto");

    const prod = productos.find((p) => p.id === idProducto);
    if (!prod || prod.stock <= 0) return;

    prod.stock -= 1;
    const clienteNombre = selectCliente ? selectCliente.value : "Cliente General";
    const nuevoId = `#${String(ventas.length + 1).padStart(3, "0")}`;

    ventas.push({
        id: nuevoId,
        cliente: clienteNombre,
        producto: prod.nombre,
        total: prod.precio
    });

    guardarDatos(STORAGE_KEYS.productos, productos);
    guardarDatos(STORAGE_KEYS.ventas, ventas);

    if (msgVenta) {
        msgVenta.textContent = `Venta ${nuevoId} registrada: ${prod.nombre} a ${clienteNombre}.`;
        msgVenta.classList.remove("error");
    }

    renderProductos(buscarInput ? buscarInput.value.trim().toLowerCase() : "");
}

function eliminarProducto(idProducto) {
    const productos = obtenerDatos(STORAGE_KEYS.productos).filter((p) => p.id !== idProducto);
    guardarDatos(STORAGE_KEYS.productos, productos);
    const buscarInput = document.getElementById("buscarProducto");
    renderProductos(buscarInput ? buscarInput.value.trim().toLowerCase() : "");
}

function configurarClientes() {
    const form = document.getElementById("formCliente");
    const buscarInput = document.getElementById("buscarCliente");
    const msg = document.getElementById("msgCliente");

    renderClientes("");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const ci = document.getElementById("cliCi").value.trim();
        const nombre = document.getElementById("cliNombre").value.trim();
        const telefono = document.getElementById("cliTelefono").value.trim();

        if (!ci || !nombre || !telefono) {
            msg.textContent = "Completa CI/NIT, nombre y teléfono.";
            msg.classList.add("error");
            return;
        }

        const clientes = obtenerDatos(STORAGE_KEYS.clientes);
        clientes.push({ ci, nombre, telefono, estado: "Activo" });
        guardarDatos(STORAGE_KEYS.clientes, clientes);

        msg.textContent = "Cliente guardado correctamente.";
        msg.classList.remove("error");
        form.reset();
        renderClientes(buscarInput.value.trim().toLowerCase());
    });

    buscarInput.addEventListener("input", () => {
        renderClientes(buscarInput.value.trim().toLowerCase());
    });
}

function renderClientes(filtro) {
    const tbody = document.getElementById("tablaClientesBody");
    const clientes = obtenerDatos(STORAGE_KEYS.clientes);

    const filtrados = clientes.filter((c) =>
        c.nombre.toLowerCase().includes(filtro) || c.ci.toLowerCase().includes(filtro)
    );

    tbody.innerHTML = filtrados.map((c, index) => `
        <tr>
            <td>${c.ci}</td>
            <td>${c.nombre}</td>
            <td>${c.telefono}</td>
            <td>${c.estado}</td>
            <td>
                <button type="button" class="btn-sm btn-eliminar" onclick="eliminarCliente(${index})">Eliminar</button>
            </td>
        </tr>
    `).join("");
}

function eliminarCliente(index) {
    const clientes = obtenerDatos(STORAGE_KEYS.clientes);
    clientes.splice(index, 1);
    guardarDatos(STORAGE_KEYS.clientes, clientes);
    const buscarInput = document.getElementById("buscarCliente");
    renderClientes(buscarInput ? buscarInput.value.trim().toLowerCase() : "");
}