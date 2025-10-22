const formE1 = document.querySelector('.form');

formE1.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(formE1);
    const data = Object.fromEntries(formData);
    
    console.log('Datos del formulario:');
    console.log(data);

    // Validaciones
    const resultadoEl = document.getElementById('resultado');
    
    // Validar contraseña
    if (data.password.length < 8) {
        resultadoEl.style.color = "RED";
        resultadoEl.textContent = 'La contraseña debe tener al menos 8 caracteres';
        return;
    }

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
        "nombre": `${data.nombre} ${data.apellido}`
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
            if (!res.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return res.json();
        })
        .then(response => {
            console.log("Respuesta del servidor:", response);
            
            if (response.response === 'OK') {
                resultadoEl.style.color = "GREEN";
                resultadoEl.textContent = 'Registro exitoso. Redirigiendo al login...';
                
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    window.location.href = "loginClient.html";
                }, 2000);
            } else {
                resultadoEl.style.color = "RED";
                resultadoEl.textContent = response.message || 'Error en el registro';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultadoEl.style.color = "RED";
            resultadoEl.textContent = 'Error de conexión con el servidor';
        });
});