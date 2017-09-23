
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

## The wall

This is a compound view of the latest posts on all added websites.

If the user has only one website, then this one will be shown.
