
let usuarios = [];

// Usuario administrador por defecto
const ADMIN_USER = {
    email: 'admin@auretti.com',
    password: 'admin123',
    nombre: 'Administrador',
    rol: 'admin',
    fechaRegistro: new Date().toISOString()
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Sistema de autenticación cargado');
    
    // Cargar usuarios desde localStorage
    cargarUsuarios();
    
    // Verificar si ya hay sesión activa
    verificarSesionActiva();
    
    // Inicializar tabs
    initTabs();
    
    // Inicializar toggle de contraseñas
    initPasswordToggles();
    
    // Event Listeners de formularios
    initFormListeners();
});

function verificarSesionActiva() {
    const usuarioActual = localStorage.getItem('auretti_usuario');
    
    if (usuarioActual) {
        const usuario = JSON.parse(usuarioActual);
        console.log('✅ Sesión activa encontrada:', usuario.email);
        
        // Preguntar si desea continuar con la sesión
        const continuar = confirm(`Ya tienes una sesión activa como ${usuario.email}. ¿Deseas continuar?`);
        
        if (continuar) {
            // Redirigir según el rol
            if (usuario.rol === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = '../index.html';
            }
        } else {
            // Cerrar sesión
            cerrarSesion();
        }
    }
}


function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const formSections = document.querySelectorAll('.form-section');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remover clase active de todos
            tabButtons.forEach(b => b.classList.remove('active'));
            formSections.forEach(s => s.classList.remove('active'));
            
            // Agregar clase active al seleccionado
            this.classList.add('active');
            document.getElementById(targetTab + '-section').classList.add('active');
            
            // Limpiar alertas
            document.getElementById('alertContainer').innerHTML = '';
        });
    });
}

function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        });
    });
}

function initFormListeners() {
    // Formulario de Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Formulario de Registro
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', handleRegistro);
    }
    
    // Link de "Olvidé mi contraseña"
    const forgotPassword = document.querySelector('.forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validar campos
    if (!email || !password) {
        mostrarAlerta('Por favor completa todos los campos', 'warning');
        return;
    }
    
    // Verificar si es el administrador
    if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
        iniciarSesion(ADMIN_USER, rememberMe);
        mostrarAlerta('¡Bienvenido Administrador!', 'success');
        
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
        return;
    }
    
    // Buscar usuario en la base de datos local
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (usuario) {
        iniciarSesion(usuario, rememberMe);
        mostrarAlerta(`¡Bienvenido de nuevo, ${usuario.nombre}!`, 'success');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    } else {
        mostrarAlerta('Correo o contraseña incorrectos', 'danger');
    }
}

function handleRegistro(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('registroNombre').value.trim();
    const email = document.getElementById('registroEmail').value.trim();
    const password = document.getElementById('registroPassword').value;
    const passwordConfirm = document.getElementById('registroPasswordConfirm').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    // Validaciones
    if (!nombre || !email || !password || !passwordConfirm) {
        mostrarAlerta('Por favor completa todos los campos', 'warning');
        return;
    }
    
    if (!acceptTerms) {
        mostrarAlerta('Debes aceptar los términos y condiciones', 'warning');
        return;
    }
    
    if (password.length < 6) {
        mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'warning');
        return;
    }
    
    if (password !== passwordConfirm) {
        mostrarAlerta('Las contraseñas no coinciden', 'danger');
        return;
    }
    
    // Validar formato de email
    if (!validarEmail(email)) {
        mostrarAlerta('Por favor ingresa un correo válido', 'warning');
        return;
    }
    
    // Verificar si el usuario ya existe
    if (usuarios.find(u => u.email === email)) {
        mostrarAlerta('Este correo ya está registrado', 'danger');
        return;
    }
    
    // Verificar que no use el email del admin
    if (email === ADMIN_USER.email) {
        mostrarAlerta('Este correo no está disponible', 'danger');
        return;
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = {
        id: Date.now(),
        nombre: nombre,
        email: email,
        password: password, // En producción, esto debería estar encriptado
        rol: 'cliente',
        fechaRegistro: new Date().toISOString()
    };
    
    // Agregar a la lista de usuarios
    usuarios.push(nuevoUsuario);
    guardarUsuarios();
    
    // Iniciar sesión automáticamente
    iniciarSesion(nuevoUsuario, true);
    
    mostrarAlerta('¡Cuenta creada exitosamente! Bienvenido a AURETTI', 'success');
    
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 2000);
}

function iniciarSesion(usuario, recordar) {
    // Guardar usuario en localStorage
    const datosUsuario = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        fechaLogin: new Date().toISOString()
    };
    
    localStorage.setItem('auretti_usuario', JSON.stringify(datosUsuario));
    
    if (recordar) {
        localStorage.setItem('auretti_recordar', 'true');
    }
    
    console.log('✅ Sesión iniciada:', datosUsuario);
}

function cerrarSesion() {
    localStorage.removeItem('auretti_usuario');
    localStorage.removeItem('auretti_recordar');
    console.log('🚪 Sesión cerrada');
}

function cargarUsuarios() {
    const usuariosGuardados = localStorage.getItem('auretti_usuarios');
    
    if (usuariosGuardados) {
        usuarios = JSON.parse(usuariosGuardados);
        console.log(`📋 ${usuarios.length} usuarios cargados`);
    } else {
        // Crear algunos usuarios de prueba
        usuarios = [
            {
                id: 1,
                nombre: 'Juan Pérez',
                email: 'juan@example.com',
                password: '123456',
                rol: 'cliente',
                fechaRegistro: new Date().toISOString()
            },
            {
                id: 2,
                nombre: 'María García',
                email: 'maria@example.com',
                password: '123456',
                rol: 'cliente',
                fechaRegistro: new Date().toISOString()
            }
        ];
        guardarUsuarios();
    }
}

function guardarUsuarios() {
    localStorage.setItem('auretti_usuarios', JSON.stringify(usuarios));
    console.log('💾 Usuarios guardados:', usuarios.length);
}

function handleForgotPassword() {
    const email = prompt('Ingresa tu correo electrónico:');
    
    if (!email) return;
    
    if (!validarEmail(email)) {
        alert(' Por favor ingresa un correo válido');
        return;
    }
    
    const usuario = usuarios.find(u => u.email === email);
    
    if (usuario) {
        alert(` Se ha enviado un enlace de recuperación a ${email}\n\n(Esta es una simulación. Tu contraseña es: ${usuario.password})`);
    } else {
        alert(' No existe ninguna cuenta con ese correo');
    }
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function mostrarAlerta(mensaje, tipo) {
    const alertContainer = document.getElementById('alertContainer');
    
    const tiposClases = {
        'success': 'alert-success',
        'danger': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    };
    
    const iconos = {
        'success': 'bi-check-circle-fill',
        'danger': 'bi-x-circle-fill',
        'warning': 'bi-exclamation-triangle-fill',
        'info': 'bi-info-circle-fill'
    };
    
    const alerta = document.createElement('div');
    alerta.className = `alert ${tiposClases[tipo] || 'alert-info'}`;
    alerta.innerHTML = `
        <i class="bi ${iconos[tipo] || 'bi-info-circle-fill'}" style="margin-right: 10px;"></i>
        ${mensaje}
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alerta);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        alerta.style.opacity = '0';
        alerta.style.transition = 'opacity 0.3s';
        setTimeout(() => alerta.remove(), 300);
    }, 5000);
}

window.cerrarSesion = cerrarSesion;