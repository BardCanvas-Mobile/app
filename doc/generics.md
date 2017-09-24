
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
        website_name: "Whatever",
        data_delivery_url: "http://some-domain.com/bc_mobile/data.php",
        user_data: {
            level: 10,
            allow_posting_items: true,
            base_item_type: "post",
        }
    }

## Data Packages

* It is a fully featured feed in JSON format, zipped, containing media.

* Every package must be saved in the app’s cache directory.

* There should be options to set how often the site should be polled for updates.

## Launching process

1. User taps the app's icon.
2. Is first run?  
	Yes: show the addition selector.  
	No: open the wall.

## Views

* **Main (preloading) view**  
  This view contains the BardCanvas logo and a progress indicator of
  app initializing.

* **Add site view:**  
  This view allows addition of a website. The user shouldn't be able to
  come back to this page after adding a site. 

* **Site view**  
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

>	Main (preloading) view  
>	'--> Welcome page with site addition  
>	'--> Site index

### App run with one site added

>	Main (preloading) view  
>	'--> Site index

### App run with multiple sites added

>	Main (preloading) view  
>	'--> Compound site index
