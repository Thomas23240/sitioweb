let carrito = [];
let productos = [];
let usuarioActual = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 AURETTI cargado correctamente');
    
    // Inicializar funciones
    initMenuHamburguesa();
    initScrollHeader();
    cargarCarritoDesdeLocalStorage();
    cargarUsuarioActual();
    actualizarContadorCarrito();
    
    // Cargar productos si estamos en index.html
    if (document.getElementById('featuredProducts')) {
        cargarProductosDestacados();
    }
    
    // Event Listeners
    initEventListeners();
});

function initMenuHamburguesa() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            // Animar las líneas del hamburguesa
            const spans = hamburger.querySelectorAll('span');
            if (hamburger.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Cerrar menú al hacer click en un enlace
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }
}

function initScrollHeader() {
    const header = document.getElementById('header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

function initEventListeners() {
    // Botón de usuario
    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (usuarioActual) {
                // Si hay usuario logueado, mostrar menú
                mostrarMenuUsuario();
            } else {
                // Si no hay usuario, ir a login
                const rutaLogin = window.location.pathname.includes('/pages/') 
                    ? 'login.html' 
                    : 'pages/login.html';
                window.location.href = rutaLogin;
            }
        });
    }
    
    // Botón de carrito
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            // VALIDAR LOGIN ANTES DE IR AL CARRITO
            if (!usuarioActual) {
                mostrarNotificacion('⚠️ Debes iniciar sesión para ver tu carrito', 'warning');
                setTimeout(() => {
                    if (confirm('¿Deseas iniciar sesión ahora?')) {
                        const rutaLogin = window.location.pathname.includes('/pages/') 
                            ? 'login.html' 
                            : 'pages/login.html';
                        window.location.href = rutaLogin;
                    }
                }, 500);
                return;
            }
            
            const rutaCarrito = window.location.pathname.includes('/pages/') 
                ? 'carrito.html' 
                : 'pages/carrito.html';
            window.location.href = rutaCarrito;
        });
    }
    
    // Botón de búsqueda
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const rutaProductos = window.location.pathname.includes('/pages/') 
                ? 'productos.html' 
                : 'pages/productos.html';
            window.location.href = rutaProductos;
        });
    }
    
    // Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            mostrarNotificacion(`✅ ¡Gracias por suscribirte! Recibirás nuestras novedades en ${email}`, 'success');
            this.reset();
        });
    }
}

