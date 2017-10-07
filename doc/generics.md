
![BardCanvas Logo](Logo-BardCanvas-425x100.png)

# BardCanvas Mobile App Generics

## First run

* On first run, the app shows the logo, a website addition form and a link
  to the featured sites list.

* The featured sites list must be downloaded form the BardCanvas main server
  every time it is accessed on the app.

## Adding a website

* When a URL and credentials are provided, the website manifest must be
  downloaded from the website.

* Once the manifest is downloaded, a data package is downloaded and saved
  locally.

* Once the data package is downloaded, the contents are displayed.

## Website manifest

It is a JSON file containing all website underlying data, E.G.:

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

**Note about service icons:** there are four variants on this property:
  
* `fa-something` To show an icon from a Font Awesome icon class,  
  E.G. `fa-info-circle` to render `<i class="fa fa-info-circle"></i>`
* `something` To show a Framework7 icon (used for iOS), E.G.  
  `world` to render `<i class="icon f7-icons">world</i>`
* `"something,fa-something"` To show the corresponding
  icons from Framework7 for iOS and Font Awesome for Android using the
  directives described above. This is the preferred method to increase the
  odds on Apple iTunes submissions.
* `data:image/type;base64,...` To show an inlined 256x256 JPEG/PNG/GIF icon
  instead of a font based icon.

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
   No: open the wall.

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

* **The wall**  
  This is a compound view of the latest posts on all added websites.  
  If the user has only one website, then this one will be shown.

* **Preferences editor:**  
  It has a tabs bar at the top, one for the engine and one for every
  website added to the app.  
  *Note: this page should have a split view!*

## Navigation routes

### First run

> Main (preloading) view  
> '--> Welcome page with site addition  
> '--> Site index

### App run with one site added

> Main (preloading) view  
> '--> Site index

### App run with multiple sites added

> Main (preloading) view  
> '--> Compound site index
