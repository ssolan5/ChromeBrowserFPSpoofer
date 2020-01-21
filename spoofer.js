
//Overwrite creating a script element. 






/*const additionalscript = 'const createElementBackup = document.createElement;console.log("this is running");'+
    'document.createElement = function(...args) {'+

    'if(args[0].toLowerCase() !== \'script\' ){' +
        'return createElementBackup.bind(document)(...args);}'+

    'var scriptElt = createElementBackup.bind(document)(...args);'+

    'if(window.jQuery){'+
         'console.log(scriptElt.src);'+
         '$.ua = bleh;}' +
    // Do some magic, see below
   
    'return 0};';
*/



/*const additionalscript = 'const currentScriptBackup = document.currentScript;console.log("this is running");'+
    'document.currentScript = function(...args) {'+

    'var scriptElt = currentScriptBackup.bind(document)(...args);'+
    'if(scriptElt.src.includes(\'jquery\')){'+
         'console.log(scriptElt.src);'+
         'scriptElt.innerHTML = \'if(!typeof $ !== UNDEF_TYPE && !$.ua) $.ua = bleh\'}' +
    // Do some magic, see below
   
    'return 0};';*/



/*const additionalscript = 'const createElementBackup = document.createElement;console.log("this is running");'+
    'document.createElement = function(...args) {'+

    'if(args[0].toLowerCase() !== \'script\' ){' +
        'return createElementBackup.bind(document)(...args);}'+

    'var scriptElt = createElementBackup.bind(document)(...args);'+

    'if(window.jQuery){'+
         'console.log(scriptElt.src);'+
         '$.ua = bleh;}' +
    // Do some magic, see below
   
    'return 0};';

const scriptElementJQuery = document.createElement('script');
scriptElementJQuery.innerHTML = additionalscript;
document.documentElement.append(scriptElementJQuery);*/

//
/*const overwriteDocumentCreateElement = (scriptelt) => {
  Object.defineProperty(HTMLScriptElement.prototype.setAttribute, 'innerHTML', {
    set: () => {

       console.log(document.currentScript); 
       //console.log('this is running');
       this.setAttribute("src",scriptelt)},
  });
};*/




// Overwrite the `navigator` property to return a custom value.
const overwriteLanguage = (language) => {
  Object.defineProperty(navigator, 'language', {
    get: () => language,
  });
  Object.defineProperty(navigator, 'userLanguage', {
    get: () => language,
  });
  Object.defineProperty(navigator, 'browserLanguage', {
    get: () => language,
  });
  Object.defineProperty(navigator, 'systemLanguage', {
    get: () => language,
  });  
};

const overwriteLanguages = (languages) => {
  Object.defineProperty(navigator, 'languages', {
    get: () => languages,
  });
};

const overwriteNavigatorProduct = (product) => {
  Object.defineProperty(navigator, 'product', {
    get: () => product,
  });
};

const overwriteNavigatorProductSub = (productSub) => {
  Object.defineProperty(navigator, 'productSub', {
    get: () => productSub,
  });
};


const overwriteNavigatorVendor = (vendor) => {
  Object.defineProperty(navigator, 'vendor', {
    get: () => vendor,
  });
};


const overwriteNavigatorVendorSub = (vendorSub) => {
  Object.defineProperty(navigator, 'vendorSub', {
    get: () => vendorSub,
  });
};


const overwriteNavigatorjavaEnabled = (javaEnabled) => {
  Object.defineProperty(navigator, 'javaEnabled', {
    get: () => javaEnabled,
  });
};



const overwriteUserAgent = (useragent) => {
  Object.defineProperty(navigator, 'userAgent', {
    get: () => useragent,
  });

 /*var $ = window && (window.jQuery || window.Zepto);

  console.log($);

  if (typeof $ !== undefined && !$.ua){
    Object.defineProperty($, 'ua', {
    get: () => useragent,
  });
  }*/


};

const overwriteNavigatorPlugins = (plugins) => {
  Object.defineProperty(navigator, 'plugins', {
    get: () => plugins,
  });

};


const overwriteOSCPU = (oscpu) => {
  Object.defineProperty(navigator, 'oscpu', {
    get: () => oscpu,
  });
};



const overwriteDeviceMemory = (devicememory) => {
  Object.defineProperty(navigator, 'deviceMemory', {
    get: () => devicememory,
  });

};


const overwriteHardwareConcurrency = (hardwareconcurrency) => {
  Object.defineProperty(navigator, 'hardwareConcurrency', {
    get: () => hardwareconcurrency,
  });

};


const overwriteCPUClass = (cpuclass) => {
  Object.defineProperty(navigator, 'cpuClass', {
    get: () => cpuclass,
  });

};

