
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
        cancel: 'Cancel',
        deleteWebsite: 'Delete website'
    },
    
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
    }
};
