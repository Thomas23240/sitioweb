// Variables globales
let todosLosProductos = [];
let productosFiltrados = [];
let paginaActual = 1;
const productosPorPagina = 12;

// Estado de filtros
let filtros = {
    categoria: 'todas',
    busqueda: '',
    precioMax: 500,
    enStock: true,
    pocasUnidades: false,
    ordenamiento: 'destacados'
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Página de productos cargada');
    
    // Cargar productos
    inicializarProductos();
    
    // Inicializar event listeners
    initEventListenersProductos();
    
    // Verificar si viene de una categoría específica
    verificarCategoriaURL();
});

async function inicializarProductos() {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('productosGrid');
    
    try {
        // Cargar productos desde main.js
        await cargarProductos();
        todosLosProductos = [...productos];
        
        // Ocultar spinner
        if (spinner) spinner.style.display = 'none';
        
        // Actualizar contadores de categorías
        actualizarContadoresCategorias();
        
        // Aplicar filtros y mostrar productos
        aplicarFiltros();
        
        console.log('✅ Productos cargados:', todosLosProductos.length);
        
    } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        if (spinner) spinner.style.display = 'none';
        if (grid) {
            grid.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-danger">Error al cargar productos. Por favor, recarga la página.</p>
                </div>
            `;
        }
    }
}

function initEventListenersProductos() {
    // Buscador
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filtros.busqueda = e.target.value.toLowerCase();
            paginaActual = 1;
            aplicarFiltros();
        });
    }
    
    // Filtros de categoría
    const radiosCategorias = document.querySelectorAll('input[name="categoria"]');
    radiosCategorias.forEach(radio => {
        radio.addEventListener('change', function() {
            filtros.categoria = this.value;
            paginaActual = 1;
            actualizarTituloCategoria();
            aplicarFiltros();
        });
    });
    
    // Rango de precio
    const priceRange = document.getElementById('priceRange');
    const maxPrice = document.getElementById('maxPrice');
    if (priceRange && maxPrice) {
        priceRange.addEventListener('input', function() {
            filtros.precioMax = parseFloat(this.value);
            maxPrice.textContent = `$${this.value}`;
            aplicarFiltros();
        });
    }
    
    // Checkboxes de disponibilidad
    const enStockCheckbox = document.getElementById('enStock');
    if (enStockCheckbox) {
        enStockCheckbox.addEventListener('change', function() {
            filtros.enStock = this.checked;
            aplicarFiltros();
        });
    }
    
    const pocasUnidadesCheckbox = document.getElementById('pocasUnidades');
    if (pocasUnidadesCheckbox) {
        pocasUnidadesCheckbox.addEventListener('change', function() {
            filtros.pocasUnidades = this.checked;
            aplicarFiltros();
        });
    }
    
    // Ordenamiento
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            filtros.ordenamiento = this.value;
            aplicarFiltros();
        });
    }
    
    // Toggle de vista (grid/list)
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            cambiarVista(view);
            
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Botón limpiar filtros
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', limpiarFiltros);
    }
}

function verificarCategoriaURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaURL = urlParams.get('categoria');
    
    if (categoriaURL) {
        filtros.categoria = categoriaURL;
        const radioCategoria = document.querySelector(`input[name="categoria"][value="${categoriaURL}"]`);
        if (radioCategoria) {
            radioCategoria.checked = true;
        }
        actualizarTituloCategoria();
    }
}

function actualizarTituloCategoria() {
    const categoryTitle = document.getElementById('categoryTitle');
    if (!categoryTitle) return;
    
    const titulos = {
        'todas': 'Todos los Productos',
        'escalada': 'Equipamiento de Escalada',
        'ropa': 'Ropa Outdoor',
        'joyeria': 'Joyería Aventurera',
        'relojes': 'Relojes Deportivos'
    };
    
    categoryTitle.textContent = titulos[filtros.categoria] || 'Productos';
}

function actualizarContadoresCategorias() {
    const contadores = {
        'todas': todosLosProductos.length,
        'escalada': todosLosProductos.filter(p => p.categoria === 'escalada').length,
        'ropa': todosLosProductos.filter(p => p.categoria === 'ropa').length,
        'joyeria': todosLosProductos.filter(p => p.categoria === 'joyeria').length,
        'relojes': todosLosProductos.filter(p => p.categoria === 'relojes').length
    };
    
    Object.keys(contadores).forEach(cat => {
        const countElement = document.getElementById(`count-${cat}`);
        if (countElement) {
            countElement.textContent = contadores[cat];
        }
    });
}

function aplicarFiltros() {
    // Comenzar con todos los productos
    productosFiltrados = [...todosLosProductos];
    
    // Filtrar por categoría
    if (filtros.categoria !== 'todas') {
        productosFiltrados = productosFiltrados.filter(p => p.categoria === filtros.categoria);
    }
    
    // Filtrar por búsqueda
    if (filtros.busqueda) {
        productosFiltrados = productosFiltrados.filter(p => 
            p.nombre.toLowerCase().includes(filtros.busqueda) ||
            p.descripcion.toLowerCase().includes(filtros.busqueda)
        );
    }
    
    // Filtrar por precio
    productosFiltrados = productosFiltrados.filter(p => p.precio <= filtros.precioMax);
    
    // Filtrar por disponibilidad
    if (filtros.enStock && !filtros.pocasUnidades) {
        productosFiltrados = productosFiltrados.filter(p => p.stock > 0);
    } else if (filtros.pocasUnidades) {
        productosFiltrados = productosFiltrados.filter(p => p.stock > 0 && p.stock < 10);
    }
    
    // Ordenar productos
    ordenarProductos();
    
    // Actualizar contador
    actualizarContadorProductos();
    
    // Renderizar productos
    renderizarProductos();
    
    // Renderizar paginación
    renderizarPaginacion();
}

function ordenarProductos() {
    switch (filtros.ordenamiento) {
        case 'nombre-asc':
            productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case 'nombre-desc':
            productosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
            break;
        case 'precio-asc':
            productosFiltrados.sort((a, b) => a.precio - b.precio);
            break;
        case 'precio-desc':
            productosFiltrados.sort((a, b) => b.precio - a.precio);
            break;
        case 'mas-nuevo':
            productosFiltrados.sort((a, b) => b.id - a.id);
            break;
        default:
            // Destacados - orden original
            break;
    }
}

function renderizarProductos() {
    const grid = document.getElementById('productosGrid');
    if (!grid) return;
    
    // Calcular productos para la página actual
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosParaMostrar = productosFiltrados.slice(inicio, fin);
    
    if (productosParaMostrar.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <i class="bi bi-search"></i>
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar tus filtros o realizar otra búsqueda</p>
                <button class="btn btn-primary" onclick="limpiarFiltros()">Limpiar Filtros</button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    
    productosParaMostrar.forEach(producto => {
        const card = crearTarjetaProducto(producto);
        grid.insertAdjacentHTML('beforeend', card);
    });
    
    // Agregar event listeners a los botones de agregar al carrito
    agregarEventListenersCarrito();
}

function crearTarjetaProducto(producto) {
    return `
        <div class="product-card">
            <div class="product-img-wrapper">
                <img src="../${producto.imagen}" alt="${producto.nombre}" class="product-img" 
                     onerror="this.src='https://placehold.co/300x300/1a4d2e/white?text=AURETTI'">
                ${producto.stock < 10 && producto.stock > 0 ? '<span class="product-badge">¡Últimas!</span>' : ''}
                ${producto.stock === 0 ? '<span class="product-badge" style="background-color: var(--danger);">Agotado</span>' : ''}
            </div>
            <div class="product-body">
                <span class="product-category">${getCategoriaTexto(producto.categoria)}</span>
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion}</p>
                <div class="product-footer">
                    <span class="product-price">$${producto.precio.toFixed(2)}</span>
                    ${producto.stock > 0 ? `
                        <button class="add-to-cart-btn" data-id="${producto.id}">
                            <i class="bi bi-cart-plus"></i> Agregar
                        </button>
                    ` : `
                        <button class="add-to-cart-btn" disabled style="background-color: var(--light-gray); cursor: not-allowed;">
                            Agotado
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}

function agregarEventListenersCarrito() {
    const botones = document.querySelectorAll('.add-to-cart-btn:not([disabled])');
    botones.forEach(btn => {
        btn.addEventListener('click', function() {
            const productoId = parseInt(this.getAttribute('data-id'));
            agregarAlCarrito(productoId);
        });
    });
}

function actualizarContadorProductos() {
    const countElement = document.getElementById('productCount');
    if (countElement) {
        const total = productosFiltrados.length;
        countElement.textContent = `${total} producto${total !== 1 ? 's' : ''}`;
    }
}

function renderizarPaginacion() {
    const paginationElement = document.getElementById('pagination');
    if (!paginationElement) return;
    
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    
    if (totalPaginas <= 1) {
        paginationElement.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Botón anterior
    paginationHTML += `
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${paginaActual - 1}">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        if (
            i === 1 || 
            i === totalPaginas || 
            (i >= paginaActual - 1 && i <= paginaActual + 1)
        ) {
            paginationHTML += `
                <li class="page-item ${i === paginaActual ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        } else if (i === paginaActual - 2 || i === paginaActual + 2) {
            paginationHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
    }
    
    // Botón siguiente
    paginationHTML += `
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${paginaActual + 1}">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `;
    
    paginationElement.innerHTML = paginationHTML;
    
    // Event listeners para paginación
    const pageLinks = paginationElement.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (page && page !== paginaActual && page >= 1 && page <= totalPaginas) {
                paginaActual = page;
                renderizarProductos();
                renderizarPaginacion();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

function cambiarVista(vista) {
    const grid = document.getElementById('productosGrid');
    if (!grid) return;
    
    if (vista === 'list') {
        grid.classList.add('list-view');
    } else {
        grid.classList.remove('list-view');
    }
}

function limpiarFiltros() {
    // Resetear filtros
    filtros = {
        categoria: 'todas',
        busqueda: '',
        precioMax: 500,
        enStock: true,
        pocasUnidades: false,
        ordenamiento: 'destacados'
    };
    
    // Resetear inputs
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    const radioTodas = document.querySelector('input[name="categoria"][value="todas"]');
    if (radioTodas) radioTodas.checked = true;
    
    const priceRange = document.getElementById('priceRange');
    const maxPrice = document.getElementById('maxPrice');
    if (priceRange && maxPrice) {
        priceRange.value = 500;
        maxPrice.textContent = '$500';
    }
    
    const enStockCheckbox = document.getElementById('enStock');
    if (enStockCheckbox) enStockCheckbox.checked = true;
    
    const pocasUnidadesCheckbox = document.getElementById('pocasUnidades');
    if (pocasUnidadesCheckbox) pocasUnidadesCheckbox.checked = false;
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'destacados';
    
    // Actualizar título
    actualizarTituloCategoria();
    
    // Resetear página
    paginaActual = 1;
    
    // Aplicar filtros (que ahora son los valores por defecto)
    aplicarFiltros();
    
    mostrarNotificacion('✅ Filtros limpiados', 'success');
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

// Exportar funciones
window.limpiarFiltros = limpiarFiltros;