const overwriteMaxTouchPoints = (maxtouchpoints) => {
  Object.defineProperty(navigator, 'maxTouchPoints', {
    get: () => maxtouchpoints,
  });
  Object.defineProperty(navigator, 'msMaxTouchPoints', {
    get: () => maxtouchpoints,
  });
   
};

const overwritePlatform = (platform) => {
  Object.defineProperty(navigator, 'platform', {
    get: () => platform,
  });

};



const overwriteFontDiv = (font) => {
  
   
 /*const oldObjectPrototypeSetter = Object.prototype.__lookupSetter__;

  Object.defineProperty(Object, 'prototype', {
    set: () => { console.log("hooked prototype"); oldObjectPrototypeSetter.call();  },
  });
   
  const oldSetter = document.createElement.__lookupSetter__;

  document.createElement.__defineSetter__ =
  Object.defineProperty(document, 'createElement', {
    set: () => {},
  }); */


  /*var target = document.querySelector('#font');

  var observer = new MutationObserver(function(mutations){
    mutations.forEach(function(mutation){
      console.log('font added');
    });
  });

  observer.observe(target, {
    attributes: true,
    attributeOldValue: true
  })*/


/*document.createElement = function(create) {
    return function() {
        var ret = create.apply(this, arguments);
        if (ret.tagName.toLowerCase() === "span") {
           console.log("span created" + ret.);
        }
        return ret;
    };
}(document.createElement)*/

Element.prototype.appendChild = function(appendchild) {
    return function() {
        var ret = appendchild.apply(this, arguments);
        if (ret.parentElement.id === "font") {
           //console.log(ret);
           ret.style.fontFamily = font;

        }
        return ret;
    };
}(Element.prototype.appendChild)




//const oldSetter = HTMLElement.prototype.__lookupSetter__('style')

//const oldGetter = HTMLElement.prototype.__lookupGetter__('style')

 /* Object.defineProperty(HTMLElement.prototype.style, 'fontFamily', {
    get: () => productsub,
  }); */

//var MutationObserver = window.MutationObserver; 


/*Object.defineProperty(HTMLElement.prototype, 'style', {
    set: function (val) {
        console.log('style setter');
        // *** do whatever you want here ***

        if(this.tagName.toLowerCase() === "span"){
          console.log('style setter ' + this.parentElement.tagName);  
        }
        return oldSetter.call(this, val); //allow the method to be called like normal
    }
});

Object.defineProperty(HTMLElement.prototype, 'style', {
    get: function (val) {

        if(this.tagName.toLowerCase() === "span"){
          console.log('style getter ' + this.parentElement.tagName);  
        }
        

        // *** do whatever you want here ***
        return oldGetter.call(this, val); //allow the method to be called like normal
    }
});*/






};


const overwriteAudioContext = () => {


  const oldGetter = window.AudioContext.prototype.__lookupGetter__;

  Object.defineProperty(window, 'AudioContext', {
    get: function (val) {

        //if(this.tagName.toLowerCase() === "span"){
          console.log('audiocontext getter ' + this);  
        //}
        

        // *** do whatever you want here ***
        return oldGetter.call(this, val); //allow the method to be called like normal
    }
  });

  /*Promise.prototype.then = function(newconstructor){

      return function(){

        var ret = newconstructor.apply(this, arguments);
        console.log("nothing has been modified yet");
        return ret;

      };


  }(Promise.prototype.then);*/
  

}

const overwriteAudioFormats = (audioformats) => {


  //const oldGetter = 
  Object.defineProperty(HTMLMediaElement.prototype, 'canPlayType', {
    get: () => audioformats,
  });


/*HTMLMediaElement.prototype.canPlayType = function(canplaytype) {
    return function() {
        var ret = canplaytype.apply(this, arguments);
           
        return ret;
    };
}(HTMLMediaElement.prototype.canPlayType)
*/


};









