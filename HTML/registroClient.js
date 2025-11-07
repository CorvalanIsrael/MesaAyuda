const formE1 = document.querySelector('.form');

// =============================================
// FUNCIONES MEJORADAS PARA CARGA DE EMAIL
// =============================================

// Función para cargar email pendiente
// Función para cargar email pendiente CON LOGS DE DIAGNÓSTICO
function loadPendingEmail() {
    try {
        console.log('🔍 Buscando datos en sessionStorage...');
        const pendingData = sessionStorage.getItem('pendingRegistration');
        console.log('📦 Datos encontrados en sessionStorage:', pendingData);
        
        if (pendingData) {
            const registration = JSON.parse(pendingData);
            console.log('📋 Datos parseados:', registration);
            
            const now = Date.now();
            const tenMinutes = 10 * 60 * 1000;
            
            // Verificar que no haya expirado (10 minutos)
            if (now - registration.timestamp < tenMinutes) {
                const emailInput = document.getElementById('email');
                console.log('🎯 Campo email encontrado:', emailInput);
                
                if (emailInput) {
                    emailInput.value = registration.email;
                    console.log('✅ Email prellenado:', registration.email);
                    
                    // Mejorar UX: enfocar campo de contraseña
                    setTimeout(() => {
                        const passwordInput = document.querySelector('input[type="password"]');
                        if (passwordInput) {
                            passwordInput.focus();
                            console.log('🎯 Campo contraseña enfocado');
                        }
                    }, 100);
                    
                    return true;
                } else {
                    console.log('❌ No se encontró el campo email con id="email"');
                }
            } else {
                // Limpiar si expiró
                console.log('⏰ Datos expirados, limpiando...');
                sessionStorage.removeItem('pendingRegistration');
            }
        } else {
            console.log('❌ No hay datos pendientes en sessionStorage');
        }
        
        return false;
    } catch (error) {
        console.error('💥 Error cargando email pendiente:', error);
        return false;
    }
}

// Al cargar la página, con logs adicionales
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página de registro cargada - iniciando carga de email...');
    const resultado = loadPendingEmail();
    console.log('📊 Resultado de carga de email:', resultado);
});
// Función para limpiar datos pendientes después de registro exitoso
function clearPendingRegistration() {
    sessionStorage.removeItem('pendingRegistration');
}

// =============================================
// EJECUCIÓN AL CARGAR LA PÁGINA
// =============================================

// Al cargar la página, intentar cargar el email pendiente
document.addEventListener('DOMContentLoaded', function() {
    loadPendingEmail();
});

// =============================================
// MANEJADOR DEL FORMULARIO (EXISTENTE - MODIFICADO)
// =============================================

formE1.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(formE1);
    const data = Object.fromEntries(formData);
    
    console.log('Datos del formulario:');
    console.log(data);

    // Validaciones
    const resultadoEl = document.getElementById('resultado');
    
    // Validar contraseña
    // if (data.password.length < 8) {
    //     resultadoEl.style.color = "RED";
    //     resultadoEl.textContent = 'La contraseña debe tener al menos 8 caracteres';
    //     return;
    // }

    // Validar términos y condiciones
    if (data.termscondition !== 'on') {
        resultadoEl.style.color = "RED";
        resultadoEl.textContent = 'Debe aceptar los términos y condiciones';
        return;
    }

    // Configuración de URLs
    const RESTAPI = {
        addCliente: "http://localhost:8080/api/addCliente"
    };

    // Preparar datos para el servidor
    const nuevoCliente = {
        "contacto": data.email,
        "password": data.password,
        "nombre"  : data.nombre
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoCliente),
    };

    console.log("Enviando datos al servidor:");
    console.log("URL:", RESTAPI.addCliente);
    console.log("Datos:", nuevoCliente);

    // Enviar solicitud al servidor
    fetch(RESTAPI.addCliente, options)
        .then(res => {
            // Primero intentamos leer la respuesta como JSON para obtener el mensaje de error del servidor
            return res.json().then(responseData => {
                if (!res.ok) {
                    // Si el status no es OK, lanzamos error con el mensaje del servidor
                    throw new Error(responseData.message || `Error del servidor: ${res.status} ${res.statusText}`);
                }
                return responseData;
            });
        })
        .then(response => {
            console.log("Respuesta del servidor:", response);
            
            if (response.response === 'OK') {
                resultadoEl.style.color = "GREEN";
                resultadoEl.textContent = 'Registro exitoso. Redirigiendo al login...';
                
                // =============================================
                // NUEVO: LIMPIAR DATOS PENDIENTES DESPUÉS DE REGISTRO EXITOSO
                // =============================================
                clearPendingRegistration();
                
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    window.location.href = "loginClient.html";
                }, 2000);
            } else {
                // Manejar caso donde el servidor responde con ERROR pero status 200
                resultadoEl.style.color = "RED";
                resultadoEl.textContent = response.message || 'Error en el registro';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultadoEl.style.color = "RED";
            resultadoEl.textContent = error.message || 'Error de conexión con el servidor';
        });
});