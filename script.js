function redirigir(url) {
    window.open(url, '_blank');
}

// Función para actualizar y guardar el estado de pago
function actualizarEstado(servicio, estado) {
    // Guardar en localStorage
    localStorage.setItem('estado_' + servicio, estado);
    
    // Actualizar la apariencia de la tarjeta y el botón
    const card = document.querySelector(`select[onchange*="${servicio}"]`).closest('.card');
    const boton = card.querySelector('.pago-btn');
    
    if (estado === 'pagado') {
        card.classList.add('pagado');
        boton.style.display = 'none'; // Ocultar el botón
    } else {
        card.classList.remove('pagado');
        boton.style.display = 'block'; // Mostrar el botón
    }

}

// Función para cargar los estados guardados al cargar la página
function cargarEstados() {
    const servicios = ['claro', 'chilquinta', 'esval', 'agua', 'mundo', 'entel', 'movistar', 'wom'];
    
    servicios.forEach(servicio => {
        const estadoGuardado = localStorage.getItem('estado_' + servicio);
        const selector = document.querySelector(`select[onchange*="${servicio}"]`);
        
        if (estadoGuardado && selector) {
            selector.value = estadoGuardado;
            
            // Actualizar la apariencia de la tarjeta según el estado guardado
            const card = selector.closest('.card');
            const boton = card.querySelector('.pago-btn');
            
            if (estadoGuardado === 'pagado') {
                card.classList.add('pagado');
                boton.style.display = 'none'; // Ocultar el botón
            } else {
                card.classList.remove('pagado');
                boton.style.display = 'block'; // Mostrar el botón
            }
        }
    });
}

// Funciones para el historial de pagos
function guardarEnHistorial(servicio, estado) {
    if (estado !== 'pagado') return; // Solo guardamos cuando se marca como pagado
    
    const ahora = new Date();
    const registro = {
        servicio: servicio,
        fecha: ahora.toISOString(),
        timestamp: ahora.getTime()
    };
    
    // Obtener historial existente o inicializar uno nuevo
    let historial = JSON.parse(localStorage.getItem('historial_pagos')) || [];
    
    // Agregar nuevo registro al inicio del array
    historial.unshift(registro);
    
    // Guardar en localStorage
    localStorage.setItem('historial_pagos', JSON.stringify(historial));
    
    // Actualizar la visualización si el modal está abierto
    if (document.getElementById('modalHistorial').style.display === 'block') {
        mostrarHistorial();
    }
}

function mostrarHistorial() {
    const listaHistorial = document.getElementById('listaHistorial');
    const filtroServicio = document.getElementById('filtroServicio').value;
    
    // Obtener historial
    let historial = JSON.parse(localStorage.getItem('historial_pagos')) || [];
    
    // Filtrar por servicio si es necesario
    if (filtroServicio !== 'todos') {
        historial = historial.filter(item => item.servicio === filtroServicio);
    }
    
    // Generar HTML
    if (historial.length === 0) {
        listaHistorial.innerHTML = '<div class="vacio">No hay registros de pagos</div>';
        return;
    }
    
    listaHistorial.innerHTML = historial.map(item => {
        const fecha = new Date(item.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Obtener nombre del servicio para mostrar
        const nombresServicios = {
            'claro': 'Claro Chile',
            'chilquinta': 'Chilquinta',
            'esval': 'Esval',
            'agua': 'Los Maitenes',
            'mundo': 'Mundo Pacífico',
            'entel': 'Entel',
            'movistar': 'Movistar',
            'wom': 'Wom'
        };
        
        const nombreServicio = nombresServicios[item.servicio] || item.servicio;
        
        return `
            <div class="item-historial pagado">
                <div class="info-pago">
                    <div class="servicio">${nombreServicio}</div>
                    <div class="fecha">${fechaFormateada}</div>
                </div>
                <div class="accion-historial" onclick="eliminarRegistro(${item.timestamp})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </div>
            </div>
        `;
    }).join('');
}

function eliminarRegistro(timestamp) {
    let historial = JSON.parse(localStorage.getItem('historial_pagos')) || [];
    historial = historial.filter(item => item.timestamp !== timestamp);
    localStorage.setItem('historial_pagos', JSON.stringify(historial));
    mostrarHistorial();
}

function limpiarHistorial() {
    if (confirm('¿Estás seguro de que quieres eliminar todo el historial de pagos? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('historial_pagos');
        mostrarHistorial();
    }
}

// Modificar la función actualizarEstado para que guarde en el historial
function actualizarEstado(servicio, estado) {
    // Guardar en localStorage
    localStorage.setItem('estado_' + servicio, estado);
    
    // Guardar en historial si se marcó como pagado
    if (estado === 'pagado') {
        guardarEnHistorial(servicio, estado);
    }
    
    // Actualizar la apariencia de la tarjeta y el botón
    const card = document.querySelector(`select[onchange*="${servicio}"]`).closest('.card');
    const boton = card.querySelector('.pago-btn');
    
    if (estado === 'pagado') {
        card.classList.add('pagado');
        boton.style.display = 'none'; // Ocultar el botón
    } else {
        card.classList.remove('pagado');
        boton.style.display = 'block'; // Mostrar el botón
    }
}

// Eventos para el modal de historial
document.addEventListener('DOMContentLoaded', function() {
    // Botón flotante
    document.getElementById('btnHistorial').addEventListener('click', function() {
        document.getElementById('modalHistorial').style.display = 'block';
        mostrarHistorial();
    });
    
    // Cerrar modal
    document.querySelector('.cerrar').addEventListener('click', function() {
        document.getElementById('modalHistorial').style.display = 'none';
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('modalHistorial')) {
            document.getElementById('modalHistorial').style.display = 'none';
        }
    });
    
    // Filtro de servicio
    document.getElementById('filtroServicio').addEventListener('change', mostrarHistorial);
    
    // Limpiar historial
    document.getElementById('limpiarHistorial').addEventListener('click', limpiarHistorial);
});

// Cargar estados cuando la página se carga
window.onload = function() {
    cargarEstados();
};