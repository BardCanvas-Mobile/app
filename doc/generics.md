
![BardCanvas Logo](Logo-BardCanvas-425x100.png)

# BardCanvas Mobile App Generics

## First run

* On first run, the app shows the logo, a website addition form and links
  to the featured sites.

* The featured sites list must be downloaded form the BardCanvas main server
  every time it is accessed on the app.

## Adding a website

* When a URL and credentials are provided, the website manifest must be
  downloaded from the website.

* Once the manifest is downloaded, a data package is downloaded and saved
  locally.

* Once the data package is downloaded, the contents are displayed.

## Storage structure

Website manifests are saved on **PERMANENT** storage, one per domain, E.G.:

    domain1.com.manifest.json
    domain2.com.manifest.json
    domain3.com-subdir1.manifest.json
    domain3.com-subdir2.manifest.json

Websites registry is a collection of website objects (with login info, etc.)
and is saved as:

    websites-registry.json

All images and media files from data packages are cached using **TEMPORARY** storage
with the [ImgCache plugin](https://github.com/chrisben/imgcache.js/).

## Important fix for iPhone

The In-App Browser plugin for Cordova doesn't fit properly on the viewport due to a hardcoded height
of the status bar on the `CVDinAppBrowser.m` file.

When making a full rebuild, the next line must be changed at the top of the file:

    #define    STATUSBAR_HEIGHT 20

to:

    #define    STATUSBAR_HEIGHT 0

## Website manifest

It is a JSON file placed at the document root (or the subdirectory where the BardCanvas instance is installed) and named `bardcanvas_mobile.json`. Contains all website underlying data, E.G.:

    {
      "name":           "Website name",
      "rootURL":        "http://some-domain.com",
      "language":       "en_US",
      "company":        "Company name",
      "companyPageURL": "http://some-domain.com",
      "description":    "Website description",
      "disclaimer":     "Disclaimer to show",
      "icon":           "http://domain.com/path/to/icon.png",
      
      "loginRequired":      true,
      "loginAuthenticator": "http://some-domain.com/authenticator.php",
      
      "services": {
        "handler": {
          "caption":  "Caption",
          "isOnline": true,
          "url":      "http://some-domain.com/some-page.php",
          "icon":     "fa-address-card-o"
        }
      }
    }

Services are the pages that will be rendered on the website's view on BardCanvas. A website can offer more than one service, and they're treated as tabs on the interface.

* If only one service is specified, then no tabs bar will be rendered.
* Between one and five services specified, a tabs bar will be rendered.
* If more than five services are specified, the first four will be shown on the
  tabs bar and a "more" tab will be shown. This tab will show a popover with
  the rest of the services to be selected. 

**Note about service icons:** there are *four* variants on this property:
  
* `fa-something` To show an icon from a Font Awesome icon class,  
  E.G. `fa-info-circle` to render `<i class="fa fa-info-circle"></i>`
* `something` To show a Framework7 icon (used for iOS), E.G.  
  `world` to render `<i class="icon f7-icons">world</i>`
* `"something,fa-something"` To show the corresponding
  icons from Framework7 for iOS and Font Awesome for Android using the
  directives described above. This is the preferred method to increase the
  odds on Apple iTunes submissions.
* `http://domain.com/image.png` To fetch an image from a remote website and
  save it to temporary cache.

## Data Packages

* It is a fully featured feed in JSON format, gzipped, containing media files
  as inlined data.

* Every package must be saved in the app’s cache directory.

* Every post in the package must be saved into a single file, having the
  timestamp as file name. 

* There should be options to set how often the site should be polled for updates.

## Launching process

1. User taps the app's icon.
2. Is first run?  
   Yes: show the addition selector.  
   No: open the first registered site.

## Views

* **Main view**  
  This view contains the BardCanvas logo and a progress indicator of
  app initializing.

* **Add site view:**  
  This view allows addition of a website. The user shouldn't be able to
  come back to this page after adding a site.

* **Site views**  
  A view for every website. Includes the next pages:

    * **Index:**  
      An added website index. In case of blogs, downloaded entries will be shown here.  
      *Note: this and the "wall" (see below) are actually the "main" views, where
      the user will spend most of the time.*

    * **Single document:**  
      E.G. a post with all its controls.

    * **Single document helpers:**  
      Helper pages to show extra contents like polls, comments, clicked images,
      author/user profiles, etc. Created automatically.

* **Preferences editor:**  
  It has controls to customize the user experience and communication with the websites.