function mostrarMenuUsuario() {
    // Remover menú existente si hay
    const menuExistente = document.getElementById('userDropdownMenu');
    if (menuExistente) {
        menuExistente.remove();
        return;
    }
    
    // Crear menú desplegable
    const menu = document.createElement('div');
    menu.id = 'userDropdownMenu';
    menu.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        padding: 15px;
        min-width: 250px;
        z-index: 9999;
        animation: slideDown 0.3s ease;
    `;
    
    menu.innerHTML = `
        <style>
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            #userDropdownMenu .menu-header {
                padding: 10px;
                border-bottom: 2px solid #e5e5e5;
                margin-bottom: 10px;
            }
            #userDropdownMenu .menu-item {
                padding: 12px 15px;
                display: flex;
                align-items: center;
                gap: 10px;
                border-radius: 8px;
                cursor: pointer;
                transition: 0.2s ease;
                color: #666666;
            }
            #userDropdownMenu .menu-item:hover {
                background-color: #f8f8f8;
                color: #1a4d2e;
            }
            #userDropdownMenu .menu-item i {
                font-size: 1.2rem;
            }
            #userDropdownMenu .logout-item {
                color: #dc3545;
                border-top: 1px solid #e5e5e5;
                margin-top: 10px;
                padding-top: 15px;
            }
            #userDropdownMenu .logout-item:hover {
                background-color: #fee;
            }
        </style>
        
        <div class="menu-header">
            <div style="font-weight: 600; color: #1a1a1a;">${usuarioActual.nombre || 'Usuario'}</div>
            <div style="font-size: 0.85rem; color: #666666;">${usuarioActual.email}</div>
            ${usuarioActual.rol === 'admin' ? '<span style="display: inline-block; background: #d4783f; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-top: 5px;">ADMINISTRADOR</span>' : ''}
        </div>
        
        <div class="menu-item" onclick="alert('📋 Página de perfil próximamente')">
            <i class="bi bi-person-circle"></i>
            <span>Mi Perfil</span>
        </div>
        
        <div class="menu-item" onclick="alert('📦 Mis Pedidos próximamente')">
            <i class="bi bi-box-seam"></i>
            <span>Mis Pedidos</span>
        </div>
        
        ${usuarioActual.rol === 'admin' ? `
        <div class="menu-item" onclick="irAAdmin()">
            <i class="bi bi-shield-lock"></i>
            <span>Panel Admin</span>
        </div>
        ` : ''}
        
        <div class="menu-item logout-item" onclick="cerrarSesionCompleta()">
            <i class="bi bi-box-arrow-right"></i>
            <span>Cerrar Sesión</span>
        </div>
    `;
    
    document.body.appendChild(menu);
    
    // Cerrar al hacer click fuera
    setTimeout(() => {
        document.addEventListener('click', cerrarMenuUsuario);
    }, 100);
}

function cerrarMenuUsuario(e) {
    const menu = document.getElementById('userDropdownMenu');
    const userBtn = document.getElementById('userBtn');
    
    if (menu && !menu.contains(e.target) && e.target !== userBtn) {
        menu.remove();
        document.removeEventListener('click', cerrarMenuUsuario);
    }
}

function cerrarSesionCompleta() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        localStorage.removeItem('auretti_usuario');
        localStorage.removeItem('auretti_recordar');
        mostrarNotificacion('✅ Sesión cerrada correctamente', 'info');
        
        // Recargar la página actual
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

function irAAdmin() {
    const rutaAdmin = window.location.pathname.includes('/pages/') 
        ? 'admin.html' 
        : 'pages/admin.html';
    window.location.href = rutaAdmin;
}

async function cargarProductos() {
    try {
        // Intentar diferentes rutas según dónde estemos
        let rutaJSON = 'data/productos.json';
        if (window.location.pathname.includes('/pages/')) {
            rutaJSON = '../data/productos.json';
        }
        
        const response = await fetch(rutaJSON);
        
        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }
        
        const data = await response.json();
        productos = data.productos;
        console.log('✅ Productos cargados:', productos.length);
        return productos;
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        
        // Productos de respaldo (fallback)
        productos = obtenerProductosFallback();
        return productos;
    }
}

function obtenerProductosFallback() {
    return [
        {
            id: 1,
            nombre: "Cuerda de Escalada Pro 10mm",
            categoria: "escalada",
            precio: 129.99,
            descripcion: "Cuerda dinámica de 60 metros, certificada UIAA.",
            imagen: "assets/images/productos/escalada/cuerda1.jpg",
            stock: 25
        },
        {
            id: 2,
            nombre: "Arnés de Escalada Alpine",
            categoria: "escalada",
            precio: 89.99,
            descripcion: "Arnés versátil y cómodo para escalada deportiva.",
            imagen: "assets/images/productos/escalada/arnes1.jpg",
            stock: 18
        },
        {
            id: 5,
            nombre: "Chaqueta Alpine Summit",
            categoria: "ropa",
            precio: 249.99,
            descripcion: "Chaqueta impermeable con membrana Gore-Tex.",
            imagen: "assets/images/productos/ropa/chaqueta1.jpg",
            stock: 30
        },
        {
            id: 6,
            nombre: "Chaqueta Softshell Explorer",
            categoria: "ropa",
            precio: 159.99,
            descripcion: "Chaqueta versátil softshell con protección contra viento.",
            imagen: "assets/images/productos/ropa/chaqueta2.jpg",
            stock: 22
        },
        {
            id: 9,
            nombre: "Collar Compass Rose",
            categoria: "joyeria",
            precio: 79.99,
            descripcion: "Collar de acero con dije de brújula.",
            imagen: "assets/images/productos/joyeria/collar1.jpg",
            stock: 35
        },
        {
            id: 13,
            nombre: "Reloj Tactical Explorer GPS",
            categoria: "relojes",
            precio: 399.99,
            descripcion: "Reloj deportivo con GPS y altímetro.",
            imagen: "assets/images/productos/relojes/reloj1.jpg",
            stock: 12
        }
    ];
}

async function cargarProductosDestacados() {
    const container = document.getElementById('featuredProducts');
    
    if (!container) return;
    
    // Mostrar spinner mientras carga
    container.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando productos...</span>
            </div>
        </div>
    `;
    
    try {
        await cargarProductos();
        
        // Seleccionar 4 productos destacados (uno de cada categoría)
        const destacados = [
            productos.find(p => p.categoria === 'escalada'),
            productos.find(p => p.categoria === 'ropa'),
            productos.find(p => p.categoria === 'joyeria'),
            productos.find(p => p.categoria === 'relojes')
        ].filter(p => p !== undefined);
        
        // Limpiar container
        container.innerHTML = '';
        
        // Crear cards de productos
        destacados.forEach(producto => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-3';
            col.innerHTML = crearTarjetaProducto(producto);
            container.appendChild(col);
        });
        
        // Agregar event listeners a los botones
        agregarEventListenersProductos();
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-danger">Error al cargar productos. Por favor, recarga la página.</p>
            </div>
        `;
    }
}

function crearTarjetaProducto(producto) {
    return `
        <div class="product-card">
            <div class="product-img-wrapper">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="product-img" 
                     onerror="this.src='https://placehold.co/300x300/1a4d2e/white?text=AURETTI'">
                ${producto.stock < 10 ? '<span class="product-badge">¡Últimas!</span>' : ''}
            </div>
            <div class="product-body">
                <span class="product-category">${getCategoriaTexto(producto.categoria)}</span>
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion}</p>
                <div class="product-footer">
                    <span class="product-price">$${producto.precio.toFixed(2)}</span>
                    <button class="add-to-cart-btn" data-id="${producto.id}">
                        <i class="bi bi-cart-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getCategoriaTexto(categoria) {
    const categorias = {
        'escalada': 'Escalada',
        'ropa': 'Ropa',
        'joyeria': 'Joyería',
        'relojes': 'Relojes'
    };
    return categorias[categoria] || categoria;
}

