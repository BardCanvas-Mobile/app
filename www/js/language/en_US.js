
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
    
    actions: {
        select: 'Select',
        cancel: 'Cancel'
    },
    
    ownedAndOperatedBy: 'Owned and operated by %s',
    
    pleaseProvideAURL:   'Please provide a domain or URL to add or select one from the featured websites list.',
    websiteURLisInvalid: 'The URL you provided is invalid. Please check it and try again.',
    
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
    ]
};
