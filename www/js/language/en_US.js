
//
// English/United States
//

var BClanguage = {
    
    iso: 'en_US',
    __info: {
        name: 'English/United States'
    },
    
    appName: 'BardCanvas for {{platform}}',
    
    exit: {
        caption: 'Exit',
        title:   'Exit now?',
        message: 'Note: any background process will be stopped until the next time you open the app.'
    },
    
    frameworkCaptions: {
        modalTitle:                    'BardCanvas'
        , modalButtonOk:               'OK'
        , modalButtonCancel:           'Cancel'
        , modalPreloaderTitle:         'Loading...'
        , modalUsernamePlaceholder:    'Username'
        , modalPasswordPlaceholder:    'Password'
        , smartSelectBackText:         'Back'
        , smartSelectPopupCloseText:   'Close'
        , smartSelectPickerCloseText:  'Done'
        , notificationCloseButtonText: 'Close'
    },
    
    qrScanner: {
        prompt:        'Place a QR code inside the scan area',
        scanFailed:    {
            title:   'Scanning failed!',
            message: 'There was a problem accessing the QR Scanner:<br><br>' 
                     + '<span class="color-red">%s</span><br><br>' 
                     + 'Please try again. If the problem persists, try again after restarting your device.'
        },
        invalidResult: 'The QR code has an invalid value'
    },
    
    photoRetriever: {
        title:   'Unable to read photo',
        message: 'The next error was received while trying to read the photo:<br><br>'
                 + '<span class="color-red">%s</span><br><br>'
                 + 'Please try again.'
    },
    
    actions: {
        select:        'Select',
        cancel:        'Cancel',
        deleteWebsite: 'Delete website',
        retry:         'Retry',
        close:         'Close',
        back:          'Back',
        disableUser:   'Disable user',
        toTrash:       'To trash',
        toDraft:       'To draft',
        toReview:      'To review'
    },
    
    userLevelCaption: 'Author level %s (%s)',
    userMemberSince:  'Member since %s (%s)',
    
    of: 'of',  // When saying "x of y"
    
    ownedAndOperatedBy: 'Owned and operated by %s',
    
    pleaseProvideAURL:   'Please provide a domain or URL to add or select one from the featured websites list.',
    websiteURLisInvalid: 'The URL you provided is invalid. Please check it and try again.',
    
    passwordMissing:                 'Please type the password to access the specified user account.',
    websiteAlreadyAdded:             'You already have this website/user name combination in the registry.',
    errorCallingLFSAPI:              'Error opening storage system:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>' 
                                     + 'Please check if your device storage is OK and try again.',
    unableToOpenWebsiteStorageDir:   'Unable to open website storage directory:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Please check if some security app is messing with BardCanvas and your ' 
                                     + 'device storage is OK and try again.',
    cannotDownloadWebsiteManifest:   'Unable to download website manifest:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Please check the domain or URL is correct and your device is connected '
                                     + 'to the internet and try again.',
    cannotOpenManifest:              'Unable to open the website manifest file:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Please try again. If the problem persists, please check your device storage.',
    cannotReadManifest:              'Unable to read the downloaded manifest file for website:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Please try again. If the problem persists, please check your device storage.',
    cannotWriteManifest:             'Unable to save the manifest file for website:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Please try again. If the problem persists, please check your device storage.',
    cannotOpenWebsitesRegistry:      'Unable to open the websites registry:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Please try again. If the problem persists, please check your device storage.',
    cannotWriteWebsitesRegistry:     'Unable to save the websites registry:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Please try again. If the problem persists, please check your device storage.',
    websiteHasNoServices:            'Sorry, but the website doesn\'t seem to have any services available.',
    websiteRequiresAuthentication:   'You need to provide login credentials for this website.',
    cancelAndEnterCredentials:       'Please hit "Cancel" and provide a user name or alias and a password.',
    checkingWebsite:                 'Looking up website...',
    validatingCredentials:           'Validating access...',
    validatingError:                 'Error validating login credentials:<br><br>'
                                     + '<span class="color-red">%s</span><br><br>'
                                     + 'Please check that your device is connected to the internet and'
                                     + 'try again. If the problem persists, try after a few minutes.',
    
    fileErrors: [
        'Undefined',
        'Security error',
        'Operation aborted',
        'Unable to read file',
        'Encoding mismatch',
        'File cannot be modified',
        'Invalid state',
        'Syntax error',
        'Invalid modification',
        'Quota exceeded',
        'Type mismatch',
        'Path already exists'
    ],
    
    fileTransferErrors: [
        'Undefined',
        'File not found',
        'Invalid URL',
        'Connection error',
        'Connection aborted',
        'File not modified'
    ],
    
    websites:        'Websites',
    websiteServices: 'Website Services',
    options:         'Options',
    
    appConfiguration: {
        caption: 'Configuration'
    },
    
    deleteWebsite: {
        title:  'Do you want to delete this website?',
        prompt: 'Only the items downloaded to this device will be removed. ' +
                'If you have more than one account linked to this domain on this device, ' +
                'only this one will be removed.'
    },
    
    websiteManifestUpdated: {
        title:   'Website updated',
        message: 'An update for this website has been downloaded. ' +
                 'If you don\'t have any pending activity, you should reload now.<br><br>' +
                 '¿Do you want to reload BardCanvas now?'
    },
    
    colorThemes: {
        ios: {
            blue:      'Blue (default),#007aff',
            lightblue: 'Light Blue,#5ac8fa',
            yellow:    'Yellow,#ffcc00',
            orange:    'Orange,#ff9500',
            pink:      'Pink,#ff2d55',
            green:     'Green,#4cd964',
            red:       'Red,#ff3b30',
            gray:      'Gray,#8e8e93',
            white:     'White,#ffffff',
            black:     'Black,#000000'
        },
        android: {
            blue:       'Blue (default),#2196f3',
            red:        'Red,#f44336',
            pink:       'Pink,#e91e63',
            purple:     'Purple,#9c27b0',
            deeppurple: 'Deep Purple,#673ab7',
            indigo:     'Indigo,#3f51b5',
            lightblue:  'Light Blue,#03a9f4',
            cyan:       'Cyan,#00bcd4',
            teal:       'Teal,#009688',
            green:      'Green,#4caf50',
            lightgreen: 'Light Green,#8bc34a',
            lime:       'Lime,#cddc39',
            yellow:     'Yellow,#ffeb3b',
            amber:      'Amber,#ffc107',
            orange:     'Orange,#ff9800',
            deeporange: 'Deep Orange,#ff5722',
            brown:      'Brown,#795548',
            gray:       'Gray,#9e9e9e',
            bluegray:   'Blue Gray,#607d8b',
            white:      'White,#ffffff',
            black:      'Black,#000000'
        }
    },
    
    unknownService: {
        title:   'Unknown service type',
        message: '<p>Our apologies, but this website service is using an unknown service type for this BardCanvas version.</p>' +
                 '<p>Please check if you have the latest version. If not, you should update it to access this service.</p>' +
                 '<p>If this message persists, please contact {{manifest.shortName}} by sending them ' +
                 '   an email to {{manifest.contactEmail}} and inform them about it. ' +
                 '   If possible, provide a screenshot of this view.</p>'
    },
    
    failedToLoadService: {
        title:   'Failed to load service',
        message: '<p>Sorry, but the service failed to load with the next error:</p>' +
                 '<p>{{error}}</p>' +
                 '<p>Please try again. If the problem persists, please contact {{manifest.shortName}} by sending them ' +
                 '   an email to {{manifest.contactEmail}} and inform them about it.</p>'
    },
    
    defaultUserLevels: {
          '0': 'Unregistered',
          '1': 'Unconfirmed',
         '10': 'Newcomer',
        '100': 'Author',
        '150': 'VIP',
        '200': 'Editor',
        '240': 'Coadmin',
        '255': 'Admin'
    },
    
    dateFormats: {
        "shorter": "MMM/DD/YY hh:mm",
        "short":   "dddd, MMM/DD h:mm A",
        "long":    "dddd MMM/DD/YYYY h:mm A"
    },
    
    feeds: {
        publishedCaption: {
            simple: '%s (%s)',
            full:   'Published by %s on %s (%s)'
        },
        empty: '<p>There are no entries for this feed.</p>',
        noMoreItemsAvailable: 'There are no more entries available at the moment.',
        errorReceived: {
            title:   'Error received from feed server',
            message: '<p>Sorry, but the feed server sent an error while fetching the contents:</p>' +
                     '<p>{{error}}</p>' +
                     '<p>Please try again. If the problem persists, please contact {{manifest.shortName}} ' +
                     '   by sending them an email to {{manifest.contactEmail}} and inform them about it.</p>' 
        }
    },
    
    about:    'About',
    from:     'From',
    comments: 'comments',
    
    actionsController: {
        unregisteredAction: {
            title:   'Action not found',
            message: '<p>The action you triggered wasn\'t found ' +
                     '   on the local website actions registry. ' +
                     '   The website may have been updated but the ' +
                     '   local manifest hasn\'t.</p>' +
                     '<p>Please delete the website and add it again. ' +
                     '   If the problem persists, you may need to contact' +
                     '   the website support staff.</p>'
        }
    }
};
