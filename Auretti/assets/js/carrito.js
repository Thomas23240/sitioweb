// Variables globales
let productoAEliminar = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Página de carrito cargada');
    
    // Verificar si el usuario está logueado
    verificarAutenticacion();
    
    // Cargar y renderizar el carrito
    renderizarCarrito();
    
    // Inicializar event listeners
    initEventListenersCarrito();
});

function verificarAutenticacion() {
    // Si no hay usuario logueado, redirigir a login
    if (!usuarioActual) {
        mostrarNotificacion('⚠️ Debes iniciar sesión para ver tu carrito', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

function initEventListenersCarrito() {
    // Toggle cupón
    const cuponToggle = document.getElementById('cuponToggle');
    const cuponForm = document.getElementById('cuponForm');
    
    if (cuponToggle && cuponForm) {
        cuponToggle.addEventListener('click', function() {
            cuponForm.classList.toggle('active');
            const icon = this.querySelector('i');
            if (cuponForm.classList.contains('active')) {
                icon.classList.remove('bi-chevron-down');
                icon.classList.add('bi-chevron-up');
            } else {
                icon.classList.remove('bi-chevron-up');
                icon.classList.add('bi-chevron-down');
            }
        });
    }
    
    // Aplicar cupón
    const btnAplicarCupon = document.getElementById('btnAplicarCupon');
    if (btnAplicarCupon) {
        btnAplicarCupon.addEventListener('click', aplicarCupon);
    }
    
    // Modal de confirmación de eliminación
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            if (productoAEliminar !== null) {
                eliminarDelCarrito(productoAEliminar);
                const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
                modal.hide();
                productoAEliminar = null;
            }
        });
    }
}

function renderizarCarrito() {
    const contenedor = document.getElementById('carritoContent');
    if (!contenedor) return;
    
    // Si el carrito está vacío
    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12">
                <div class="carrito-vacio">
                    <i class="bi bi-bag-x carrito-vacio-icon"></i>
                    <h2>Tu carrito está vacío</h2>
                    <p>¡Descubre productos increíbles para tu próxima aventura!</p>
                    <a href="productos.html" class="btn btn-primary btn-lg">
                        <i class="bi bi-shop"></i> Explorar Productos
                    </a>
                </div>
            </div>
        `;
        return;
    }
    
    // Renderizar items y resumen
    contenedor.innerHTML = `
        <div class="col-lg-8 mb-4">
            <div class="carrito-items">
                <h3 class="mb-4">
                    Productos en tu carrito 
                    <span style="color: var(--medium-gray); font-size: var(--fs-normal);">(${carrito.length} ${carrito.length === 1 ? 'producto' : 'productos'})</span>
                </h3>
                ${carrito.map(item => crearItemCarrito(item)).join('')}
            </div>
            
            <!-- Garantías -->
            <div class="garantias-section">
                <h4>Compra con confianza</h4>
                <div class="garantias-grid">
                    <div class="garantia-item">
                        <i class="bi bi-truck"></i>
                        <div>
                            <h4>Envío Gratis</h4>
                            <p>En compras +$100</p>
                        </div>
                    </div>
                    <div class="garantia-item">
                        <i class="bi bi-shield-check"></i>
                        <div>
                            <h4>Compra Segura</h4>
                            <p>Pago protegido</p>
                        </div>
                    </div>
                    <div class="garantia-item">
                        <i class="bi bi-arrow-counterclockwise"></i>
                        <div>
                            <h4>30 días</h4>
                            <p>Devolución gratis</p>
                        </div>
                    </div>
                    <div class="garantia-item">
                        <i class="bi bi-headset"></i>
                        <div>
                            <h4>Soporte 24/7</h4>
                            <p>Siempre disponible</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-lg-4">
            ${crearResumenCarrito()}
        </div>
    `;
    
    // Agregar event listeners a los botones
    agregarEventListenersItems();
}

function crearItemCarrito(item) {
    return `
        <div class="carrito-item">
            <img src="../${item.imagen}" alt="${item.nombre}" class="item-img"
                 onerror="this.src='https://placehold.co/120x120/1a4d2e/white?text=AURETTI'">
            
            <div class="item-details">
                <div class="item-header">
                    <div>
                        <span class="item-category">${getCategoriaTexto(item.categoria)}</span>
                        <h4 class="item-name">${item.nombre}</h4>
                    </div>
                    <span class="item-price">$${item.precio.toFixed(2)}</span>
                </div>
                
                <div class="item-footer">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, -1)" ${item.cantidad <= 1 ? 'disabled' : ''}>
                            <i class="bi bi-dash"></i>
                        </button>
                        <span class="quantity-value">${item.cantidad}</span>
                        <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, 1)">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                    
                    <div class="item-actions">
                        <span class="item-subtotal">$${(item.precio * item.cantidad).toFixed(2)}</span>
                        <button class="btn-remove" onclick="confirmarEliminacion(${item.id})" title="Eliminar producto">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function crearResumenCarrito() {
    const subtotal = calcularSubtotal();
    const descuento = calcularDescuento();
    const envio = calcularEnvio(subtotal);
    const total = subtotal - descuento + envio;
    
    return `
        <div class="carrito-resumen">
            <h3 class="resumen-title">Resumen del Pedido</h3>
            
            <div class="resumen-item subtotal">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            
            ${descuento > 0 ? `
            <div class="resumen-item descuento">
                <span>Descuento</span>
                <span>-$${descuento.toFixed(2)}</span>
            </div>
            ` : ''}
            
            <div class="resumen-item envio">
                <span>Envío</span>
                <span class="${envio === 0 ? 'envio-gratis' : ''}">
                    ${envio === 0 ? '¡GRATIS!' : `$${envio.toFixed(2)}`}
                </span>
            </div>
            
            ${subtotal < 100 && subtotal > 0 ? `
            <div class="alert alert-info mt-3 mb-0" style="font-size: var(--fs-small); padding: 10px;">
                <i class="bi bi-info-circle"></i> 
                Agrega $${(100 - subtotal).toFixed(2)} más para envío gratis
            </div>
            ` : ''}
            
            <!-- Cupón de Descuento -->
            <div class="cupon-section">
                <button class="cupon-toggle" id="cuponToggle">
                    <span><i class="bi bi-ticket-perforated"></i> ¿Tienes un cupón?</span>
                    <i class="bi bi-chevron-down"></i>
                </button>
                <div class="cupon-form" id="cuponForm">
                    <div class="cupon-input-group">
                        <input type="text" class="cupon-input" id="cuponInput" placeholder="Código de cupón" maxlength="20">
                        <button class="btn-aplicar-cupon" id="btnAplicarCupon">Aplicar</button>
                    </div>
                    <small style="color: var(--medium-gray); display: block; margin-top: 8px;">
                        Cupón de prueba: <strong>AURETTI10</strong>
                    </small>
                </div>
            </div>
            
            <div class="resumen-item total">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            
            <button class="btn btn-primary btn-checkout" onclick="irACheckout()">
                <i class="bi bi-credit-card"></i> Proceder al Pago
            </button>
            
            <button class="btn btn-outline btn-seguir-comprando" onclick="window.location.href='productos.html'">
                <i class="bi bi-arrow-left"></i> Seguir Comprando
            </button>
        </div>
    `;
}

