const formE1 = document.querySelector('.form');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordMatchSpan = document.getElementById('passwordMatch');
const submitBtn = document.getElementById('submitBtn');
const emailInput = document.getElementById('emailInput');

// Configuración de URLs
const RESTAPI = {
    resetCliente: "http://localhost:8080/api/resetCliente",
    getClienteByContacto: "http://localhost:8080/api/getClienteByContacto"  // NUEVO ENDPOINT
};

// Función para verificar si las contraseñas coinciden
function checkPasswordMatch() {
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (newPassword === '' && confirmPassword === '') {
        passwordMatchSpan.textContent = '';
        passwordMatchSpan.style.color = 'black';
        return false;
    }
    
    if (newPassword === confirmPassword) {
        passwordMatchSpan.textContent = '✓ Las contraseñas coinciden';
        passwordMatchSpan.style.color = 'green';
        return true;
    } else {
        passwordMatchSpan.textContent = '✗ Las contraseñas no coinciden';
        passwordMatchSpan.style.color = 'red';
        return false;
    }
}

// Event listeners para verificar coincidencia de contraseñas en tiempo real
newPasswordInput.addEventListener('input', checkPasswordMatch);
confirmPasswordInput.addEventListener('input', checkPasswordMatch);

// Función para verificar si el email existe en la base de datos
async function checkEmailExists(email) {
    if (!email || email.length < 5) {
        return false;
    }

    try {
        const checkData = {
            contacto: email
        };

        const checkOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkData),
        };

        const response = await fetch(RESTAPI.getClienteByContacto, checkOptions);

        if (response.ok) {
            const data = await response.json();
            return data.response === "OK"; // El cliente existe
        } else {
            return false; // El cliente no existe
        }
    } catch (error) {
        console.error('Error verificando email:', error);
        return false;
    }
}

formE1.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(formE1);
    const data = Object.fromEntries(formData);
    
    console.log('Datos del formulario:');
    console.log(data);

    // Validaciones
    const resultadoEl = document.getElementById('resultado');
    
    // Validar que las contraseñas coincidan
    if (!checkPasswordMatch()) {
        resultadoEl.style.color = "RED";
        resultadoEl.textContent = 'Las contraseñas no coinciden';
        return;
    }

    // Validar que el email exista en la base de datos
    const emailExists = await checkEmailExists(data.email);
    if (!emailExists) {
        resultadoEl.style.color = "RED";
        resultadoEl.textContent = 'El email no está registrado en el sistema';
        return;
    }

    // Preparar datos para el servidor - AHORA ENVIAMOS contacto EN LUGAR DE id
    const resetData = {
        contacto: data.email,      // CAMBIADO: id -> contacto
        password: data.newPassword
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetData),
    };

    console.log("Enviando datos al servidor:");
    console.log("URL:", RESTAPI.resetCliente);
    console.log("Datos:", resetData);

    // Deshabilitar el botón para evitar múltiples envíos
    submitBtn.disabled = true;
    submitBtn.textContent = 'Procesando...';

    // Enviar solicitud al servidor
    fetch(RESTAPI.resetCliente, options)
        .then(res => {
            if (!res.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return res.json();
        })
        .then(response => {
            console.log("Respuesta del servidor:", response);
            
            if (response.response === 'OK') {
                resultadoEl.style.color = "GREEN";
                resultadoEl.textContent = 'Contraseña restablecida exitosamente. Redirigiendo al login...';
                
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    window.location.href = "loginClient.html";
                }, 2000);
            } else {
                resultadoEl.style.color = "RED";
                resultadoEl.textContent = response.message || 'Error al restablecer la contraseña';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Restablecer Contraseña';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultadoEl.style.color = "RED";
            resultadoEl.textContent = 'Error de conexión con el servidor';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Restablecer Contraseña';
        });
});