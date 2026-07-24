
const estadoFiltros = {
    categoria: 'todos',
    subcategoria: '',
    busqueda: '',
    precioMax: 100,
    orden: 'default'
};


let favoritos = JSON.parse(localStorage.getItem('favs_esmeraldas')) || [];


document.addEventListener('DOMContentLoaded', () => {
    actualizarFavoritosUI();
    
    // Escuchar el botón del header para abrir favoritos
    const btnFavs = document.getElementById('btnFavs');
    if (btnFavs) {
        btnFavs.addEventListener('click', abrirFavs);
    }

    // Escuchar evento de envío del formulario de registro
    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', validarFormulario);
    }

  
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.grupo')) {
            cerrarTodosSubmenus();
        }
    });
});


function toggleGrupo(idSubmenu) {
    const target = document.getElementById(idSubmenu);
    const estaAbierto = target.classList.contains('abierto');
    
    cerrarTodosSubmenus();

    if (!estaAbierto) {
        target.classList.add('abierto');
    }
}

function cerrarTodosSubmenus() {
    const submenus = document.querySelectorAll('.submenu');
    submenus.forEach(s => s.classList.remove('abierto'));
}


function filtrar(categoria, subcategoria = '') {
    estadoFiltros.categoria = categoria;
    estadoFiltros.subcategoria = subcategoria;
    cerrarTodosSubmenus();
    aplicarFiltrosYOrden();
}


function buscar(texto) {
    estadoFiltros.busqueda = texto.trim().toLowerCase();
    aplicarFiltrosYOrden();
}


function filtrarPrecio(valor) {
    estadoFiltros.precioMax = parseFloat(valor);
    const lblPrecio = document.getElementById('lblPrecio');
    if (lblPrecio) {
        lblPrecio.textContent = valor >= 100 ? '$100+' : `$${valor}`;
    }
    aplicarFiltrosYOrden();
}


function reiniciarFiltros() {
    estadoFiltros.categoria = 'todos';
    estadoFiltros.subcategoria = '';
    estadoFiltros.busqueda = '';
    estadoFiltros.precioMax = 100;
    estadoFiltros.orden = 'default';

    document.getElementById('buscador').value = '';
    document.getElementById('ordenar').value = 'default';
    
    const rango = document.getElementById('rangoPrecio');
    if (rango) rango.value = 100;
    
    const lblPrecio = document.getElementById('lblPrecio');
    if (lblPrecio) lblPrecio.textContent = '$100+';

    aplicarFiltrosYOrden();
}


function aplicarFiltrosYOrden() {
    const tarjetas = Array.from(document.querySelectorAll('.tarjeta'));
    const bloques = document.querySelectorAll('.bloque');
    let visiblesCount = 0;


    tarjetas.forEach(tarjeta => {
        const cat = tarjeta.dataset.cat;
        const sub = tarjeta.dataset.sub;
        const precio = parseFloat(tarjeta.dataset.precio || 0);
        const nombre = tarjeta.dataset.nombre.toLowerCase();
        const desc = tarjeta.querySelector('p').textContent.toLowerCase();

        // Evaluación de reglas
        const coincideCat = (estadoFiltros.categoria === 'todos' || estadoFiltros.categoria === cat);
        const coincideSub = (!estadoFiltros.subcategoria || estadoFiltros.subcategoria === sub);
        const coincidePrecio = (precio <= estadoFiltros.precioMax);
        const coincideBusqueda = (!estadoFiltros.busqueda || 
            nombre.includes(estadoFiltros.busqueda) || 
            desc.includes(estadoFiltros.busqueda));

        if (coincideCat && coincideSub && coincidePrecio && coincideBusqueda) {
            tarjeta.classList.remove('oculta');
            visiblesCount++;
        } else {
            tarjeta.classList.add('oculta');
        }
    });

   
    bloques.forEach(bloque => {
        const catBloque = bloque.dataset.cat;
        const tarjetasBloque = bloque.querySelectorAll('.tarjeta:not(.oculta)');
        
        if (estadoFiltros.categoria !== 'todos' && estadoFiltros.categoria !== catBloque) {
            bloque.style.display = 'none';
        } else if (tarjetasBloque.length === 0) {
            bloque.style.display = 'none';
        } else {
            bloque.style.display = 'block';
        }
    });

    const sinRes = document.getElementById('sinResultados');
    if (sinRes) {
        sinRes.style.display = (visiblesCount === 0) ? 'block' : 'none';
    }

    const contRes = document.getElementById('contResultados');
    if (contRes) {
        contRes.textContent = `${visiblesCount} emprendimientos`;
    }

    
    ordenarTarjetasVisibles();
    renderizarPildorasFiltros();
}



function ordenarPor(criterio) {
    estadoFiltros.orden = criterio;
    ordenarTarjetasVisibles();
}

