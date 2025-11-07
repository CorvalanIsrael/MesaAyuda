const formE1 = document.querySelector('.form');

formE1.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(formE1);
    const data = Object.fromEntries(formData);
    console.log('Application Server: Revisa el valor del form:');
    console.log(data);

    document.getElementById('registroLink').style.display = 'none';

    if (data.contacto == '' || data.password == '') {
        document.getElementById('resultado1').style.color = 'RED';
        document.getElementById('resultado1').style.textAlign = 'center';
        document.getElementById('resultado1').textContent = 'Debe informar usuario y password para completar el acceso';
        return;
    }

    if (data.contacto == 'pec') {
        document.getElementById('resultado2').style.color = 'RED';
        document.getElementById('resultado2').style.textAlign = 'center';
        document.getElementById('resultado2').textContent = 'El usuario <pec> no es bienvenido en éste sistema';
        return;
    }
    
    if (data.termscondition != 'on') {
        document.getElementById('resultado2').style.textAlign = 'center';
        document.getElementById('resultado2').style.color = 'RED';
        document.getElementById('resultado2').textContent = 'Debe aceptar los T&C para poder usar el sistema';
        return;
    }

    const systemURL = {
        listarTicket: 'http://127.0.0.1:5500/HTML/listarTicket.html',
        loginCliente: 'http://127.0.0.1:5500/HTML/loginClient.html',
    };

    const RESTAPI = {
        loginCliente: 'http://localhost:8080/api/loginCliente',
        listarTicket: 'http://localhost:8080/api/listarTicket',
    };

    const MODE = 'LOCAL';

    if (MODE == 'LOCAL') {
        const login = {
            contacto: data.contacto,
            password: data.password
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(login),
        };

        console.log('API REST:' + RESTAPI.loginCliente);
        console.log(login);
        var API = RESTAPI.loginCliente;
        var APIoptions = options;
    }

    fetch(`${API}`, APIoptions)
        .then((res) => {
            return res.json();
        })
        .then((users) => {
            console.log('Datos en respuesta del application server=' + JSON.stringify(users));
            if (users.response == 'OK') {
                console.log('La password es correcta');
                window.location.href =
                    systemURL.listarTicket +
                    '?id=' + users.id +
                    '&contacto=' + users.contacto +
                    '&nombre=' + users.nombre +
                    '&fecha_ultimo_ingreso=' + users.fecha_ultimo_ingreso +
                    '&mode=' + MODE;
            } else {
                document.getElementById('resultado1').style.color = 'RED';
                document.getElementById('resultado1').textContent = 'Error de login, intente nuevamente';
                document.getElementById('registroLink').style.display = 'block';
                
                // ===== CÓDIGO NUEVO PARA GUARDAR EN SESSIONSTORAGE =====
                console.log('⚠️ Error de login - intentando guardar email:', data.contacto);
                
                // Guardar el email en sessionStorage
                if (data.contacto) {
                    const registrationData = {
                        email: data.contacto,
                        timestamp: Date.now(),
                        source: 'failed_login'
                    };
                    sessionStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
                    
                    console.log('✅ Email guardado en sessionStorage:', registrationData);
                    console.log('✅ sessionStorage actual:', sessionStorage.getItem('pendingRegistration'));
                } else {
                    console.log('❌ No hay contacto para guardar');
                }
            }
        })
        .catch((error) => {
            console.error('Error en la solicitud:', error);
            document.getElementById('resultado1').style.color = 'RED';
            document.getElementById('resultado1').textContent = 'Error de conexión con el servidor';
            document.getElementById('registroLink').style.display = 'block';
            
            // ===== CÓDIGO NUEVO PARA GUARDAR EN SESSIONSTORAGE EN CASO DE ERROR =====
            console.log('⚠️ Error de conexión - intentando guardar email:', data.contacto);
            
            // Guardar el email en sessionStorage también en caso de error de conexión
            if (data.contacto) {
                const registrationData = {
                    email: data.contacto,
                    timestamp: Date.now(),
                    source: 'connection_error'
                };
                sessionStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
                
                console.log('✅ Email guardado en sessionStorage:', registrationData);
            }
        });
}); // <-- ESTA ES LA LLAVE DE CIERRE DEL addEventListener - NO LA BORRES
// 		.catch((error) => {
// 			console.error('Error en la solicitud:', error);
// 			document.getElementById('resultado1').style.color = 'RED';
// 			document.getElementById('resultado1').textContent = 'Error de conexión con el servidor';
			
// 			// Mostrar el enlace de registro también en caso de error de conexión
// 			document.getElementById('registroLink').style.display = 'block';
// 		});
// });