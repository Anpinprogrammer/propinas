let cliente = {
    mesa: '',
    hora: '',
    pedido: []
};

const categorias = {
    1: 'Comidas',
    2: 'Bebidas',
    3: 'Postres'
}

let totalPedido = [];

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    //Forma nueva de validar los campos
    const camposVacios = [ mesa, hora ].some( campo => campo === '' );//Retorna un boolean

    if(camposVacios){
        const existeAlerta = document.querySelector('.invalid-feedback');

        if(!existeAlerta){
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);

            setTimeout(() => {
                alerta.remove();
            }, 3000);
        }
        
        return;
    } 

    //Asignar datos del formulario al objeto de cliente
    cliente = {...cliente, mesa, hora};

    //Ocultar modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();


    obtenerPlatillos();
}

function mostrarSecciones() {
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach( seccion => seccion.classList.remove('d-none'));
}

function obtenerPlatillos() {
    const url = 'http://localhost:4000/platillos';

    fetch(url)
        .then( res => res.json())
        .then( platillos => mostrarPlatillos(platillos) )
        .catch( error => console.log(error));//Usamos el catch para que nos de visibilidad en consola a los errores si los hay
}

function mostrarPlatillos(platillosObj) {
    const contenido = document.querySelector('#platillos .modal-dialog .modal-content .modal-body .contenido');

    platillosObj.forEach(platillo => {
        const { categoria, id, nombre, precio } = platillo;

        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        const nombrePlatillo = document.createElement('DIV');
        nombrePlatillo.classList.add('col-md-4');
        nombrePlatillo.textContent = nombre;

        const precioPlatillo = document.createElement('DIV');
        precioPlatillo.classList.add('col-md-3', 'fw-bold');
        precioPlatillo.textContent = `$${precio}`;

        const categoriaPlatillo = document.createElement('DIV');
        categoriaPlatillo.classList.add('col-md-3');
        categoriaPlatillo.textContent = categorias[categoria];//Toma las categorias del objeto de categorias para mostrar la informacion mas clara en la pantalla

        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${id}`;
        inputCantidad.classList.add('form-control');

        //Funcion que detecta la cantidad y el platillo que se esta agregando
        inputCantidad.onchange = () => {

            const cantidad = parseInt( inputCantidad.value );
            agregarPlatillo({...platillo, cantidad});//Manda a llamar funcion con el evento de cambio en el input
        }
            

        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);

        row.appendChild(nombrePlatillo);
        row.appendChild(precioPlatillo);
        row.appendChild(categoriaPlatillo);
        row.appendChild(agregar);

        contenido.appendChild(row);
        
    });

    const btnVerResumen = document.querySelector('#ver-resumen');
    btnVerResumen.onclick = ocultarModalResumen;
}

function ocultarModalResumen() {
    //Ocultar modal
    const modalFormulario = document.querySelector('#platillos');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    //Mostrar Secciones
    mostrarSecciones();
}

function agregarPlatillo(obj) {

    // Extraer el pedido actual
    let { pedido } = cliente;

    //Revisar que la cantidad sea mayor a 0
    if(obj.cantidad > 0) {
        
        //Comprueba si el elemento ya existe en el array
        if( pedido.some( articulo => articulo.id === obj.id ) ) {
            //El articulo ya existe, actualizar la cantidad
            const pedidoActualizado = pedido.map( articulo => {
                if( articulo.id === obj.id ){
                    articulo.cantidad = obj.cantidad;
                }

                return articulo;
            } );
            //Se asigna el nuevo array a cliente.pedido
            cliente.pedido = [...pedidoActualizado];
        } else {
            cliente.pedido = [...pedido, obj];
        }
        
    } else {
        const resultado = pedido.filter( articulo => articulo.id !== obj.id);
        cliente.pedido = [...resultado];
    }

    //Limpiar el codigo HTML previo
    limpiarHTML();

    if(cliente.pedido.length) {
       //Mostrar el resumen 
       actualizarResumen();
    }else{
        mensajePedidoVacio();
    }

    
}

function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

    //Informacion de la mesa 
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    //Informacion de la hora 
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    //Agregar a los elementos padre
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    //Titulo de la seccion
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos Consumidos';
    heading.classList.add('my-4', 'text-center');

    //Iterar sobre el array de pedidos
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const { pedido } = cliente;
    pedido.forEach( articulo => {
        const { nombre, cantidad, precio, id } = articulo;

        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        //Nombre
        const nombreEl = document.createElement('H4');
        nombreEl.classList.add('my-4');
        nombreEl.textContent = nombre;

        //Cantidad
        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        //Precio
        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;

        //Subtotal
        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = `$${precio * cantidad}`;

        //Boton eliminar
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del Pedido';

        btnEliminar.onclick = () => {
            eliminarProducto(id);
        }

        //Agregar valores a los contenedores
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);

        //Agregamos al LI
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        // Agrega al grupo principal
        grupo.appendChild(lista);
    } )

    //Agregar al contenido
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    //Mostrar formulario de propinas
    formularioPropinas();

}

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido')

    while(contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
}

function eliminarProducto(id){
    const { pedido } = cliente;
    const resultado = pedido.filter( articulo => articulo.id !== id);
    cliente.pedido = [...resultado];

    limpiarHTML();

    if(cliente.pedido.length) {
        //Mostrar el resumen 
        actualizarResumen();
     }else{
         mensajePedidoVacio();
     }

    //El producto se elimino, por lo tanto regresamos la cantidad a 0
    const productoEliminado = `#producto-${id}`;
    const productoEliminadoHTML = document.querySelector(productoEliminado); 
    productoEliminadoHTML.value = 0;
}

function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido');
   
    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(texto);

}

function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('DIV');
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    // Radio button sin propina
    const radio = document.createElement('INPUT');
    radio.type = 'radio';
    radio.name = 'propina';
    radio.value = "0";
    radio.classList.add('form-check-input');
    radio.onclick = calularPropina;

    const radioLabel = document.createElement('LABEL');
    radioLabel.textContent = 'Sin Propina';
    radioLabel.classList.add('form-check-label');

    const radioDiv = document.createElement('DIV');
    radioDiv.classList.add('form-check');

    radioDiv.appendChild(radio);
    radioDiv.appendChild(radioLabel);

    // Radio button 10
    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = "10";
    radio10.classList.add('form-check-input');
    radio10.onclick = calularPropina;

    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    // Radio button 25
    const radio25 = document.createElement('INPUT');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = "25";
    radio25.classList.add('form-check-input');
    radio25.onclick = calularPropina;

    const radio25Label = document.createElement('LABEL');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    // Radio button 50
    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = "50";
    radio50.classList.add('form-check-input');
    radio50.onclick = calularPropina;

    const radio50Label = document.createElement('LABEL');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    //Agregamos al div principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radioDiv);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);

    //Agregamos al formulario
    formulario.appendChild(divFormulario);

    contenido.append(formulario);
}

