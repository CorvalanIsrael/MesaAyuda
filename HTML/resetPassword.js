const formE1 = document.querySelector('.form');

// Función para mostrar mensajes al usuario
function mostrarMensaje(mensaje, tipo) {
    const resultadoEl = document.getElementById('resultado');
    resultadoEl.style.color = tipo === 'error' ? 'RED' : 'GREEN';
    resultadoEl.textContent = mensaje;
}

// Validación en tiempo real de contraseñas
document.getElementById('newPassword').addEventListener('input', validarContraseñas);
document.getElementById('confirmPassword').addEventListener('input', validarContraseñas);

function validarContraseñas() {
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const mensajeElemento = document.getElementById('passwordMatch');
    
    if (confirmPassword === '') {
        mensajeElemento.textContent = '';
        mensajeElemento.style.color = 'black';
        return;
    }
    
    if (password === confirmPassword) {
        mensajeElemento.textContent = '✓ Las contraseñas coinciden';
        mensajeElemento.style.color = 'green';
    } else {
        mensajeElemento.textContent = '✗ Las contraseñas no coinciden';
        mensajeElemento.style.color = 'red';
    }
}

formE1.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(formE1);
    const data = Object.fromEntries(formData);
    
    console.log('Datos del formulario reset password:');
    console.log(data);

    // Validaciones frontend
    if (data.newPassword !== data.confirmPassword) {
        mostrarMensaje('Las contraseñas no coinciden', 'error');
        return;
    }

    // if (data.newPassword.length < 6) {
    //     mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
    //     return;
    // }

    // Configuración de API
    const RESTAPI = {
        resetCliente: "http://localhost:8080/api/resetCliente"
    };

    // Preparar datos para el servidor
    const resetData = {
        "contacto": data.email,
        "password": data.newPassword
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetData),
    };

    console.log("Enviando solicitud de reset password:");
    console.log("URL:", RESTAPI.resetCliente);
    console.log("Datos:", resetData);

    // Deshabilitar botón durante la solicitud
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Procesando...';

    try {
        // Enviar solicitud al servidor
        const response = await fetch(RESTAPI.resetCliente, options);
        
        // Intentar parsear la respuesta como JSON
        let responseData;
        try {
            responseData = await response.json();
        } catch (parseError) {
            console.error('Error parseando respuesta JSON:', parseError);
            throw new Error('Error en la respuesta del servidor: formato inválido');
        }

        console.log("Respuesta completa del servidor:", responseData);

        if (!response.ok) {
            // Error HTTP (4xx, 5xx)
            const errorMessage = responseData.message || 
                                responseData.response || 
                                `Error del servidor: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }

        if (responseData.response === 'OK') {
            mostrarMensaje('Contraseña restablecida exitosamente. Redirigiendo al login...', 'success');
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                window.location.href = "loginClient.html";
            }, 2000);
        } else {
            // Servidor respondió con ERROR pero status 200
            throw new Error(responseData.message || 'Error al restablecer la contraseña');
        }

    } catch (error) {
        console.error('Error en reset password:', error);
        
        // Clasificar y mostrar el error adecuadamente
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            mostrarMensaje('Error de conexión: No se pudo contactar al servidor. Verifique su conexión a internet.', 'error');
        } else if (error.message.includes ('NetworkError when attempting to fetch')) {
            mostrarMensaje('error de conexión con el servidor', 'error');
        } else if (error.message.includes('Cliente no existe')) {
            mostrarMensaje('Error: El email proporcionado no está registrado en el sistema.', 'error');
        } else if (error.message.includes('Contacto no informado')) {
            mostrarMensaje('Error: Debe proporcionar un email válido.', 'error');
        } else if (error.message.includes('Password no informada')) {
            mostrarMensaje('Error: La contraseña no puede estar vacía.', 'error');
        } else if (error.message.includes('DB access error')) {
            mostrarMensaje('Error temporal del sistema. Por favor, intente nuevamente.', 'error');
        } else {
            mostrarMensaje(error.message || 'Error desconocido al restablecer la contraseña', 'error');
        }
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = 'Restablecer Contraseña';
    }
});