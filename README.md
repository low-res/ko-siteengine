# ko-siteengine

simple, wired up router, pagetransition and preloading setup for ko based apps

Read through code of navigation and pagecontainer components for example usage.

Some random notes:

It is always mandatory to supply an array of routes for your apploication.
It is an JSON Array with the following structure:
```
[
    { 
        id:1,    
        url: 'folder1/page1',    
        params: { 
            page: 'accountactivity-page' , icon:'' 
        }, 
        pageparams:{ 
            spendings:false 
        } 
    },
    { 
        id:2,    
        url: 'folder1/page2',    
        params: { 
            page: 'invoices-page', 
            icon:'fa fa-copy', 
            type:"notinmenu" 
        }, 
        children:[
            { 
                id:3, 
                url: 'page3', 
                params: { 
                    page: 'invoicedetail-page'  , 
                    icon:'fa fa-detail' 
                } 
            }
        ] 
    },
    ...
]
```

              
            