
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
        caption: 'Salir',
        title:   '¿Salir ahora?',
        message: 'Nota: cualquier proceso en segundo plano se suspenderá hasta que abras la aplicación de nuevo.'
    }, 
    
    frameworkCaptions: {
        modalTitle:                    'BardCanvas'
        , modalButtonOk:               'Aceptar'
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
                       + '<span class="color-red">%s</span><br><br>' 
                       + 'Por favor intenta de nuevo. Si el error persiste, trata otra vez tras reiniciar tu dispositivo.'
        },
        invalidResult: 'El código QR no tiene un valor válido'
    },
    
    photoRetriever: {
        title:   'Imposible leer medio',
        message: 'Se detectó el siguiente problema al tratar de leer la imagen/video:<br><br>'
                 + '<span class="color-red">%s</span><br><br>'
                 + 'Por favor intenta de nuevo.'
    },
    
    photoUploader: {
        title:   'Imposible subir medio',
        message: 'Se detectó el siguiente problema al tratar de subir la imagen/video:<br><br>'
                 + '<span class="color-red">%s</span><br><br>'
                 + 'Por favor intenta de nuevo.',
        working: 'Por favor espera a que terminen de subir todos los medios anexos e intenta de nuevo.'
    },
    
    actions: {
        search:         'Buscar',
        select:         'Seleccionar',
        cancel:         'Cancelar',
        deleteWebsite:  'Borrar sitio',
        retry:          'Reintentar',
        close:          'Cerrar',
        back:           'Regresar',
        disableUser:    'Deshabilitar',
        toTrash:        'A Papelera',
        toDraft:        'A Borrador',
        toReview:       'A revisión',
        submit:         'Enviar',
        sendAcomment:   'Envía un comentario',
        comment:        'Comentar',
        addNow:         'Añadir ahora',
        selectForLogin: 'Seleccionar para entrar',
        skip:           'Saltar'
    },
    
    userLevelCaption: 'Autor nivel %s (%s)',
    userMemberSince:  'Miembro desde %s (%s)',
    
    'of': 'de', // When saying "x of y"
    
    ownedAndOperatedBy: 'Propiedad y operación por %s',
    
    pleaseProvideAURL:   'Provee el dominio o la URL de un sitio web a añadir o selecciona uno de la lista de sitios destacados.',
    websiteURLisInvalid: 'La URL del sitio web es inválida. Chécala e intenta de nuevo.',
    
    passwordMissing:                 'Por favor especifica la contraseña para accesar a la cuenta especificada.',
    websiteAlreadyAdded:             'Ya has registrado esta combinación de sitio web y nombre de usuario.',
    errorCallingLFSAPI:              'Error al abrir almacenamiento del sistema:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Por favor revisa si el almacenamiento de tu dispositivo está en buenas condiciones e' 
                                     + ' intenta de nuevo.',
    unableToOpenWebsiteStorageDir:   'No se puede abrir el directorio de datos del sitio web:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Por favor asegúrate de que no hay alguna app de seguridad interponiéndose con '
                                     + 'BardCanvas y el almacenamiento de tu dispositivo está en buenas condiciones '
                                     + 'e intenta de nuevo.',
    cannotDownloadWebsiteManifest:   'No se ha podido descargar el manifiiesto del sitio web:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Por favor checa que el dominio o la URL es correcta y que tu dispositivo '
                                     + 'está conectado a internet e intenta de nuevo.',
    cannotOpenManifest:              'No se ha podido abrir el manifiesto del sitio web:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Por favor intenta de nuevo. Si el problema persiste, revisa el almacenamiento '
                                     + 'de tu dispositivo.',
    cannotWriteManifest:             'No se ha podido guardar el manifiesto del sitio web:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Por favor intenta de nuevo. Si el problema persiste, revisa el almacenamiento '
                                     + 'de tu dispositivo.',
    cannotOpenWebsitesRegistry:      'No se ha podido abrir el registro de sitios web:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Por favor intenta de nuevo. Si el problema persiste, revisa el almacenamiento '
                                     + 'de tu dispositivo.',
    cannotWriteWebsitesRegistry:     'No se ha podido guardar el registro de sitios web:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Por favor intenta de nuevo. Si el problema persiste, revisa el almacenamiento '
                                     + 'de tu dispositivo.',
    websiteHasNoServices:            'Lo sentimos, pero el sitio web no parece tener ningún servicio disponible.',
    websiteRequiresAuthentication:   'Necesitas proporcionar credenciales de acceso para este sitio web.',
    cancelAndEnterCredentials:       'Da click en "Cancelar" y provee un nombre de usuario o alias y una contraseña.',
    checkingWebsite:                 'Buscando sitio web...',
    validatingCredentials:           'Validando acceso...',
    validatingError:                 'Error al validar los datos de acceso:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Por favor revisa que tu dispositivo esté conectado a internet '
                                     + 'e intenta de nuevo. Si el problema persiste, intenta más tarde.',
    facebookLoginUnavailable:        'Lo sentimos, pero el sitio web no provee autenticación vía Facebook.',
    
    facebookLoginHelper: {
        title:            'Usando autenticación remota',
        info:             'Para poder registrar el sitio web en la app usando tu cuenta de Facebook, ' +
                          'es necesario que abras sesión en el sitio web usando tu cuenta de Facebook ' +
                          'en el navegador de tu dispositivo móvil.<br><br>' +
                          'Una vez que se reciba el token de la sesión, se te regresará a la app y ' +
                          'se añadirá el sitio web.',
        preloaderCaption: 'Esperando autenticación.<br>Toca aquí para cancelar.',
        incomingError:    'Lo sentimos, pero ha habido un error en el servidor remoto:<br><br>' +
                          '<span class="color-red">%s</span><br><br>' +
                          'Intenta de nuevo. Si el problema persiste, por favor ponte en contacto ' +
                          'con el staff de soporte del sitio web.',
        ajaxError:        'Lo sentimos, pero ha habido un problema al tratar de comunicarse con el servidor remoto:<br><br>' +
                          '<span class="color-red">%s</span><br><br>' +
                          'Intenta de nuevo. Si el problema persiste, por favor ponte en contacto ' +
                          'con el staff de soporte del sitio web.'
    },
    
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
    ],
    
    websites:        'Sitios web',
    websiteServices: 'Servicios del sitio',
    options:         'Opciones',
    
    appConfiguration: {
        caption: 'Opciones'
    },
    
    deleteWebsite: {
        title:  '¿Deseas borrar este sitio?',
        prompt: 'Al borrarlo, se removerán de este dispositivo todos los elementos descargados. ' +
                'Si tienes más de una cuenta vinculada, sólo se removerá la actual.'
    },
    
    websiteManifestUpdated: {
        title:   'Sitio web actualizado',
        message: 'Se ha descargado una actualización de este sitio web. ' +
                 'Si no tienes alguna actividad pendiente, es recomendable recargar ahora.<br><br>' +
                 '¿Deseas recargar BardCanvas ahora?'
    },
    
    colorThemes: {
        ios: {
            blue:      'Azul (predeterminado),#007aff',
            lightblue: 'Azul claro,#5ac8fa',
            yellow:    'Amarillo,#ffcc00',
            orange:    'Naranja,#ff9500',
            pink:      'Rosa,#ff2d55',
            green:     'Verde,#4cd964',
            red:       'Rojo,#ff3b30',
            gray:      'Gris,#8e8e93',
            white:     'Blanco,#ffffff',
            black:     'Negro,#000000'
        },
        android: {
            blue:       'Azul (predeterminado),#2196f3',
            red:        'Rojo,#f44336',
            pink:       'Rosa,#e91e63',
            purple:     'Morado,#9c27b0',
            deeppurple: 'Morado oscuro,#673ab7',
            indigo:     'Índigo,#3f51b5',
            lightblue:  'Azul claro,#03a9f4',
            cyan:       'Cian,#00bcd4',
            teal:       'Verde azulado,#009688',
            green:      'Verde,#4caf50',
            lightgreen: 'Verde claro,#8bc34a',
            lime:       'Lima,#cddc39',
            yellow:     'Amarillo,#ffeb3b',
            amber:      'Ámbar,#ffc107',
            orange:     'Naranja,#ff9800',
            deeporange: 'Naranja oscuro,#ff5722',
            brown:      'Café,#795548',
            gray:       'Gris,#9e9e9e',
            bluegray:   'Gris azulado,#607d8b',
            white:      'Blanco,#ffffff',
            black:      'Negro,#000000'
        }
    },
    
    unknownService: {
        title:   'Tipo de servicio desconocido',
        message: '<p>Lo sentimos, pero este servicio está usando un formato desconocido por esta versión de BardCanvas.</p>' +
                 '<p>Checa si tienes la última versión. De no ser así, deberías actualizarla para ganar acceso a este servicio.</p>' +
                 '<p>Si este mensaje persiste, por favor contacta a {{manifest.shortName}}' +
                 '   enviándoles un correo a {{manifest.contactEmail}}  e infórmales al respecto. ' +
                 '   De ser posible, provee una captura de pantalla de esta vista.</p>'
    },
    
    failedToLoadService: {
        title:   'Error al cargar servicio',
        message: '<p>Lo sentimos, pero el servicio no se ha podido cargar por el siguiente error:</p>' +
                 '<p>{{error}}</p>' +
                 '<p>Por favor intenta de nuevo. Si el problema persiste, contacta a {{manifest.shortName}} ' +
                 '   enviándoles un correo a {{manifest.contactEmail}} e infórmales al respecto.</p>'
    },
    
    defaultUserLevels: {
          '0': 'Invitado',
          '1': 'Sin confirmar',
         '10': 'Novato',
        '100': 'Autor',
        '150': 'VIP',
        '200': 'Editor',
        '240': 'Coadmin',
        '255': 'Admin'
    },
    
    dateFormats: {
        "shorter": "DD/MMM/YY hh:mm",
        "short":   "dddd DD/MMM h:mm A",
        "long":    "dddd DD/MMM/YYYY h:mm A"
    },
    
    feeds: {
        publishedCaption: {
            simple: '%s (<span class="timeago" data-raw-date="%s">%s</span>)',
            full:   'Por %s el %s (<span class="timeago" data-raw-date="%s">%s</span>)'
        },
        empty: '<p>No hay entradas en esta fuente.</p>',
        noMoreItemsAvailable: 'No hay más entradas disponibles por el momento.',
        errorReceived: {
            title:   'Error al descargar la fuente',
            message: '<p>Disculpa, pero el servidor de la fuente ha enviado un error al descargar el contenido:</p>' +
                     '<p>{{error}}</p>' +
                     '<p>Por favor intenta de nuevo. Si el problema persiste, contacta a {{manifest.shortName}} ' +
                     '   enviándoles un correo a {{manifest.contactEmail}} e infórmales al respecto.</p>'
        }
    },
    
    about:    'Acerca de',
    from:     'De',
    comments: 'comentarios',
    
    actionsController: {
        defaultConfirmationPrompt: {
            title:   'Favor de confirmar',
            message: '¿Deseas proceder?'
        },
        unregisteredAction: {
            title:   'Acción no encontrada',
            message: '<p>La acción que has elegido no se ha encontrado ' + 
                     '   en el registro de acciones del sitio web. ' + 
                     '   Posiblemente se ha actualizado el sitio web ' +
                     '   pero no el manifiesto local.</p>' +
                     '<p>Por favor elimina el sitio y agrégalo de nuevo. ' +
                     '   Si el problema persiste, por favor ponte en contacto' +
                     '   con el staff técnico del sitio web.</p>'
        },
        invalidCallMethod: {
            title:   'Método de llamda inválido',
            message: '<p>La acción que has elegido usa un método de llamada no encontrado ' + 
                     '   en el registro de acciones del sitio web. ' + 
                     '   Posiblemente se ha actualizado el sitio web ' +
                     '   pero no el manifiesto local.</p>' +
                     '<p>Por favor elimina el sitio y agrégalo de nuevo. ' +
                     '   Si el problema persiste, por favor ponte en contacto' +
                     '   con el staff técnico del sitio web.</p>'
        }
    },
    
    sharing: {
        title:   'Selecciona aplicación',
        error:   'Error al intentar compartir el elemento:<br><br>' +
                 '<span class="color-red">%s</span>'
    },
    
    noneSelected: 'Sin selección',
    
    noEntriesFound: 'No se han encontrado entradas.',
    
    remoteListLoadError: 'No se ha podido descargar la lista de opciones para "%s": %s.',
    
    documents: 'Documentos',
    
    extras: 'Extras',
    
    openWebsiteInBrowser: 'Abrir sitio web en navegador',
    
    cannotDetectFileType: 'Disculpa, pero no se puede detectar el tipo de archivo que has seleccionado. ' +
                          'Por favor selecciona otro.',
    
    cannotOpenSettingsFile:  'No se ha podido abrir el archivo de preferencias:<br><br>'
                             + '<span class="color-red">%s</span><br><br>'
                             + 'Por favor intenta de nuevo. Si el problema persiste, revisa el almacenamiento '
                             + 'de tu dispositivo.',
    cannotWriteSettingsFile: 'No se ha podido guardar el archivo de preferencias:<br><br>'
                             + '<span class="color-red">%s</span><br><br>'
                             + 'Por favor intenta de nuevo. Si el problema persiste, revisa el almacenamiento '
                             + 'de tu dispositivo.',
    
    languageSwitchingConfirmation: {
        title:   'Recarga necesaria',
        message: 'La app necesita recargarse para poder cambiar el lenguaje.<br><br>¿Deseas hacerlo ahora?'
    },
    
    today: 'Hoy',
    
    cannotGetFeaturedSitesList: 'No se ha podido descargar la lista de sitios destacados del sitio web de BardCanvas.<br><br>' +
                                'Error: <span class="color-red">%s</span><br><br>' +
                                'Por favor trata recargando la app <a onclick="location.reload()">dando click aquí</a>.',
    
    chatMessages: {
        messagePlaceholder: 'Escribe tu mensaje',
        closeChat:          'Cerrar chat',
        archiveChat:        'Archivar chat',
        deleteChat:         'Borrar chat',
        blockUser:          'Bloquear usuario'
    },
    
    chatPrompts: {
        userBlock: '¿Deseas bloquear a esta persona?<br><br>' +
                   'Si deseas desbloquearla, deberás hacerlo desde el editor de tus preferencias' +
                   'en el sitio web usando un navegador.',
        delete:    '¿Deseas eliminar esta conversación?<br><br>' +
                   'Nota: sólo se eliminará tu lado de la misma.<br><br>' +
                   'Esta acción no puede deshacerse.',
        archive:   '¿Deseas archivar esta conversación?<br><br>' +
                   'Se moverá al área de conversaciones archivadas.'
    },
    
    chatActionErrors: {
        title:            'Error al ejecutar acción',
        add_to_blocklist: 'No se ha podido agregar al usuario a la lista de bloqueo:<br><br>' +
                          'Error: <span class="color-red">%s</span><br><br>' +
                          'Por favor intenta de nuevo. Si el problema persiste, por favor ponte en contacto ' +
                          'con el staff de soporte técnico del sitio web.',
        delete:           'No se ha podido eliminar la conversación.<br><br>' +
                          'Error: <span class="color-red">%s</span><br><br>' +
                          'Por favor intenta de nuevo. Si el problema persiste, por favor ponte en contacto ' +
                          'con el staff de soporte técnico del sitio web.',
        archive:          'No se ha podido archivar la conversación.<br><br>' +
                          'Error: <span class="color-red">%s</span><br><br>' +
                          'Por favor intenta de nuevo. Si el problema persiste, por favor ponte en contacto ' +
                          'con el staff de soporte técnico del sitio web.'
    }
};