function ordenarTarjetasVisibles() {
    const grillas = document.querySelectorAll('.grilla');

    grillas.forEach(grilla => {
        const tarjetas = Array.from(grilla.querySelectorAll('.tarjeta'));

        tarjetas.sort((a, b) => {
            const nombreA = a.dataset.nombre.toLowerCase();
            const nombreB = b.dataset.nombre.toLowerCase();
            const precioA = parseFloat(a.dataset.precio || 0);
            const precioB = parseFloat(b.dataset.precio || 0);

            switch (estadoFiltros.orden) {
                case 'az':
                    return nombreA.localeCompare(nombreB);
                case 'za':
                    return nombreB.localeCompare(nombreA);
                case 'precio-asc':
                    return precioA - precioB;
                case 'precio-desc':
                    return precioB - precioA;
                default:
                    return 0; // Conserva el orden original del DOM
            }
        });

        // Reinsertar en el DOM ordenadamente
        tarjetas.forEach(tarjeta => grilla.appendChild(tarjeta));
    });
}


function renderizarPildorasFiltros() {
    const contenedor = document.getElementById('filtrosActivos');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (estadoFiltros.categoria !== 'todos') {
        let texto = `Categoría: ${estadoFiltros.categoria}`;
        if (estadoFiltros.subcategoria) texto += ` (${estadoFiltros.subcategoria})`;
        contenedor.appendChild(crearPildora(texto, () => filtrar('todos', '')));
    }

    if (estadoFiltros.busqueda) {
        contenedor.appendChild(crearPildora(`Búsqueda: "${estadoFiltros.busqueda}"`, () => buscar('')));
    }

    if (estadoFiltros.precioMax < 100) {
        contenedor.appendChild(crearPildora(`Máx: $${estadoFiltros.precioMax}`, () => filtrarPrecio(100)));
    }
}

function crearPildora(texto, callbackEliminar) {
    const div = document.createElement('div');
    div.className = 'pildora';
    div.innerHTML = `<span>${texto}</span>`;
    
    const btn = document.createElement('button');
    btn.textContent = '✕';
    btn.onclick = callbackEliminar;
    
    div.appendChild(btn);
    return div;
}



function verDetalle(tarjetaElement) {
    if (!tarjetaElement) return;

    const data = tarjetaElement.dataset;
    const icono = tarjetaElement.querySelector('.tarjeta-icono')?.textContent || '🌴';
    const descripcion = tarjetaElement.querySelector('p')?.textContent || '';
    const ubicacionTexto = tarjetaElement.querySelector('.ubicacion')?.textContent || '';

   
    document.getElementById('mCategoria').textContent = `${data.cat || ''} / ${data.sub || ''}`;
    document.getElementById('mIcono').textContent = icono;
    document.getElementById('mNombre').textContent = data.nombre || '';
    document.getElementById('mDesc').textContent = descripcion;

    document.getElementById('mContacto').textContent = data.contacto ? `👤 Contacto: ${data.contacto}` : '';
    document.getElementById('mTelefono').textContent = data.telefono ? `📞 Teléfono: ${data.telefono}` : '';
    document.getElementById('mCorreo').textContent = data.correo ? `✉️ Correo: ${data.correo}` : '';
    document.getElementById('mSocial').textContent = data.social ? `🌐 Redes: ${data.social}` : '';
    document.getElementById('mUbicacion').textContent = ubicacionTexto;
    document.getElementById('mPrecio').textContent = data.precio ? `🏷️ Desde: $${data.precio}` : '';

    // Configuración del botón de Google Maps
    const btnMaps = document.getElementById('mMaps');
    if (btnMaps) {
        if (data.maps) {
            btnMaps.href = `https://www.google.com/maps/search/?api=1&query=${data.maps}`;
            btnMaps.style.display = 'inline-block';
        } else {
            btnMaps.style.display = 'none';
        }
    }

    // Configuración del botón de WhatsApp
    const btnWsp = document.getElementById('mWhatsapp');
    if (btnWsp) {
        if (data.telefono) {
            const numLimpio = data.telefono.replace(/\D/g, '');
            const numFinal = numLimpio.startsWith('0') ? `593${numLimpio.substring(1)}` : numLimpio;
            btnWsp.href = `https://wa.me/${numFinal}?text=Hola,%20vi%20su%20emprendimiento%20en%20Hecho%20en%20Esmeraldas`;
            btnWsp.style.display = 'inline-block';
        } else {
            btnWsp.style.display = 'none';
        }
    }

    // Mostrar modal
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'flex';
}

function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none';
}



function toggleFav(btnElement) {
    const id = btnElement.dataset.id;
    if (!id) return;

    const index = favoritos.indexOf(id);
    if (index === -1) {
        favoritos.push(id);
    } else {
        favoritos.splice(index, 1);
    }

    localStorage.setItem('favs_esmeraldas', JSON.stringify(favoritos));
    actualizarFavoritosUI();
}

