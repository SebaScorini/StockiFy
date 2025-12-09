document.addEventListener('DOMContentLoaded', () => {

  let isNewUser = false;
  if (sessionStorage.getItem('isNewUser')) {
    isNewUser = true;
    sessionStorage.removeItem('isNewUser');
    localStorage.setItem('isNewUserSession', 'true');
  }

  if (isNewUser) {
    localStorage.removeItem('hasVisitedStockiFyTour');
    localStorage.removeItem('hasVisitedConfigTableTour');
    localStorage.removeItem('hasVisitedSalesTour');
    localStorage.removeItem('hasVisitedRegisterSaleTour');
    localStorage.removeItem('hasVisitedReceiptsTour');
    localStorage.removeItem('hasVisitedRegisterReceiptTour');
    localStorage.removeItem('hasVisitedCustomersTour');
    localStorage.removeItem('hasVisitedProvidersTour');
    localStorage.removeItem('hasVisitedDailyStatsTour');
    localStorage.removeItem('hasVisitedStatisticsTour');
  }

  function closeMobileSidebar() {
    const mobileMenu = document.getElementById('mobile-menu');
    const greyBg = document.getElementById('grey-background');
    if (mobileMenu && greyBg) {
        mobileMenu.classList.add('hidden');
        greyBg.classList.add('hidden');
    }
  }

  function openMobileSidebar() {
    const mobileMenu = document.getElementById('mobile-menu');
    const greyBg = document.getElementById('grey-background');
    if (mobileMenu && greyBg) {
        mobileMenu.classList.remove('hidden');
        greyBg.classList.remove('hidden');
    }
  }

      const tour = new Shepherd.Tour({
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
      }
    });

    tour.addStep({
      title: '¡Bienvenido a StockiFy!',
      text: 'Este es un tour para guiarte por las funciones principales. Podrás ver esta guía siempre que quieras.',
      attachTo: {
        element: '#generalTour',
        on: 'top'
      },
      buttons: [
        {
          text: 'Salir',
          action: tour.cancel,
          secondary: true
        },
        {
          text: 'Siguiente',
          action: tour.next
        }
      ]
    });

    tour.addStep({
      title: 'Panel Principal',
      text: 'En esta área podrás ver un resumen de tus actividades recientes y estadísticas clave.',
      attachTo: {
        element: '.main-dashboard',
        on: 'top'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tour.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tour.next
          }
      ]
    });

        tour.addStep({
      title: 'Menú de Navegación',
      text: 'Aquí encontrarás todas las secciones para gestionar tu base de datos, transacciones y ver estadísticas.',
      attachTo: {
        element: '.dashboard-sidebar',
        on: 'right'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tour.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tour.next
          }
      ]
    });
 
    tour.addStep({
      title: 'Ver Datos',
      text: 'En esta sección puedes agregar, editar o eliminar productos de tu inventario.',
      attachTo: {
        element: '#view-data',
        on: 'left'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tour.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tour.next
          }
      ]
    });

    tour.addStep({
      title: 'Configurar Tabla',
      text: 'Aquí puedes personalizar las columnas y vistas de tu tabla de datos.',
      attachTo: {
        element: '#config-table',
        on: 'left'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tour.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tour.next
          }
      ]
    });

    tour.addStep({
      title:" Cambiar Base de Datos",
      text: 'Utiliza esta opción para seleccionar una base de datos diferente para gestionar.',
      attachTo: {
        element: '#select-db',
        on: 'left'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tour.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tour.next
          }
      ]
    });

    tour.addStep({
      title: 'Crear Nueva Base de Datos',
      text: 'Haz clic aquí para crear una nueva base de datos desde cero.',
      attachTo: {
        element: '#create-db',
        on: 'left'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tour.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tour.next
          }
      ]
    });

    tour.addStep({
      title: "Ventas",
      text: 'Gestiona todas las ventas realizadas desde esta sección.',
      attachTo: {
        element: '#sales-t',
        on: 'left'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tour.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tour.next
          }
      ]
    });

    tour.addStep({
      title: "Compras",
      text: 'Aquí puedes registrar y gestionar todas las compras realizadas.',
      attachTo: {
        element: '#receipts-t',
        on: 'left'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tour.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tour.next
          }
      ]
    });

    tour.addStep({
      title: "Clientes",
      text: 'Gestiona la información de tus clientes desde esta sección.',
      attachTo: {
        element: '#customers-t',
        on: 'left'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tour.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tour.next
          }
      ]
    });

    tour.addStep({
      title: "Proveedores",
      text: 'Aquí puedes gestionar los datos de tus proveedores.',
      attachTo: {
        element: '#providers-t',
        on: 'left'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tour.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tour.next
          }
      ]
    });

    tour.addStep({
      title: "Estadísticas Diarias",
      text: 'Visualiza las estadísticas diarias de tu inventario y ventas aquí.',
      attachTo: {
        element: '#daily-t',
        on: 'left'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tour.back,
            secondary: true
          },
          {
              text: 'Finalizar',
              action: tour.complete
          }
      ]
    });

  // Tours secundarios: usan localStorage para persistencia.
  const tourConfigTable = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'custom-class',
      scrollTo: { behavior: 'smooth', block: 'center' },
      arrow: { padding: 10 },
      cancelIcon: {
        enabled: true},
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
    }
  });
  
  tourConfigTable.addStep({
    title: 'Configurar Tabla',
    text: 'Aquí puedes personalizar las columnas y vistas de tu tabla de datos.',
    attachTo: {
      element: '#main-dashboard',
      on: 'top'
    },
    buttons: [
        {
          text: 'Salir',
          action: tourConfigTable.cancel,
          secondary: true
        },
        {
            text: 'Siguiente',
            action: tourConfigTable.next
        }
    ]
  });

  tourConfigTable.addStep({
    title: 'Columnas recomendadas',
    text: 'Selecciona las columnas recomendadas que deseas mostrar u ocultar en la tabla.',
    attachTo: {
      element: '#column-settings',
      on: 'bottom'
    },
    buttons: [
        {
          text: 'Atrás',
          action: tourConfigTable.back,
          secondary: true
        },
        {
            text: 'Siguiente',
            action: tourConfigTable.next
        }
    ]
  });

  tourConfigTable.addStep({
    title: 'Eliminar',
    text: 'Click aqui para eliminar la base de datos seleccionada.',
    attachTo: {
      element: '#delete-db',
      on: 'bottom'
    },
    buttons: [
        {
          text: 'Atrás',
          action: tourConfigTable.back,
          secondary: true
        },
        {
            text: 'Finalizar',
            action: tourConfigTable.complete
        }
    ]
  });
  
  const configButton = document.getElementById('config-table');
  if (configButton) {
    configButton.addEventListener('click', () => {
      if (localStorage.getItem('hasVisitedConfigTableTour')) return;
      
      closeMobileSidebar();
      tourConfigTable.start();
      localStorage.setItem('hasVisitedConfigTableTour', 'true');
    });
  }

  const tourSales = new Shepherd.Tour({        
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'custom-class',
      scrollTo: { behavior: 'smooth', block: 'center' },
      arrow: { padding: 10 },
      cancelIcon: {
        enabled: true},
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
    }});
    
    tourSales.addStep({
      title: 'Ventas',
      text: 'Gestiona todas las ventas realizadas desde esta sección.',
      attachTo: {
        element: '#main-dashboard',
        on: 'top'
      },
      buttons: [
          {
            text: 'Salir',
            action: tourSales.cancel,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourSales.next
          }
      ]
    });

    tourSales.addStep({
      title: 'Registrar Venta',
      text: 'Haz clic aquí para registrar una nueva venta.',
      attachTo: {
        element: '#register-sale',
        on: 'bottom'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourSales.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourSales.next
          }
      ]
    });

    tourSales.addStep({
      title: 'Ordenar Ventas',
      text: 'Podes ordenar las ventas por distintos criterios',
      attachTo: {
        element: '#order-sales',
        on: 'bottom'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourSales.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourSales.next
          }
      ]
    });

    tourSales.addStep({
      title: 'Ordenar por ascendente o descendente',
      text: 'Puedes ordenar las ventas de forma ascendente o descendente.',
      attachTo: {
        element: '#desc-asc-sales',
        on: 'bottom'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourSales.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourSales.next
          }
      ]
    });

    tourSales.addStep({
      title:'Detalles de la Venta',
      text: 'Haz clic en una venta para ver y editar sus detalles completos.',
      attachTo: {
        element: '#sales-table-date-descending',
        on: 'top'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourSales.back,
            secondary: true
          },
          {
              text: 'Finalizar',
              action: tourSales.complete
          }
      ]
    });

  const salesTab = document.getElementById('sales-t');
  if (salesTab) {
    salesTab.addEventListener('click', () => {
      if (localStorage.getItem('hasVisitedSalesTour')) return;
      setTimeout(() => {
        closeMobileSidebar();
        tourSales.start();
        localStorage.setItem('hasVisitedSalesTour', 'true');
      }, 100);
    });
  }

  document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'register-sale') {
      if (localStorage.getItem('hasVisitedRegisterSaleTour')) return;
      setTimeout(() => {
        const saleRegisterTour = new Shepherd.Tour({        
        useModalOverlay: true,
        defaultStepOptions: {
          classes: 'custom-class',
          scrollTo: { behavior: 'smooth', block: 'center' },
          arrow: { padding: 10 },
          cancelIcon: {
            enabled: true},
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
        }});
        
        saleRegisterTour.addStep({
          title: 'Agregar items',
          text: 'Agrega productos al carrito de ventas desde aquí.',
          attachTo: {
            element: '#sale-items',
            on: 'bottom'
          },
          buttons: [
              {
                text: 'Salir',
                action: saleRegisterTour.cancel,
                secondary: true
              },
              {
                  text: 'Siguiente',
                  action: saleRegisterTour.next
              }
          ]
        });

        saleRegisterTour.addStep({
          title: 'Asignar cliente',
          text: 'Asigna un cliente a la venta haciendo clic en "Cambiar".',
          attachTo: {
            element: '#client-select',
            on: 'bottom'
          },
          buttons: [
              {
                text: 'Atrás',
                action: saleRegisterTour.back,
                secondary: true
              },
              {
                  text: 'Finalizar',
                  action: saleRegisterTour.complete
              }
          ]
        });
        saleRegisterTour.start();
        localStorage.setItem('hasVisitedRegisterSaleTour', 'true');
      }, 100);
    }
  });

  const tourReceipts = new Shepherd.Tour({        
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'custom-class',
      scrollTo: { behavior: 'smooth', block: 'center' },
      arrow: { padding: 10 },
      cancelIcon: {
        enabled: true},
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
    }});
    
    tourReceipts.addStep({
      title: 'Compras',
      text: 'Aquí puedes registrar y gestionar todas las compras realizadas.',
      attachTo: {
        element: '#main-dashboard',
        on: 'top'
      },
      buttons: [
          {
            text: 'Salir',
            action: tourReceipts.cancel,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourReceipts.next
          }
      ]
    });

    tourReceipts.addStep({
      title: 'Registrar Compra',
      text: 'Haz clic aquí para registrar una nueva compra.',
      attachTo: {
        element: '#register-receipt',
        on: 'bottom'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourReceipts.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourReceipts.next
          }
      ]
    });

    tourReceipts.addStep({
      title: 'Ordenar Compras',
      text: 'Podes ordenar las compras por distintos criterios',
      attachTo: {
        element: '#order-receipts',
        on: 'bottom'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourReceipts.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourReceipts.next
          }
      ]
    });

    tourReceipts.addStep({
      title: 'Ordenar por ascendente o descendente',
      text: 'Puedes ordenar las compras de forma ascendente o descendente.',
      attachTo: {
        element: '#desc-asc-receipts',
        on: 'bottom'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourReceipts.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourReceipts.next
          }
      ]
    });

    tourReceipts.addStep({
      title:'Detalles de la Compra',
      text: 'Haz clic en una compra para ver y editar sus detalles completos.',
      attachTo: {
        element: '#receipts-table-date-descending',
        on: 'top'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourReceipts.back,
            secondary: true
          },
          {
              text: 'Finalizar',
              action: tourReceipts.complete
          }
      ]
    });

  const receiptsTab = document.getElementById('receipts-t');
  if (receiptsTab) {
    receiptsTab.addEventListener('click', () => {
      if (localStorage.getItem('hasVisitedReceiptsTour')) return;
      setTimeout(() => {
        closeMobileSidebar();
        tourReceipts.start();
        localStorage.setItem('hasVisitedReceiptsTour', 'true');
      }, 100);
    });
  }

  document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'register-receipt') {
      if (localStorage.getItem('hasVisitedRegisterReceiptTour')) return;
      setTimeout(() => {
        const receiptRegisterTour = new Shepherd.Tour({        
        useModalOverlay: true,
        defaultStepOptions: {
          classes: 'custom-class',
          scrollTo: { behavior: 'smooth', block: 'center' },
          arrow: { padding: 10 },
          cancelIcon: {
            enabled: true},
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
        }});
        
        receiptRegisterTour.addStep({
          title: 'Agregar items',
          text: 'Agrega productos al carrito de compras desde aquí.',
          attachTo: {
            element: '#receipt-items',
            on: 'bottom'
          },
          buttons: [
              {
                text: 'Salir',
                action: receiptRegisterTour.cancel,
                secondary: true
              },
              {
                  text: 'Siguiente',
                  action: receiptRegisterTour.next
              }
          ]
        });

        receiptRegisterTour.addStep({
          title: 'Asignar Proveedor',
          text: 'Asigna un proveedor a la compra haciendo clic en "Cambiar".',
          attachTo: {
            element: '#provider-select',
            on: 'bottom'
          },
          buttons: [
              {
                text: 'Atrás',
                action: receiptRegisterTour.back,
                secondary: true
              },
              {
                  text: 'Finalizar',
                  action: receiptRegisterTour.complete
              }
          ]
        });

        receiptRegisterTour.start();
        localStorage.setItem('hasVisitedRegisterReceiptTour', 'true');
      }, 100);
    }
  });

  const tourCustomers = new Shepherd.Tour({        
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'custom-class',
      scrollTo: { behavior: 'smooth', block: 'center' },
      arrow: { padding: 10 },
      cancelIcon: {
        enabled: true},
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
    }});
    
    tourCustomers.addStep({
      title: 'Clientes',
      text: 'Gestiona la información de tus clientes desde esta sección.',
      attachTo: {
        element: '#main-dashboard',
        on: 'top'
      },
      buttons: [
          {
            text: 'Salir',
            action: tourCustomers.cancel,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourCustomers.next
          }
      ]
    });

    tourCustomers.addStep({
      title: 'Agregar Cliente',
      text: 'Haz clic aquí para agregar un nuevo cliente.',
      attachTo: {
        element: '#add-customer',
        on: 'bottom'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourCustomers.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourCustomers.next
          }
      ]
    });

    tourCustomers.addStep({
      title: 'Ordenar Clientes',
      text: 'Podes ordenar los clientes por distintos criterios',
      attachTo: {
        element: '#order-customers',
        on: 'bottom'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourCustomers.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourCustomers.next
          }
      ]
    });

    tourCustomers.addStep({
      title: 'Ordenar por ascendente o descendente',
      text: 'Puedes ordenar los clientes de forma ascendente o descendente.',
      attachTo: {
        element: '#desc-asc-customers',
        on: 'bottom'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourCustomers.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourCustomers.next
          }
      ]
    });

    tourCustomers.addStep({
      title: 'Detalles del Cliente',
      text: 'Haz clic en un cliente para ver y editar sus detalles completos.',
      attachTo: {
        element: '#customers-table-wrapper',
        on: 'top'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourCustomers.back,
            secondary: true
          },
          {
              text: 'Finalizar',
              action: tourCustomers.complete
          }
      ]
    });

  const customerTab = document.getElementById('customers-t');
  if (customerTab) {
    customerTab.addEventListener('click', () => {
      if (localStorage.getItem('hasVisitedCustomersTour')) return;
      setTimeout(() => {
        closeMobileSidebar();
        tourCustomers.start();
        localStorage.setItem('hasVisitedCustomersTour', 'true');
      }, 100);
    });
  }

  const tourProviders = new Shepherd.Tour({        
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'custom-class',
      scrollTo: { behavior: 'smooth', block: 'center' },
      arrow: { padding: 10 },
      cancelIcon: {
        enabled: true},
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
    }});
    
    tourProviders.addStep({
      title: 'Proveedores',
      text: 'Aquí puedes gestionar los datos de tus proveedores.',
      attachTo: {
        element: '#main-dashboard',
        on: 'top'
      },
      buttons: [
          {
            text: 'Salir',
            action: tourProviders.cancel,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourProviders.next
          }
      ]
    });

    tourProviders.addStep({
      title: 'Agregar Proveedor',
      text: 'Haz clic aquí para agregar un nuevo proveedor.',
      attachTo: {
        element: '#add-provider',
        on: 'bottom'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourProviders.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourProviders.next
          }
      ]
    });

    tourProviders.addStep({
      title: 'Ordenar Proveedores',
      text: 'Podes ordenar los proveedores por distintos criterios',
      attachTo: {
        element: '#order-providers',
        on: 'bottom'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourProviders.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourProviders.next
          }
      ]
    });

    tourProviders.addStep({
      title: 'Ordenar por ascendente o descendente',
      text: 'Puedes ordenar los proveedores de forma ascendente o descendente.',
      attachTo: {
        element: '#desc-asc-providers',
        on: 'bottom'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourProviders.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourProviders.next
          }
      ]
    });

    tourProviders.addStep({
      title: 'Detalles del Proveedor',
      text: 'Haz clic en un proveedor para ver y editar sus detalles completos.',
      attachTo: {
        element: '#providers-table-wrapper',
        on: 'top'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourProviders.back,
            secondary: true
          },
          {
              text: 'Finalizar',
              action: tourProviders.complete
          }
      ]
    });

  const providerTab = document.getElementById('providers-t');
  if (providerTab) {
    providerTab.addEventListener('click', () => {
      if (localStorage.getItem('hasVisitedProvidersTour')) return;
      setTimeout(() => {
        closeMobileSidebar();
        tourProviders.start();
        localStorage.setItem('hasVisitedProvidersTour', 'true');
      }, 100);
    });
  }

  const tourDailyStats = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'custom-class',
      scrollTo: { behavior: 'smooth', block: 'center' },
      arrow: { padding: 10 },
      cancelIcon: {
        enabled: true},
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
    }});
    
    tourDailyStats.addStep({
      title: 'Estadísticas Diarias',
      text: 'Visualiza las estadísticas diarias de tu negocio y ventas aquí.',
      attachTo: {
        element: '#main-dashboard',
        on: 'top'
      },
      buttons: [
          {
            text: 'Salir',
            action: tourDailyStats.cancel,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourDailyStats.next
          }
      ]
    });

    tourDailyStats.addStep({
      title: 'Filtrar por inventario',
      text: 'Utiliza este filtro para ver estadísticas generales o específicas de cada inventario.',
      attachTo: {
        element: '.select-inventory-btn',
        on: 'bottom'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourDailyStats.back,
            secondary: true
          },
          {
              text: 'Siguiente',
              action: tourDailyStats.next
          }
      ]
    });

    tourDailyStats.addStep({
      title: 'Grafico de la estadistica',
      text: 'Haz click en cualquiera de las estadísticas para ver su gráfico por hora detallado.',
      attachTo: {
        element: '.daily-stats-wrapper',
        on: 'top'
      },
      buttons: [
          {
            text: 'Atrás',
            action: tourDailyStats.back,
            secondary: true
          },
          {
              text: 'Finalizar',
              action: tourDailyStats.complete
          }
      ]
    });

  const dailyStatsTab = document.getElementById('daily-t');
  if (dailyStatsTab) {
    dailyStatsTab.addEventListener('click', () => {
      if (localStorage.getItem('hasVisitedDailyStatsTour')) return;
      setTimeout(() => {
        closeMobileSidebar();
        tourDailyStats.start();
        localStorage.setItem('hasVisitedDailyStatsTour', 'true');
      }, 100);
    });
  }

      const generalTourMobile = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
          classes: 'custom-class',
          scrollTo: { behavior: 'smooth', block: 'center' },
          arrow: { padding: 10 },
          cancelIcon: {
              enabled: true},
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
      }});

    generalTourMobile.addStep({
        title: '¡Bienvenido a StockiFy!',
        text: 'Este es un tour para guiarte por las funciones principales. Podrás ver esta guía siempre que quieras.',
        attachTo: {
            element: '#generalTour',
            on: 'top'
        },
        buttons: [
            {
                text: 'Salir',
                action: generalTourMobile.cancel,
                secondary: true
            },
            {
                text: 'Siguiente',
                action: generalTourMobile.next
            }
        ]
    });

    generalTourMobile.addStep({
        title: 'Panel Principal',
        text: 'En esta área podrás ver un resumen de tus actividades recientes y estadísticas clave.',
        attachTo: {
            element: '.main-dashboard',
            on: 'top'
        },
        buttons: [
            {
                text: 'Atrás',
                action: generalTourMobile.back,
                secondary: true
            },
            {
                text: 'Siguiente',
                action: generalTourMobile.next
            }
        ]
    });

    const sideBarTour =new Shepherd.Tour({        
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'custom-class',
        scrollTo: { behavior: 'smooth', block: 'center' },
        arrow: { padding: 10 },
        cancelIcon: {
          enabled: true},
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
      }});

    sideBarTour.addStep({
        title: 'Menú de Navegación',
        text: 'Aquí encontrarás todas las secciones para gestionar tu base de datos, transacciones y ver estadísticas.',
        attachTo: {
            element: '#mobile-menu',
            on: 'right'
        },
        buttons: [
            {
                text: 'Atrás',
                action: sideBarTour.back,
                secondary: true
            },
            {
                text: 'Siguiente',
                action: sideBarTour.next
            }
        ]
    });


    sideBarTour.addStep({
        title: 'Configurar Tabla',
        text: 'Aquí puedes personalizar las columnas y vistas de tu tabla de datos.',
        attachTo: {
            element: '#config-db-m',
            on: 'left'
        },
        buttons: [
            {
                text: 'Atrás',
                action: sideBarTour.back,
                secondary: true
            },
            {
                text: 'Siguiente',
                action: sideBarTour.next
            }
        ]
    });

    sideBarTour.addStep({
        title:" Cambiar Base de Datos",
        text: 'Utiliza esta opción para seleccionar una base de datos diferente para gestionar.',
        attachTo: {
            element: '#select-db-m',
            on: 'left'
        },
        buttons: [
            {
                text: 'Atrás',
                action: sideBarTour.back,
                secondary: true
            },
            {
                text: 'Siguiente',
                action: sideBarTour.next
            }
        ]
    });

    sideBarTour.addStep({
        title: 'Crear Nueva Base de Datos',
        text: 'Haz clic aquí para crear una nueva base de datos desde cero.',
        attachTo: {
            element: '#create-db-m',
            on: 'left'
        },
        buttons: [
            {
                text: 'Atrás',
                action: sideBarTour.back,
                secondary: true
            },
            {
                text: 'Siguiente',
                action: sideBarTour.next
            }
        ]
    });

    sideBarTour.addStep({
        title: "Ventas",
        text: 'Gestiona todas las ventas realizadas desde esta sección.',
        attachTo: {
            element: '#sales-m',
            on: 'left'
        },
        buttons: [
            {
                text: 'Atrás',
                action: sideBarTour.back,
                secondary: true
            },
            {
                text: 'Siguiente',
                action: sideBarTour.next
            }
        ]
    });

    sideBarTour.addStep({
        title: "Compras",
        text: 'Aquí puedes registrar y gestionar todas las compras realizadas.',
        attachTo: {
            element: '#receipts-m',
            on: 'left'
        },
        buttons: [
            {
                text: 'Atrás',
                action: sideBarTour.back,
                secondary: true
            },
            {
                text: 'Siguiente',
                action: sideBarTour.next
            }
        ]
    });

    sideBarTour.addStep({
        title: "Clientes",
        text: 'Gestiona la información de tus clientes desde esta sección.',
        attachTo: {
            element: '#customers-m',
            on: 'left'
        },
        buttons: [
            {
                text: 'Atrás',
                action: sideBarTour.back,
                secondary: true
            },
            {
                text: 'Siguiente',
                action: sideBarTour.next
            }
        ]
    });

    sideBarTour.addStep({
        title: "Proveedores",
        text: 'Aquí puedes gestionar los datos de tus proveedores.',
        attachTo: {
            element: '#providers-m',
            on: 'left'
        },
        buttons: [
            {
                text: 'Atrás',
                action: sideBarTour.back,
                secondary: true
            },
            {
                text: 'Siguiente',
                action: sideBarTour.next
            }
        ]
    });

    sideBarTour.addStep({
        title: "Estadísticas Diarias",
        text: 'Visualiza las estadísticas diarias de tu inventario y ventas aquí.',
        attachTo: {
            element: '#daily-m',
            on: 'left'
        },
        buttons: [
            {
                text: 'Atrás',
                action: sideBarTour.back,
                secondary: true
            },
            {
                text: 'Finalizar',
                action: sideBarTour.complete
            }
        ]
    });

    document.addEventListener('click', (event) => {
      if (event.target.closest('#generalTour')) {
        if(screen.width <= 768 || window.innerWidth <= 921) {
          generalTourMobile.start();
          generalTourMobile.on('complete', () => {
            openMobileSidebar();
            sideBarTour.start();
          });
        }
        else{
          tour.start();
        }
      }
    });

    //Para cada apartado en movil//
    const configButtonMobile = document.getElementById('config-db-m');
    if (configButtonMobile) {
      if (localStorage.getItem('hasVisitedConfigTableTour')) return;
      configButtonMobile.addEventListener('click', () => {
        closeMobileSidebar();
        tourConfigTable.start();
        localStorage.setItem('hasVisitedConfigTableTour', 'true');
      });
    }

    const salesTabMobile = document.getElementById('sales-m');
    if (salesTabMobile) {
      salesTabMobile.addEventListener('click', () => {
        if (localStorage.getItem('hasVisitedSalesTour')) return;
        closeMobileSidebar();
        tourSales.start();
        localStorage.setItem('hasVisitedSalesTour', 'true');
      });
    }

    const receiptsTabMobile = document.getElementById('receipts-m');
    if (receiptsTabMobile) {
      receiptsTabMobile.addEventListener('click', () => {
        if (localStorage.getItem('hasVisitedReceiptsTour')) return;
        closeMobileSidebar();
        tourReceipts.start();
        localStorage.setItem('hasVisitedReceiptsTour', 'true');
      });
    }

    const customerTabMobile = document.getElementById('customers-m');
    if (customerTabMobile) {
      customerTabMobile.addEventListener('click', () => {
        if (localStorage.getItem('hasVisitedCustomersTour')) return;
        closeMobileSidebar();
        tourCustomers.start();
        localStorage.setItem('hasVisitedCustomersTour', 'true');
      });
    }

    const providerTabMobile = document.getElementById('providers-m');
    if (providerTabMobile) {
      providerTabMobile.addEventListener('click', () => {
        if (localStorage.getItem('hasVisitedProvidersTour')) return;
        closeMobileSidebar();
        tourProviders.start();
        localStorage.setItem('hasVisitedProvidersTour', 'true');
      });
    }

    const dailyStatsTabMobile = document.getElementById('daily-m');
    if (dailyStatsTabMobile) {
      dailyStatsTabMobile.addEventListener('click', () => {
        if (localStorage.getItem('hasVisitedProvidersTour')) return;
        closeMobileSidebar();
        tourDailyStats.start();
        localStorage.setItem('hasVisitedDailyStatsTour', 'true');
      });
    }

    if (!localStorage.getItem('hasVisitedStockiFyTour')) {
      if(screen.width <= 768 || window.innerWidth <= 921){
        generalTourMobile.start();
        generalTourMobile.on('complete', () => {
        openMobileSidebar();
        sideBarTour.start();
        sideBarTour.on('complete', () => {
          localStorage.setItem('hasVisitedStockiFyTour', 'true');
          localStorage.removeItem('isNewUser');
        });
        });}
      else if(screen.width > 768 && window.innerWidth > 1000){
        tour.start();
        tour.on('complete', () => {
          localStorage.setItem('hasVisitedStockiFyTour', 'true');
          localStorage.removeItem('isNewUser');
        });
      }
    }
});

