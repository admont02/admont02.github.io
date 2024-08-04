document.addEventListener('DOMContentLoaded', () => {
    // Inicialización de Muuri para el grid
    const grid = new Muuri('.grid', {
        layout: {
            rounding: false
        }
    });

    // Mueve el código del load a DOMContentLoaded
    grid.refreshItems().layout();
    document.getElementById('grid').classList.add('imagenes-cargadas');

    // Selección de elementos
    const enlaces = document.querySelectorAll('#categorias a');
    const contenido = document.getElementById('contenido');
    const sobreMi = document.getElementById('sobre-mi');
    const contacto = document.getElementById('contacto');

    // Función para mostrar/ocultar secciones
    function mostrarSeccion(categoria) {
        if (categoria === 'proyectos') {
            contenido.querySelector('.grid').style.display = 'block';
            sobreMi.style.display = 'none';
            contacto.style.display = 'none';
        } else if (categoria === 'sobre-mi') {
            contenido.querySelector('.grid').style.display = 'none';
            sobreMi.style.display = 'block';
            contacto.style.display = 'none';
        } else if (categoria === 'contacto') {
            contenido.querySelector('.grid').style.display = 'none';
            sobreMi.style.display = 'none';
            contacto.style.display = 'block';
        } else {
            contenido.querySelector('.grid').style.display = 'block';
            sobreMi.style.display = 'none';
            contacto.style.display = 'none';
        }
    }

    // Agregamos los listener de los enlaces para filtrar por categoría.
    enlaces.forEach((elemento) => {
        elemento.addEventListener('click', (evento) => {
            evento.preventDefault();
            enlaces.forEach((enlace) => enlace.classList.remove('activo'));
            evento.target.classList.add('activo');

            const categoria = evento.target.getAttribute('data-categoria');
            mostrarSeccion(categoria);
        });
    });

    // Agregamos el listener para la barra de búsqueda
    document.querySelector('#barra-busqueda').addEventListener('input', (evento) => {
        const busqueda = evento.target.value.toLowerCase();
        grid.filter((item) => item.getElement().dataset.etiquetas.toLowerCase().includes(busqueda));
    });

    // Agregamos listener para las imágenes
    const overlay = document.getElementById('overlay');
    document.querySelectorAll('.grid .item img').forEach((elemento) => {
        elemento.addEventListener('click', () => {
            const ruta = elemento.getAttribute('src');
            const descripcion = elemento.parentNode.parentNode.dataset.descripcion;
            const enlace = elemento.parentNode.parentNode.dataset.enlace;

            overlay.classList.add('activo');
            document.querySelector('#overlay img').src = ruta;
            document.querySelector('#overlay .descripcion').innerHTML = `
                ${descripcion} <br>
                <a href="${enlace}" target="_blank">Ver más</a>
            `;
        });
    });

    // Eventlistener del botón de cerrar
    document.querySelector('#btn-cerrar-popup').addEventListener('click', () => {
        overlay.classList.remove('activo');
    });

    // Eventlistener del overlay
    overlay.addEventListener('click', (evento) => {
        if (evento.target.id === 'overlay') {
            overlay.classList.remove('activo');
        }
    });
});