function agregarEventListenersItems() {
    // Los event listeners ya están agregados con onclick en el HTML
    // Esta función está lista para agregar más listeners si es necesario
}

function cambiarCantidad(productoId, cambio) {
    const item = carrito.find(i => i.id === productoId);
    if (!item) return;
    
    const nuevaCantidad = item.cantidad + cambio;
    
    if (nuevaCantidad <= 0) {
        confirmarEliminacion(productoId);
        return;
    }
    
    // Verificar stock (simulado - máximo 50 unidades)
    if (nuevaCantidad > 50) {
        mostrarNotificacion('⚠️ Cantidad máxima alcanzada', 'warning');
        return;
    }
    
    item.cantidad = nuevaCantidad;
    guardarCarritoEnLocalStorage();
    actualizarContadorCarrito();
    renderizarCarrito();
    
    mostrarNotificacion('✅ Cantidad actualizada', 'success');
}

function confirmarEliminacion(productoId) {
    productoAEliminar = productoId;
    const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    modal.show();
}

function eliminarDelCarrito(productoId) {
    const index = carrito.findIndex(i => i.id === productoId);
    
    if (index !== -1) {
        const producto = carrito[index];
        carrito.splice(index, 1);
        guardarCarritoEnLocalStorage();
        actualizarContadorCarrito();
        renderizarCarrito();
        
        mostrarNotificacion(`❌ ${producto.nombre} eliminado del carrito`, 'info');
    }
}

function calcularSubtotal() {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

function calcularDescuento() {
    const cuponAplicado = localStorage.getItem('auretti_cupon');
    if (!cuponAplicado) return 0;
    
    const subtotal = calcularSubtotal();
    
    // Cupones disponibles (simulación)
    const cupones = {
        'AURETTI10': { tipo: 'porcentaje', valor: 10 }, // 10% de descuento
        'BIENVENIDO': { tipo: 'porcentaje', valor: 15 }, // 15% de descuento
        'AVENTURA20': { tipo: 'fijo', valor: 20 } // $20 de descuento
    };
    
    const cupon = cupones[cuponAplicado.toUpperCase()];
    if (!cupon) return 0;
    
    if (cupon.tipo === 'porcentaje') {
        return subtotal * (cupon.valor / 100);
    } else {
        return Math.min(cupon.valor, subtotal);
    }
}

function calcularEnvio(subtotal) {
    // Envío gratis para compras mayores a $100
    return subtotal >= 100 ? 0 : 10;
}

function aplicarCupon() {
    const input = document.getElementById('cuponInput');
    if (!input) return;
    
    const codigo = input.value.trim().toUpperCase();
    
    if (!codigo) {
        mostrarNotificacion('⚠️ Por favor ingresa un código de cupón', 'warning');
        return;
    }
    
    // Cupones válidos (simulación)
    const cuponesValidos = ['AURETTI10', 'BIENVENIDO', 'AVENTURA20'];
    
    if (cuponesValidos.includes(codigo)) {
        localStorage.setItem('auretti_cupon', codigo);
        mostrarNotificacion(`✅ Cupón ${codigo} aplicado correctamente`, 'success');
        renderizarCarrito();
        input.value = '';
    } else {
        mostrarNotificacion('❌ Cupón no válido o expirado', 'danger');
    }
}

function irACheckout() {
    if (carrito.length === 0) {
        mostrarNotificacion('⚠️ Tu carrito está vacío', 'warning');
        return;
    }
    
    // Guardar datos del pedido antes de ir al checkout
    const datosPedido = {
        items: carrito,
        subtotal: calcularSubtotal(),
        descuento: calcularDescuento(),
        envio: calcularEnvio(calcularSubtotal()),
        total: calcularSubtotal() - calcularDescuento() + calcularEnvio(calcularSubtotal()),
        fecha: new Date().toISOString()
    };
    
    localStorage.setItem('auretti_pedido_temp', JSON.stringify(datosPedido));
    
    // Redirigir a checkout
    window.location.href = 'checkout.html';
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

// Exportar funciones globales
window.cambiarCantidad = cambiarCantidad;
window.confirmarEliminacion = confirmarEliminacion;
window.eliminarDelCarrito = eliminarDelCarrito;
window.irACheckout = irACheckout;