function redirigir(url) {
    window.open(url, '_blank');
}

function actualizarEstado(servicio, estado) {
    localStorage.setItem('estado_' + servicio, estado);

    const card = document.querySelector(`select[onchange*="${servicio}"]`).closest('.card');
    const boton = card.querySelector('.pago-btn');

    if (estado === 'pagado') {
        card.classList.add('pagado');
        boton.style.display = 'none';
        guardarEnHistorial(servicio, estado);
    } else {
        card.classList.remove('pagado');
        boton.style.display = 'block';
    }
}
function cargarEstados() {
    const servicios = ['chilquinta','agua', 'mundo', 'entel', 'movistar',];
    
    servicios.forEach(servicio => {
        const estadoGuardado = localStorage.getItem('estado_' + servicio);
        const selector = document.querySelector(`select[onchange*="${servicio}"]`);
        
        if (estadoGuardado && selector) {
            selector.value = estadoGuardado;

            const card = selector.closest('.card');
            const boton = card.querySelector('.pago-btn');
            const customSelect = card.querySelector('.select-selected');
            
            if (estadoGuardado === 'pagado') {
                card.classList.add('pagado');
                boton.style.display = 'none';
                customSelect.textContent = 'Pagado';
            } else {
                card.classList.remove('pagado');
                boton.style.display = 'block';
                customSelect.textContent = 'Pendiente';
            }
        }
    });
}

function guardarEnHistorial(servicio, estado) {
    if (estado !== 'pagado') return;
    
    const ahora = new Date();
    const registro = {
        servicio,
        fecha: ahora.toISOString(),
        timestamp: ahora.getTime()
    };

    let historial = JSON.parse(localStorage.getItem('historial_pagos')) || [];
    historial.unshift(registro);
    localStorage.setItem('historial_pagos', JSON.stringify(historial));

    if (document.getElementById('modalHistorial').style.display === 'block') {
        mostrarHistorial();
    }
}

function mostrarHistorial() {
    const listaHistorial = document.getElementById('listaHistorial');
    const filtroServicio = document.getElementById('filtroServicio').value;
    let historial = JSON.parse(localStorage.getItem('historial_pagos')) || [];
    
    if (filtroServicio !== 'todos') {
        historial = historial.filter(item => item.servicio === filtroServicio);
    }
    
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

        const nombresServicios = {
            'chilquinta': 'Chilquinta',
            'agua': 'Los Maitenes',
            'mundo': 'Mundo Pacífico',
            'entel': 'Entel',
            'movistar': 'Movistar',
            
        };

        return `
            <div class="item-historial pagado">
                <div class="info-pago">
                    <div class="servicio">${nombresServicios[item.servicio] || item.servicio}</div>
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
    if (confirm('¿Seguro que quieres eliminar todo el historial?')) {
        localStorage.removeItem('historial_pagos');
        mostrarHistorial();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const customSelects = document.querySelectorAll('.custom-select');

    customSelects.forEach(select => {
        const selectElement = select.querySelector('select');
        const selectedDiv = select.querySelector('.select-selected');
        const itemsContainer = select.querySelector('.select-items');

        selectedDiv.textContent = selectElement.options[selectElement.selectedIndex].text;

        selectedDiv.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAllSelect(this);
            this.nextElementSibling.style.display = 'block';
            this.classList.add('select-arrow-active');
        });

        itemsContainer.querySelectorAll('.select-item').forEach(item => {
            item.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                const text = this.textContent;
                selectElement.value = value;
                selectedDiv.textContent = text;
                itemsContainer.style.display = 'none';
                selectedDiv.classList.remove('select-arrow-active');
                selectElement.dispatchEvent(new Event('change'));
            });
        });
    });

    document.addEventListener('click', closeAllSelect);

    function closeAllSelect(elmnt) {
        const items = document.querySelectorAll('.select-items');
        const selected = document.querySelectorAll('.select-selected');

        for (let i = 0; i < selected.length; i++) {
            if (elmnt !== selected[i] && elmnt !== selected[i].previousElementSibling) {
                selected[i].classList.remove('select-arrow-active');
            }
        }

        for (let i = 0; i < items.length; i++) {
            if (elmnt !== items[i] && elmnt !== items[i].previousElementSibling) {
                items[i].style.display = 'none';
            }
        }
    }

    document.getElementById('btnHistorial').addEventListener('click', function() {
        document.getElementById('modalHistorial').style.display = 'block';
        mostrarHistorial();
    });

    document.querySelector('.cerrar').addEventListener('click', function() {
        document.getElementById('modalHistorial').style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('modalHistorial')) {
            document.getElementById('modalHistorial').style.display = 'none';
        }
    });

    document.getElementById('filtroServicio').addEventListener('change', mostrarHistorial);
    document.getElementById('limpiarHistorial').addEventListener('click', limpiarHistorial);

    cargarEstados();
});
