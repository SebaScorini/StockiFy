import * as api from './api.js';
document.addEventListener('DOMContentLoaded', () => {
    const formConfig = document.getElementById('form-micuenta');
    const btnGuardar = document.getElementById('btn-guardar');

    const valuesIniciales = {};

    const inputs = formConfig.querySelectorAll('input:not([disabled])');

    inputs.forEach(input => {
        valuesIniciales[input.name] = input.value;
    });

    formConfig.addEventListener('input', () =>{
        let formModificado = false;

        inputs.forEach(input => {
          if (input.value !== valuesIniciales[input.name]) {
              formModificado = true;
          }
        });

        if (formModificado){
            btnGuardar.disabled = false;
        }
        else{
            btnGuardar.disabled = true;
        }
    })

    formConfig.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userName = document.getElementById('username').value;

        const response = await api.verifyUserName(userName);
        if (!response.success) return;

        const userNameExists = response.exists;
        const formError = document.getElementById('form-error');

        if (userNameExists) {formError.innerHTML = 'Ese nombre de usuario ya existe'; return;}

        const userFullName = document.getElementById('nombre').value;
        const userEmail = document.getElementById('email').value;
        const userPassword = document.getElementById('contraseña').value;

        let passWordType = 'hash';
        if (userPassword !== valuesIniciales['password']){
            passWordType = 'number';
        }

        const userData = {
            full_name: userFullName,
            username: userName,
            email: userEmail,
            password: userPassword,
            passwordType: passWordType
        }

        const result = await api.updateUser(userData);

        if (!result.success){formError.innerHTML = 'Ocurrio un error interno al intentar guardar los cambios'; return;}

        window.location.href = 'configuracion.php';
    })
})