const overwriteMediaDevices = (mediadevices) => {


  /*Promise.prototype.then = function(newconstructor){
    
    return function(){

        //console.log(newconstructor);

        //var ret = newconstructor.apply(this, arguments);
        
        //console.log("Promise then call with arguments.callee.called : " + arguments.callee.called);
        
        //console.log("Promise then call with arguments[0].callee : " + arguments[0].callee);
        //console.log("Promise then call with arguments[0].called : " + arguments[0].called);
        
        //console.log("Promise object argument is then " + arguments[0]);
        //console.log("Promise object argument.name is then " + arguments[0].name);
        
        //console.log("promise object returned " + arguments[0]);       

        //console.log("Promise object argument.this is then " + arguments[0].this);
                

        //console.log("Promise object this.called value " + this.called);
        //console.log("Promise object this value " + Objects.value(this));
        //console.log("Promise then call with arguments.called" + arguments.called);


        return newconstructor.call(this, function(value){

          console.log(this.callee);

          //console.log(value);

          return value;
        });
    };


  }(Promise.prototype.then);*/

 
 
  /*(function(Promise) {
   var originalThen = Promise.prototype.then;
   Promise.prototype.then = function() {
      
      return originalThen.call(this, function(value) {
       
        try{
          
          if(value != undefined && value[0] != undefined){

            if(value[0].constructor.name.includes('DeviceInfo')){
              
              //console.log(value[0].name);
              //console.log(value.name);
              //console.log(value);
  
              value = "xx";
            }
          }

            
        }catch(error){
          console.log("we caught a type error " + error);
        }

        

        
        console.log(value);
        return value;
      });
   };
})(this.Promise);*/




 
  /*//var originalEnumerateDevices = window.navigator.mediaDevices.enumerateDevices;
  window.navigator.mediaDevices.enumerateDevices = function(mediadevices) {
    return function() {

        var ret = mediadevices.apply(this, arguments);
        


        //console.log(this.);


         /* Promise.resolve(ret).then(function(value){
              console.log(value);
              value[0]["deviceId"] = "BLEH";
              //value[0]

              var changedret = new Promise(function(resolve, reject){ resolve(value);});
              //return changedret;
           });

           */


      
        //console.log(changedret);
        //return ret; 

        //if (ret.parentElement.id === "font") {
           //console.log(ret);
          

           
        
   
        //}
        //return changedret;
    //};

//}(window.navigator.mediaDevices.enumerateDevices)


}


const overwriteWebGlActiveTexture = (webglcontext) => {
  /*const oldGetter = WebGLRenderingContext.prototype.ACTIVE_TEXTURE.__lookupGetter__


  Object.defineProperty(WebGLRenderingContext.prototype,'ACTIVE_TEXTURE', {
    get: function (val) {
        //if(this.tagName.toLowerCase() === "span"){
          console.log(this);  
        //}

        // *** do whatever you want here ***
        return oldGetter.call(this, val); //allow the method to be called like normal
    }
  });
  const oldGetter = WebGLRenderingContext.prototype.getParameter.__lookupGetter__


  Object.defineProperty(WebGLRenderingContext.prototype,'getParameter', {
    get: function (val) {
        //if(this.tagName.toLowerCase() === "span"){
          console.log(val);  
        //}
            
        // *** do whatever you want here ***
        return oldGetter.call(this, val); //allow the method to be called like normal
    }
  });*/
  

  WebGLRenderingContext.prototype.getParameter= function(getparameter) {
    return function() {
        var ret = getparameter.apply(this, arguments);
         console.log(arguments);
        return ret;
    };
}(WebGLRenderingContext.prototype.getParameter)


};



const overwriteProductSub = (productsub) => {
  Object.defineProperty(navigator, 'productSub', {
    get: () => productsub,
  });

};

const overwriteAppName = (appname) => {
  Object.defineProperty(navigator, 'appName', {
    get: () => appname,
  });

};

const overwriteDoNotTrack = (donottrack) => {
  Object.defineProperty(navigator, 'doNotTrack', {
    get: () => donottrack,
  });
  Object.defineProperty(navigator, 'msDoNotTrack', {
    get: () => donottrack,
  }); 
};

const overwriteWindowKey = (key) => {
  Object.defineProperty(window.screen, 'key', {
    get: () => key,
  });

};

const overwriteWindowScreenColorDepth = (colordepth) => {
  Object.defineProperty(window.screen, 'colorDepth', {
    get: () => colordepth,
  });

};

const overwriteWindowScreenHeight = (height) => {
  Object.defineProperty(window.screen, 'height', {
    get: () => height,
  });

};

const overwriteWindowScreenWidth = (width) => {
  Object.defineProperty(window.screen, 'width', {
    get: () => width,
  });

};

const overwriteWindowScreenAvailHeight = (availheight) => {
  Object.defineProperty(window.screen, 'availHeight', {
    get: () => availheight,
  });

};

const overwriteWindowScreenAvailWidth = (availwidth) => {
  Object.defineProperty(window.screen, 'availWidth', {
    get: () => availwidth,
  });

};


const overwriteWindowScreenTop= (top) => {
  Object.defineProperty(window.screen, 'top', {
    get: () => top,
  });

};

const overwriteWindowScreenLeft = (left) => {
  Object.defineProperty(window.screen, 'left', {
    get: () => left,
  });

};

const overwriteWindowScreenAvailTop = (availTop) => {
  Object.defineProperty(window.screen, 'availTop', {
    get: () => availTop,
  });

};
const overwriteWindowScreenAvailLeft = (availLeft) => {
  Object.defineProperty(window.screen, 'availLeft', {
    get: () => availLeft,
  });

};

