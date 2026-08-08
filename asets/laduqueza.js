function initScrollReveal() {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });
}

function initHeroImage() {
  const heroImg = document.querySelector('.hero-img');
  const heroPlaceholder = document.querySelector('.hero-imagen-placeholder');
  if (!heroImg || !heroPlaceholder) return;

  heroImg.addEventListener('load', function () {
    if (this.src && this.naturalWidth > 0) {
      heroPlaceholder.style.display = 'none';
      this.style.display = 'block';
    }
  });

  heroImg.addEventListener('error', function () {
    this.style.display = 'none';
    heroPlaceholder.style.display = 'flex';
  });

  if (!heroImg.getAttribute('src')) {
    heroImg.style.display = 'none';
  }
}

function initProductImages() {
  document.querySelectorAll('.producto-img').forEach(function (img) {
    const placeholder = img.parentElement.querySelector('.img-placeholder');

    function mostrarImagen() {
      img.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
    }

    function mostrarPlaceholder() {
      img.style.display = 'none';
      if (placeholder) placeholder.style.display = 'flex';
    }

    img.addEventListener('load', mostrarImagen);
    img.addEventListener('error', mostrarPlaceholder);

    if (!img.getAttribute('src')) {
      mostrarPlaceholder();
      return;
    }

    if (img.complete && img.naturalWidth > 0) {
      mostrarImagen();
    } else {
      img.style.display = 'none';
    }
  });
}

function esDiaHabil(fecha) {
  const dia = fecha.getDay();
  return dia !== 0 && dia !== 6;
}

function obtenerFechaMinimaEntrega() {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  let diasHabiles = 0;

  while (diasHabiles < 2) {
    fecha.setDate(fecha.getDate() + 1);
    if (esDiaHabil(fecha)) diasHabiles++;
  }

  return fecha;
}

function formatearFechaInput(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return anio + '-' + mes + '-' + dia;
}

function validarFechaEntrega(valorFecha) {
  if (!valorFecha) return 'Seleccioná una fecha de entrega.';

  const partes = valorFecha.split('-');
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);

  if (!esDiaHabil(fecha)) {
    return 'Solo entregamos de lunes a viernes (días hábiles).';
  }

  const minima = obtenerFechaMinimaEntrega();
  if (fecha < minima) {
    return 'Los pedidos requieren anticipo de 2 días hábiles. Fecha mínima: ' +
      minima.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) + '.';
  }

  return '';
}

function initPersonalizado() {
  const checkbox = document.getElementById('personalizado');
  const campos = document.getElementById('personalizado-campos');
  const detalle = document.getElementById('detalle-personalizado');
  if (!checkbox || !campos || !detalle) return;

  checkbox.addEventListener('change', function () {
    campos.hidden = !this.checked;
    detalle.required = this.checked;
  });
}

function initFormPedido() {
  const form = document.getElementById('form-pedido');
  const inputFecha = document.getElementById('fecha');
  const avisoFecha = document.getElementById('aviso-fecha');
  if (!form || !inputFecha) return;

  const EMAILJS_SERVICE_ID = 'service_fw4jbop';
  const EMAILJS_TEMPLATE_ID = 'template_hzxpl5n';

  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: '6eWG2SK48quvIIAg_' });
  }

  const minima = obtenerFechaMinimaEntrega();
  inputFecha.min = formatearFechaInput(minima);

  if (avisoFecha) {
    avisoFecha.textContent =
      'Entregas solo de lunes a viernes. Anticipo mínimo de 2 días hábiles. ' +
      'Primera fecha disponible: ' +
      minima.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) + '.';
  }

  inputFecha.addEventListener('change', function () {
    const error = validarFechaEntrega(this.value);
    this.setCustomValidity(error);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const error = validarFechaEntrega(inputFecha.value);
    if (error) {
      inputFecha.setCustomValidity(error);
      inputFecha.reportValidity();
      return;
    }

    if (typeof emailjs === 'undefined') {
      alert('El servicio de envío aún no está disponible. Enviá tu pedido por WhatsApp.');
      return;
    }

    const cantidad = document.getElementById('cantidad').value;
    const detallePersonalizado = document.getElementById('detalle-personalizado');

    const templateParams = {
      title: 'Nuevo pedido: ' + document.getElementById('producto').value,
      name: document.getElementById('nombre').value + ' ' + document.getElementById('apellido').value,
      email: document.getElementById('email').value,
      producto: document.getElementById('producto').value,
      fecha: inputFecha.value,
      cantidad: cantidad + ' ' + (Number(cantidad) === 1 ? 'unidad' : 'unidades'),
      horario: document.getElementById('horario').value,
      detalle_personalizado: detallePersonalizado.value || 'No',
    };

    const boton = form.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = 'Enviando...';

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(function () {
        alert('¡Gracias por tu pedido! Te contactaremos pronto para confirmar los detalles.');
        form.reset();
        inputFecha.min = formatearFechaInput(obtenerFechaMinimaEntrega());
        const campos = document.getElementById('personalizado-campos');
        const detalle = document.getElementById('detalle-personalizado');
        if (campos) campos.hidden = true;
        if (detalle) detalle.required = false;
      })
      .catch(function () {
        alert('No se pudo enviar el pedido. Intentá de nuevo o escribinos por WhatsApp.');
      })
      .finally(function () {
        boton.disabled = false;
        boton.textContent = 'Enviar Pedido';
      });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initScrollReveal();
  initHeroImage();
  initProductImages();
  initPersonalizado();
  initFormPedido();
});