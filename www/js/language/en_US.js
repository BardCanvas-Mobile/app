
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
        title:   'Unable to read media item',
        message: 'The next error was received while trying to read the photo/video:<br><br>'
                 + '<span class="color-red">%s</span><br><br>'
                 + 'Please try again.'
    },
    
    photoUploader: {
        title:   'Unable to upload media item',
        message: 'The next error was received while trying to upload the photo/video:<br><br>'
                 + '<span class="color-red">%s</span><br><br>'
                 + 'Please try again.',
        working: 'Please wait for all attachment uploads to finish and try again.'
    },
    
    actions: {
        search:         'Search',
        select:         'Select',
        cancel:         'Cancel',
        deleteWebsite:  'Delete website',
        retry:          'Retry',
        close:          'Close',
        back:           'Back',
        disableUser:    'Disable user',
        toTrash:        'To trash',
        toDraft:        'To draft',
        toReview:       'To review',
        submit:         'Submit',
        sendAcomment:   'Send a comment',
        comment:        'Comment',
        addNow:         'Add now',
        selectForLogin: 'Select for logging in',
        skip:           'Skip',
        reload:         'Reload'
    },
    
    reloadPrompt: {
        title: 'Reload app',
        prompt: 'Do you wish to reload BardCanvas now?<br><br>Note: if you have any form or document being edited, you will loose changes.'
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
    facebookLoginUnavailable:        'Sorry, but the website doesn\'t provide Facebook Login.',
    
    facebookLoginHelper: {
        title:            'Using remote authentication',
        info:             'In order to add the website to the app using your Facebook account, you first need to ' +
                          'login to the website from your mobile browser using Facebook.<br><br>' +
                          'Once the session token is received, you need to come back to the app so ' +
                          'the website is added.',
        preloaderCaption: 'Waiting for authentication.<br>Tap here to cancel.',
        incomingError:    'Sorry, but there\'s been an error on the remote server:<br><br>' +
                          '<span class="color-red">%s</span><br><br>' +
                          'Please try again. If the problem persists, please contact the website\'s ' +
                          'tech support staff.',
        ajaxError:        'Sorry, but there\'s been an error while trying to communicate with the remote server:<br><br>' +
                          '<span class="color-red">%s</span><br><br>' +
                          'Please try again. If the problem persists, please contact the website\'s ' +
                          'tech support staff.'
    },
    
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
        caption: 'Options'
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
            simple: '%s (<span class="timeago" data-raw-date="%s">%s</span>)',
            full:   'Published by %s on %s (<span class="timeago" data-raw-date="%s">%s</span>)'
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
        defaultConfirmationPrompt: {
            title:   'Please confirm',
            message: 'Do you want to proceed?'
        },
        unregisteredAction: {
            title:   'Action not found',
            message: '<p>The action you triggered wasn\'t found ' +
                     '   on the local website actions registry. ' +
                     '   The website may have been updated but the ' +
                     '   local manifest hasn\'t.</p>' +
                     '<p>Please delete the website and add it again. ' +
                     '   If the problem persists, you may need to contact' +
                     '   the website support staff.</p>'
        },
        invalidCallMethod: {
            title:   'Invalid call method',
            message: '<p>The action you triggered has a calling method not present ' +
                     '   on the local website actions registry. ' +
                     '   The website may have been updated but the ' +
                     '   local manifest hasn\'t.</p>' +
                     '<p>Please delete the website and add it again. ' +
                     '   If the problem persists, you may need to contact' +
                     '   the website support staff.</p>'
        }
    },
    
    sharing: {
        title:   'Select an app',
        error:   'Error trying to share the item:<br><br>' +
                 '<span class="color-red">%s</span>'
    },
    
    noneSelected: 'None selected',
    
    noEntriesFound: 'No entries found.',
    
    remoteListLoadError: 'Cannot download options list for "%s": %s.',
    
    documents: 'Documents',
    
    extras: 'Extras',
    
    openWebsiteInBrowser: 'Open website in web browser',
    
    cannotDetectFileType: 'Sorry, but it is not possible detect the type of the file "%s"<br><br>' +
                          'Error: %s<br><br>' +
                          'This issue might be caused by the media gallery. Please try picking the file ' +
                          'from its location (Phone, SD card, etc.) by browsing your phone folders.',
    
    cannotOpenSettingsFile:  'Unable to open the settings file:<br><br>'
                             + '<span class="color-red">%s</span><br><br>'
                             + 'Please try again. If the problem persists, please check your device storage.',
    cannotWriteSettingsFile: 'Unable to save the settings file:<br><br>'
                             + '<span class="color-red">%s</span><br><br>'
                             + 'Please try again. If the problem persists, please check your device storage.',
    
    languageSwitchingConfirmation: {
        title:   'Reload required',
        message: 'The app needs to be reloaded in order to switch the language.<br><br>Would you like to do it now?'
    },
    
    today: 'Today',
    
    cannotGetFeaturedSitesList: 'Cannot get the featured sites list from the BardCanvas website.<br><br>' +
                                'Error: <span class="color-red">%s</span><br><br>' +
                                'Please try reloading the app <a onclick="location.reload()">clicking here</a>.',
    
    chatMessages: {
        messagePlaceholder: 'Type your message',
        closeChat:          'Close chat',
        archiveChat:        'Archive chat',
        deleteChat:         'Delete chat',
        blockUser:          'Block user'
    },
    
    chatPrompts: {
        userBlock: 'Do you want to block this user?<br><br>' +
                   'If you want to unblock them, you will have to do it from your' +
                   'preferences editor on the website using a web browser.',
        delete:    'Do you want to delete this conversation?<br><br>' +
                   'Note: only your side of the conversation will be deleted.<br><br>' +
                   'This action cannot be undone.',
        archive:   'Do you want to archive this conversation?<br><br>' +
                   'It will be moved to the archived conversations area.'
    },
    
    chatActionErrors: {
        title:            'Unable to execute action',
        add_to_blocklist: 'Unable to add user to blocklist.<br><br>' +
                          'Error: <span class="color-red">%s</span><br><br>' +
                          'Please try again. If the problem persists, please contact the website support staff.',
        delete:           'Unable to delete the conversation.<br><br>' +
                          'Error: <span class="color-red">%s</span><br><br>' +
                          'Please try again. If the problem persists, please contact the website support staff.',
        archive:          'Unable to archive the conversation.<br><br>' +
                          'Error: <span class="color-red">%s</span><br><br>' +
                          'Please try again. If the problem persists, please contact the website support staff.'
    }
};