function agregarEventListenersProductos() {
    const botonesAgregar = document.querySelectorAll('.add-to-cart-btn');
    
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', function() {
            const productoId = parseInt(this.getAttribute('data-id'));
            agregarAlCarrito(productoId);
        });
    });
}

// ⭐ FUNCIÓN PRINCIPAL CON VALIDACIÓN DE LOGIN
function agregarAlCarrito(productoId) {
    // 🔒 VALIDAR SI EL USUARIO ESTÁ LOGUEADO
    if (!usuarioActual) {
        mostrarNotificacion('⚠️ Debes iniciar sesión para agregar productos al carrito', 'warning');
        
        // Preguntar si desea ir a login
        setTimeout(() => {
            if (confirm('¿Deseas iniciar sesión ahora?')) {
                const rutaLogin = window.location.pathname.includes('/pages/') 
                    ? 'login.html' 
                    : 'pages/login.html';
                window.location.href = rutaLogin;
            }
        }, 500);
        return; // DETENER la función aquí
    }
    
    const producto = productos.find(p => p.id === productoId);
    
    if (!producto) {
        mostrarNotificacion('❌ Producto no encontrado', 'danger');
        return;
    }
    
    // Verificar si el producto ya está en el carrito
    const itemExistente = carrito.find(item => item.id === productoId);
    
    if (itemExistente) {
        // Incrementar cantidad
        if (itemExistente.cantidad < producto.stock) {
            itemExistente.cantidad++;
            mostrarNotificacion(`✅ Cantidad actualizada: ${producto.nombre}`, 'success');
        } else {
            mostrarNotificacion(`⚠️ Stock máximo alcanzado`, 'warning');
            return;
        }
    } else {
        // Agregar nuevo producto
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1,
            categoria: producto.categoria
        });
        mostrarNotificacion(`✅ ${producto.nombre} agregado al carrito`, 'success');
    }
    
    // Actualizar localStorage y contador
    guardarCarritoEnLocalStorage();
    actualizarContadorCarrito();
}

function guardarCarritoEnLocalStorage() {
    localStorage.setItem('auretti_carrito', JSON.stringify(carrito));
}

function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('auretti_carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('cartCount');
    if (contador) {
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
        contador.textContent = totalItems;
        
        // Animar el contador
        if (totalItems > 0) {
            contador.style.display = 'block';
            contador.style.animation = 'none';
            setTimeout(() => {
                contador.style.animation = 'pulse 0.3s ease';
            }, 10);
        } else {
            contador.style.display = 'none';
        }
    }
}

function cargarUsuarioActual() {
    const usuarioGuardado = localStorage.getItem('auretti_usuario');
    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
        console.log('✅ Usuario logueado:', usuarioActual.email);
        
        // Cambiar icono de usuario si está logueado
        const userBtn = document.getElementById('userBtn');
        if (userBtn && usuarioActual) {
            userBtn.innerHTML = '<i class="bi bi-person-fill"></i>';
            userBtn.title = usuarioActual.nombre || usuarioActual.email;
        }
    }
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    
    const iconos = {
        'success': 'bi-check-circle',
        'warning': 'bi-exclamation-triangle',
        'danger': 'bi-x-circle',
        'info': 'bi-info-circle'
    };
    
    notificacion.innerHTML = `
        <i class="bi ${iconos[tipo] || 'bi-info-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    // Agregar estilos si no existen
    if (!document.getElementById('notificacion-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notificacion-styles';
        styles.textContent = `
            .notificacion {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 350px;
            }
            .notificacion-success {
                border-left: 4px solid #28a745;
            }
            .notificacion-success i {
                color: #28a745;
            }
            .notificacion-warning {
                border-left: 4px solid #ffc107;
            }
            .notificacion-warning i {
                color: #ffc107;
            }
            .notificacion-danger {
                border-left: 4px solid #dc3545;
            }
            .notificacion-danger i {
                color: #dc3545;
            }
            .notificacion-info {
                border-left: 4px solid #17a2b8;
            }
            .notificacion-info i {
                color: #17a2b8;
            }
            .notificacion i {
                font-size: 1.5rem;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

function formatearPrecio(precio) {
    return `$${precio.toFixed(2)}`;
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Exportar funciones globales
window.agregarAlCarrito = agregarAlCarrito;
window.cerrarSesionCompleta = cerrarSesionCompleta;
window.irAAdmin = irAAdmin;
window.mostrarNotificacion = mostrarNotificacion;