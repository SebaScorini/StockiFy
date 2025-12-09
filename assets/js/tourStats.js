
document.addEventListener('DOMContentLoaded', function() {
    
    const tourStats = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
        classes: 'custom-class',
        scrollTo: { behavior: 'smooth', block: 'center' },
        arrow: { padding: 10 },
        cancelIcon: {
          enabled: true
        },
        buttons: [
          {
            text: 'Atrás',
            action: function() {
              return this.back();
            }
          },
          {
            text: 'Siguiente',
            action: function() {
              return this.next();
            }
          }
        ]
      },
      when: {
        show: () => {
          document.body.classList.add('tour-active');
        },
        hide: () => {
            document.body.classList.remove('tour-active');
        },
        complete: () => {
            document.body.classList.remove('tour-active');
        },
        cancel: () => {
            document.body.classList.remove('tour-active');
        }
      }
    });

    tourStats.addStep({
    title: 'Estadisticas Financieras',
    text: 'Esta sección proporciona una visión general de las estadísticas financieras de tu negocio.',
    attachTo: {
        element: '#estadisticas-main-container',
        on: 'top'
    },
    buttons: [
            {
            text: 'Salir',
            action: tourStats.cancel,
            secondary: true
            },
            {
            text: 'Siguiente',
            action: tourStats.next
            }
        ]
    });

    tourStats.addStep({
    title: 'Periodo de Tiempo',
    text: 'Podes selecionar dos fechas para ver las estadísticas financieras en ese rango de tiempo específico.',
    attachTo: {
        element: '#estadisticas-fecha',
        on: 'bottom'
    },
    buttons: [
            {
            text: 'Atrás',
            action: tourStats.back,
            secondary: true
            },
            {
            text: 'Siguiente',
            action: tourStats.next
            }
        ]
    });

    tourStats.addStep({
    title: 'Estadisticas generales o por inventario',
    text: 'Selecciona si queres ver estadísticas generales o específicas de un inventario.',
    attachTo: {
        element: '#select-tabla-container',
        on: 'bottom'
    },
    buttons: [
            {
            text: 'Atrás',
            action: tourStats.back,
            secondary: true
            },
            {
            text: 'Siguiente',
            action: tourStats.next
            }
        ]
    });

    tourStats.addStep({
    title: 'Graficos de estadisticas',
    text: 'Hace click en cualquiera de las estadísticas para ver un gráfico detallado en el periodo de tiempo seleccionado.',
    attachTo: {
        element: '.stat-grid',
        on: 'top'
    },
    buttons: [
            {
            text: 'Atrás',
            action: tourStats.back,
            secondary: true
            },
            {
            text: 'Finalizar',
            action: tourStats.complete
            }
        ]
    });

    if(!localStorage.getItem('hasVisitedStatisticsTour')) {
        tourStats.start();
        localStorage.setItem('hasVisitedStatisticsTour', 'true');
    }
});