function actualizarFavoritosUI() {
    // 1. Actualizar estado visual de todos los botones de corazón
    const btnsFav = document.querySelectorAll('.btn-fav');
    btnsFav.forEach(btn => {
        const id = btn.dataset.id;
        if (favoritos.includes(id)) {
            btn.classList.add('activo');
            btn.textContent = '♥';
        } else {
            btn.classList.remove('activo');
            btn.textContent = '♡';
        }
    });

    
    const contFavs = document.getElementById('contFavs');
    if (contFavs) {
        contFavs.textContent = favoritos.length;
        contFavs.hidden = favoritos.length === 0;
    }

    // 3. Renderizar el listado dentro del panel lateral
    renderizarListaFavs();
}

function renderizarListaFavs() {
    const contenedor = document.getElementById('listadoFavs');
    if (!contenedor) return;

    if (favoritos.length === 0) {
        contenedor.innerHTML = '<p class="fav-vacio">Aún no has guardado favoritos.</p>';
        return;
    }

    contenedor.innerHTML = '';
    favoritos.forEach(id => {
        const tarjeta = document.querySelector(`.tarjeta[data-id="${id}"]`);
        if (tarjeta) {
            const nombre = tarjeta.dataset.nombre;
            const icono = tarjeta.querySelector('.tarjeta-icono')?.textContent || '🌴';
            const ubicacion = tarjeta.querySelector('.ubicacion')?.textContent || '';

            const item = document.createElement('div');
            item.className = 'fav-item';
            item.innerHTML = `
                <span class="fav-item-icono">${icono}</span>
                <div class="fav-item-info">
                    <div class="fav-item-nombre">${nombre}</div>
                    <div class="fav-item-loc">${ubicacion}</div>
                </div>
                <button class="fav-item-quitar" onclick="removerFavoritoDirecto('${id}')" title="Quitar">✕</button>
            `;
            contenedor.appendChild(item);
        }
    });
}

function removerFavoritoDirecto(id) {
    favoritos = favoritos.filter(favId => favId !== id);
    localStorage.setItem('favs_esmeraldas', JSON.stringify(favoritos));
    actualizarFavoritosUI();
}

function abrirFavs() {
    document.getElementById('panelFavs').style.display = 'block';
    document.getElementById('fondoFavs').style.display = 'block';
}

function cerrarFavs() {
    document.getElementById('panelFavs').style.display = 'none';
    document.getElementById('fondoFavs').style.display = 'none';
}



function validarFormulario(e) {
    e.preventDefault();

   
    const fNombre = document.getElementById('fNombre');
    const fCategoria = document.getElementById('fCategoria');
    const fDesc = document.getElementById('fDesc');
    const fUbicacion = document.getElementById('fUbicacion');
    const fTelefono = document.getElementById('fTelefono');
    const fCorreo = document.getElementById('fCorreo');

    // Limpiar errores previos
    limpiarErroresFormulario();

    let esValido = true;

    // Validar Nombre
    if (!fNombre.value.trim()) {
        mostrarError('errNombre', fNombre, 'Ingresa el nombre del emprendimiento');
        esValido = false;
    }

    // Validar Categoría
    if (!fCategoria.value) {
        mostrarError('errCategoria', fCategoria, 'Selecciona una categoría');
        esValido = false;
    }

    // Validar Descripción
    if (!fDesc.value.trim() || fDesc.value.trim().length < 10) {
        mostrarError('errDesc', fDesc, 'Escribe una descripción de al menos 10 caracteres');
        esValido = false;
    }

    // Validar Ubicación
    if (!fUbicacion.value.trim()) {
        mostrarError('errUbicacion', fUbicacion, 'Ingresa la ubicación');
        esValido = false;
    }

    // Validar Teléfono (Formato Ecuador: 10 dígitos)
    const regexTel = /^09\d{8}$/;
    if (!regexTel.test(fTelefono.value.trim())) {
        mostrarError('errTelefono', fTelefono, 'Ingresa un celular válido de 10 dígitos (Ej: 0991234567)');
        esValido = false;
    }

    // Validar Correo (Si fue completado)
    if (fCorreo.value.trim() !== '') {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(fCorreo.value.trim())) {
            mostrarError('errCorreo', fCorreo, 'Ingresa un formato de correo válido');
            esValido = false;
        }
    }

    // Si la validación es exitosa
    if (esValido) {
        const msg = document.getElementById('msgFormulario');
        if (msg) {
            msg.textContent = '¡Gracias por registrarte! Revisaremos tus datos para publicar tu negocio.';
            msg.style.color = '#2F6E4F';
        }
        document.getElementById('formRegistro').reset();
    }
}

function mostrarError(idSpan, inputElement, mensaje) {
    const span = document.getElementById(idSpan);
    if (span) span.textContent = mensaje;
    if (inputElement) inputElement.classList.add('con-error');
}

function limpiarErroresFormulario() {
    const errores = document.querySelectorAll('.error');
    errores.forEach(e => e.textContent = '');

    const inputs = document.querySelectorAll('#formRegistro .con-error');
    inputs.forEach(i => i.classList.remove('con-error'));

    const msg = document.getElementById('msgFormulario');
    if (msg) msg.textContent = '';
}