const overwriteWindowDevicePixelRatio = (devicepixelratio) => {
  Object.defineProperty(window, 'devicePxielRatio', {
    get: () => devicepixelratio,
  });

};

const overwriteWindowOpenDatabase = (opendatabase) => {
  Object.defineProperty(window, 'openDatabase', {
    get: () => opendatabase,
  });

};


const overwriteWindowSessionStorage = (sessionstorage) => {
  Object.defineProperty(window, 'sessionStorage', {
    get: () => sessionStorage,
  });

};


const overwriteWindowLocalStorage = (localstorage) => {
  Object.defineProperty(window, 'localStorage', {
    get: () => localStorage,
  });

};



const overwriteWindowCookieEnabled = (cookie) => {
  Object.defineProperty(window.navigator, 'cookie', {
    get: () => cookie,
  });
  Object.defineProperty(window.navigator, 'cookieEnabled', {
    get: () => cookie,
  });

};

const overwriteWindowBuildID = (buildID) => {
  Object.defineProperty(window.navigator, 'buildID', {
    get: () => buildID,
  });

};


const overwriteNavigatorKeyboard = (keyboard) => {
  Object.defineProperty(navigator, 'keyboard', {
    get: () => keyboard,
  });

};


const overwriteNavigatorBattery = (battery) => {
  Object.defineProperty(navigator, 'battery', {
    get: () => battery,
  });

  const oldBattery = navigator.getBattery();
  navigator.getBattery = () => {
    console.log( "changed battery");
    return Promise.resolve(battery);
  }

};

const overwriteNavigatorPermissions = (permissions) => {
  Object.defineProperty(navigator, 'permissions', {
    get: () => permissions,
  });

};

const overwriteWindowIndexedDB = (indexeddb) => {
  Object.defineProperty(window, 'indexedDB', {
    get: () => indexeddb,
  });

};

const overwriteWindowTouch = (touchstart) => {
  Object.defineProperty(window, 'ontouchstart', {
    get: () => touchstart,
  });

};

const overwriteTime = (time) => {
  Object.defineProperty(window, 'Intl', {
    get: () => { return time;},
  });
  /*Object.defineProperty(Date, 'getTimezoneOffset', {
    get: () => time,
  });*/

  const oldDate = Date.prototype;
  Date.prototype.getTimezoneOffset = () => {
  console.log( "changed timezone");
  return time;
  }


};


const overwriteFlash = (flash) => {
  Object.defineProperty( window, 'swfobject', {
    get: () => flash,
  });
}

const runInPageContext = (method, ...args) => {
  
  const stringMethod = method instanceof Function
    ? method.toString()
    : `() => { ${method} }`;

  // The stringified arguments for the method as JS code that will reconstruct the array.
  const stringArgs = JSON.stringify(args);

  // The full content of the script tag.
  const scriptContent = `


    

    // Parse and run the method with its arguments.
    (${stringMethod})(...${stringArgs});

    // Remove the script element to cover our tracks.
    document.currentScript.parentElement
      .removeChild(document.currentScript);
  `;


  
  // Create a script tag and inject it into the document.
  const scriptElement = document.createElement('script');
  scriptElement.innerHTML = scriptContent;
  document.documentElement.prepend(scriptElement);


};




// Break out of the sandbox and run `overwriteLanguage()` in the page context.
runInPageContext(overwriteLanguage, 'xx-XX');
runInPageContext(overwriteLanguages, ['xx-XX', 'xx']);
runInPageContext(overwriteWindowCookieEnabled,false);
runInPageContext(overwriteWindowBuildID, '0');
runInPageContext(overwriteWindowKey, undefined);


runInPageContext(overwriteUserAgent, "x");
//runInPageContext(overwriteDocumentCreateElement, scriptelt);
runInPageContext(overwritePlatform, "xxxx");


runInPageContext(overwriteAppName, '199990');
runInPageContext(overwriteWindowScreenColorDepth, 'xxXXXX');

runInPageContext(overwriteNavigatorPlugins, 'XPLGUINS');
runInPageContext(overwriteNavigatorPermissions, 'no permissions');
runInPageContext(overwriteNavigatorKeyboard,'no keyboard');
runInPageContext(overwriteNavigatorBattery,'no battery');
runInPageContext(overwriteNavigatorProduct, 'no product');
runInPageContext(overwriteFontDiv, 'monospace');
runInPageContext(overwriteAudioFormats, undefined);


//runInPageContext(overwriteAudioContext);
runInPageContext(overwriteMediaDevices);

//runInPageContext(overwriteWebGlActiveTexture);

runInPageContext(overwriteHardwareConcurrency, '4');


runInPageContext(overwriteTime, 900000);
