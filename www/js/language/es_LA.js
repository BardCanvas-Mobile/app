
//
// Spanish/Latin America
//

var BClanguage = {
    
    iso: 'es_LA',
    __info: {
        name: 'Español/América Latina'
    },
    
    appName: 'BardCanvas para {{platform}}',
    
    exit: {
        title:   '¿Salir ahora?',
        message: 'Nota: cualquier proceso en segundo plano se suspenderá hasta que abras la aplicación de nuevo.'
    }, 
    
    frameworkCaptions: {
        modalTitle:                    'BardCanvas'
        , modalButtonOk:               'OK'
        , modalButtonCancel:           'Cancelar'
        , modalPreloaderTitle:         'Cargando...'
        , modalUsernamePlaceholder:    'Nombre de usuario'
        , modalPasswordPlaceholder:    'Contraseña'
        , smartSelectBackText:         'Regresar'
        , smartSelectPopupCloseText:   'Cerrar'
        , smartSelectPickerCloseText:  'Hecho'
        , notificationCloseButtonText: 'Cerrar'
    },
    
    qrScanner: {
        prompt:        'Ubica el código QR dentro del recuadro',
        scanFailed:    {
            title:     '¡Ha fallado la obtención del código!',
            message:   'Ha habido un error al comunicarse con el lector de QR:<br><br>' 
                       + '%s<br><br>' 
                       + 'Por favor intenta de nuevo. Si el error persiste, trata otra vez tras reiniciar tu dispositivo.'
        },
        invalidResult: 'El código QR no tiene un valor válido'
    },
    
    actions: {
        select: 'Seleccionar',
        cancel: 'Cancelar'
    },
    
    ownedAndOperatedBy: 'Propiedad y operación por %s',
    
    pleaseProvideAURL:   'Provee el dominio o la URL de un sitio web a añadir o selecciona uno de la lista de sitios destacados.',
    websiteURLisInvalid: 'La URL del sitio web es inválida. Chécala e intenta de nuevo.',
    
    errorCallingLFSAPI:  'Error al abrir almacenamiento del sistema:<br><br>'
                         + '<span class="color-red">%s</span><br><br>'
                         + 'Por favor revisa si el almacenamiento de tu dispositivo está en buenas condiciones e' 
                         + ' intenta de nuevo.',
    unableToCreateWebsiteStorageDir: 'No se puede crear el contenedor de datos del sitio web:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Por favor asegúrate de que no hay alguna app de seguridad interponiéndose con '
                                     + 'BardCanvas y el almacenamiento de tu dispositivo está en buenas condiciones '
                                     + 'e intenta de nuevo.',
    cannotDownloadWebsiteManifest:   'No se ha podido descargar el manifiiesto del sitio web:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Por favor checa que el dominio o la URL es correcta y que tu dispositivo '
                                     + 'está conectado a internet e intenta de nuevo.',
    cannotOpenManifest:              'No se ha podido abrir el manifiesto del sitio web para escritura:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Por favor intenta de nuevo. Si el problema persiste, revisa el almacenamiento '
                                     + 'de tu dispositivo.',
    cannotReadManifest:              'No se ha podido leer el manifiesto descargado del sitio web:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Por favor intenta de nuevo. Si el problema persiste, revisa el almacenamiento '
                                     + 'de tu dispositivo.',
    websiteHasNoServices:            'Lo sentimos, pero el sitio web no parece tener ningún servicio disponible.',
    
    fileErrors: [
        'No especificado',
        'Error de seguridad',
        'Operación abortada',
        'No se puede leer el archivo',
        'Codificación incorrecta',
        'El archivo no se puede modificar',
        'Estado inválido',
        'Error de sintaxis',
        'Modificación inválida',
        'Cuota de almacenamiento excedida',
        'Tipo incorrecto',
        'La ruta ya existe'
    ],
    
    fileTransferErrors: [
        'No especificado',
        'Archivo no encontrado',
        'URL inválida',
        'Error en conexión',
        'Conexión abortada',
        'Archivo sin modificar'
    ]
};