function calularPropina() {
    const { pedido } = cliente;
    let subtotal = 0;

    //Calcular el subtotal a pagar
    pedido.forEach( articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });

    //Seleccionar el radio button con la propina seleccionada por el cliente 
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    //Calcular la propina 
    const propina = ((subtotal * parseInt( propinaSeleccionada )) / 100 );

    //Calcular el total a pagar
    const total = subtotal + propina;

    mostrarTotalHTML( subtotal, total, propina);
}

function mostrarTotalHTML( subtotal, total, propina ){

    const formulario = document.querySelector('.formulario > div');
    console.log(formulario);

    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar');

    //Subtotal
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;

    subtotalParrafo.appendChild(subtotalSpan);

    //Propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    propinaParrafo.textContent = 'Propina Voluntaria: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;

    propinaParrafo.appendChild(propinaSpan);

    //Subtotal
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    totalParrafo.textContent = 'Total Consumo: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParrafo.appendChild(totalSpan);

    //Boton de finalizar pedido
    const divBtnFinalizar = document.createElement('DIV');
    divBtnFinalizar.classList.add('d-flex', 'mt-4', 'justify-content-center');

    const btnFinalizar = document.createElement('BUTTON');
    btnFinalizar.type = 'button';
    btnFinalizar.classList.add('btn', 'btn-success');
    btnFinalizar.textContent = 'Finalizar Orden';

    btnFinalizar.onclick = () => {
        window.location.href = 'index.html';
    }

    //Eliminar calculo anterior
    const existeFormulario = document.querySelector('.total-pagar');
    if(existeFormulario){
        existeFormulario.remove();
    }

    //Agrega al Div
    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);
    divTotales.appendChild(btnFinalizar);

    

    formulario.appendChild(divTotales);
}
