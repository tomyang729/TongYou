function dv_rolloutManager(handlersDefsArray, baseHandler) {
    this.handle = function () {
        var errorsArr = [];

        var handler = chooseEvaluationHandler(handlersDefsArray);
        if (handler) {
            var errorObj = handleSpecificHandler(handler);
            if (errorObj === null)
                return errorsArr;
            else {
                var debugInfo = handler.onFailure();
                if (debugInfo) {
                    for (var key in debugInfo) {
                        if (debugInfo.hasOwnProperty(key)) {
                            if (debugInfo[key] !== undefined || debugInfo[key] !== null) {
                                errorObj[key] = encodeURIComponent(debugInfo[key]);
                            }
                        }
                    }
                }
                errorsArr.push(errorObj);
            }
        }

        var errorObjHandler = handleSpecificHandler(baseHandler);
        if (errorObjHandler) {
            errorObjHandler['dvp_isLostImp'] = 1;
            errorsArr.push(errorObjHandler);
        }
        return errorsArr;
    }

    function handleSpecificHandler(handler) {
        var url;
        var errorObj = null;

        try {
            url = handler.createRequest();
            if (url) {
                if (!handler.sendRequest(url))
                    errorObj = createAndGetError('sendRequest failed.',
                        url,
                        handler.getVersion(),
                        handler.getVersionParamName(),
                        handler.dv_script);
            } else
                errorObj = createAndGetError('createRequest failed.',
                    url,
                    handler.getVersion(),
                    handler.getVersionParamName(),
                    handler.dv_script,
                    handler.dvScripts,
                    handler.dvStep,
                    handler.dvOther
                    );
        }
        catch (e) {
            errorObj = createAndGetError(e.name + ': ' + e.message, url, handler.getVersion(), handler.getVersionParamName(), (handler ? handler.dv_script : null));
        }

        return errorObj;
    }

    function createAndGetError(error, url, ver, versionParamName, dv_script, dvScripts, dvStep, dvOther) {
        var errorObj = {};
        errorObj[versionParamName] = ver;
        errorObj['dvp_jsErrMsg'] = encodeURIComponent(error);
        if (dv_script && dv_script.parentElement && dv_script.parentElement.tagName && dv_script.parentElement.tagName == 'HEAD')
            errorObj['dvp_isOnHead'] = '1';
        if (url)
            errorObj['dvp_jsErrUrl'] = url;
        if (dvScripts) {
            var dvScriptsResult = '';
            for (var id in dvScripts) {
                if (dvScripts[id] && dvScripts[id].src) {
                    dvScriptsResult += encodeURIComponent(dvScripts[id].src) + ":" + dvScripts[id].isContain + ",";
                }
            }
            //errorObj['dvp_dvScripts'] = encodeURIComponent(dvScriptsResult);
           // errorObj['dvp_dvStep'] = dvStep;
           // errorObj['dvp_dvOther'] = dvOther;
        }
        return errorObj;
    }

    function chooseEvaluationHandler(handlersArray) {
        var config = window._dv_win.dv_config;
        var index = 0;
        var isEvaluationVersionChosen = false;
        if (config.handlerVersionSpecific) {
            for (var i = 0; i < handlersArray.length; i++) {
                if (handlersArray[i].handler.getVersion() == config.handlerVersionSpecific) {
                    isEvaluationVersionChosen = true;
                    index = i;
                    break;
                }
            }
        }
        else if (config.handlerVersionByTimeIntervalMinutes) {
            var date = config.handlerVersionByTimeInputDate || new Date();
            var hour = date.getUTCHours();
            var minutes = date.getUTCMinutes();
            index = Math.floor(((hour * 60) + minutes) / config.handlerVersionByTimeIntervalMinutes) % (handlersArray.length + 1);
            if (index != handlersArray.length) //This allows a scenario where no evaluation version is chosen
                isEvaluationVersionChosen = true;
        }
        else {
            var rand = config.handlerVersionRandom || (Math.random() * 100);
            for (var i = 0; i < handlersArray.length; i++) {
                if (rand >= handlersArray[i].minRate && rand < handlersArray[i].maxRate) {
                    isEvaluationVersionChosen = true;
                    index = i;
                    break;
                }
            }
        }

        if (isEvaluationVersionChosen == true && handlersArray[index].handler.isApplicable())
            return handlersArray[index].handler;
        else
            return null;
    }    
}

function dv_GetParam(url, name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    if (results == null)
        return null;
    else
        return results[1];
}

function dv_SendErrorImp(serverUrl, errorsArr) {

    for (var j = 0; j < errorsArr.length; j++) {
        var errorQueryString = '';
        var errorObj = errorsArr[j];
        for (key in errorObj) {
            if (errorObj.hasOwnProperty(key)) {
                if (key.indexOf('dvp_jsErrUrl') == -1) {
                    errorQueryString += '&' + key + '=' + errorObj[key];
                }
                else {
                    var params = ['ctx', 'cmp', 'plc', 'sid'];
                    for (var i = 0; i < params.length; i++) {
                        var pvalue = dv_GetParam(errorObj[key], params[i]);
                        if (pvalue) {
                            errorQueryString += '&dvp_js' + params[i] + '=' + pvalue;
                        }
                    }
                }
            }
        }

        var windowProtocol = 'http:';
        var sslFlag = '&ssl=0';
        if (window.location.protocol === 'https:') {
            windowProtocol = 'https:';
            sslFlag = '&ssl=1';
        }
        var errorImp = windowProtocol + '//' + serverUrl + sslFlag + errorQueryString;
        dv_sendRequest(errorImp);
    }
}

function dv_sendRequest(url) {
    document.write('<scr' + 'ipt language="javascript" src="' + url + '"></scr' + 'ipt>');
}

function dv_GetRnd() {
    return ((new Date()).getTime() + "" + Math.floor(Math.random() * 1000000)).substr(0, 16);
}

function doesBrowserSupportHTML5Push() {
    "use strict";
    return typeof window.parent.postMessage === 'function' && window.JSON;
}
    

function dvBsrType() {
    'use strict';
    var that = this;
    var eventsForDispatch = {};


    this.pubSub = new function () {

        var subscribers = [];

        this.subscribe = function(eventName, uid, actionName, func) {
            if (!subscribers[eventName + uid])
                subscribers[eventName + uid] = [];
            subscribers[eventName + uid].push({ Func: func, ActionName: actionName });
        };

        this.publish = function (eventName, uid) {
            var actionsResults = [];
            if (eventName && uid && subscribers[eventName + uid] instanceof Array)
                for (var i = 0; i < subscribers[eventName + uid].length; i++) {
                    var funcObject = subscribers[eventName + uid][i];
                    if (funcObject && funcObject.Func && typeof funcObject.Func == "function" && funcObject.ActionName) {
                        var isSucceeded = runSafely(function () {
                            return funcObject.Func(uid);
                        });
                        actionsResults.push(encodeURIComponent(funcObject.ActionName) + '=' + (isSucceeded ? '1' : '0'));
                    }
                }
            return actionsResults.join('&');
        };
    };

    this.domUtilities = new function () {

        this.addImage = function (url, parentElement) {
            var image = parentElement.ownerDocument.createElement("img");
            image.width = 0;
            image.height = 0;
            image.style.display = 'none';
            image.src = appendCacheBuster(url);
            parentElement.insertBefore(image, parentElement.firstChild);
        };

        this.addScriptResource = function (url, parentElement) {
            var scriptElem = parentElement.ownerDocument.createElement("script");
            scriptElem.type = 'text/javascript';
            scriptElem.src = appendCacheBuster(url);
            parentElement.insertBefore(scriptElem, parentElement.firstChild);
        };

        this.addScriptCode = function (srcCode, parentElement) {
            var scriptElem = parentElement.ownerDocument.createElement("script");
            scriptElem.type = 'text/javascript';
            scriptElem.innerHTML = srcCode;
            parentElement.insertBefore(scriptElem, parentElement.firstChild);
        };

        this.addHtml = function(srcHtml, parentElement) {
            var divElem = parentElement.ownerDocument.createElement("div");
            divElem.style = "display: inline";
            divElem.innerHTML = srcHtml;
            parentElement.insertBefore(divElem, parentElement.firstChild);
        };
    };

    this.resolveMacros = function (str, tag) {
        var viewabilityData = tag.getViewabilityData();
        var viewabilityBuckets = viewabilityData && viewabilityData.buckets ? viewabilityData.buckets : {};
        var upperCaseObj = objectsToUpperCase(tag, viewabilityData, viewabilityBuckets);
        var newStr = str.replace('[DV_PROTOCOL]', upperCaseObj.DV_PROTOCOL);
        newStr = newStr.replace('[PROTOCOL]', upperCaseObj.PROTOCOL);
        newStr = newStr.replace(/\[(.*?)\]/g, function (match, p1) {
            var value = upperCaseObj[p1];
            if (value === undefined || value === null)
                value = '[' + p1 + ']';
            return encodeURIComponent(value);
        });
        return newStr;
    };

    this.settings = new function () {
    };

    this.tagsType = function () { };

    this.tagsPrototype = function () {
        this.add = function(tagKey, obj) {
            if (!that.tags[tagKey])
                that.tags[tagKey] = new that.tag();
            for (var key in obj)
                that.tags[tagKey][key] = obj[key];
        };
    };

    this.tagsType.prototype = new this.tagsPrototype();
    this.tagsType.prototype.constructor = this.tags;
    this.tags = new this.tagsType();

    this.tag = function () { }
    this.tagPrototype = function () {
        this.set = function (obj) {
            for (var key in obj)
                this[key] = obj[key];
        };
        
        this.getViewabilityData = function () {
        };
    };

    this.tag.prototype = new this.tagPrototype();
    this.tag.prototype.constructor = this.tag;


    this.getTagObjectByService = function (serviceName) {
    
        for (var impressionId in this.tags) {
            if (typeof this.tags[impressionId] === 'object'
                && this.tags[impressionId].services
                && this.tags[impressionId].services[serviceName]
                && !this.tags[impressionId].services[serviceName].isProcessed) {
                this.tags[impressionId].services[serviceName].isProcessed = true;
                return this.tags[impressionId];
            }
        }
        

        return null;
    };

    this.addService = function (impressionId, serviceName, paramsObject) {

        if (!impressionId || !serviceName)
            return;

        if (!this.tags[impressionId])
            return;
        else {
            if (!this.tags[impressionId].services)
                this.tags[impressionId].services = { };

            this.tags[impressionId].services[serviceName] = {
                params: paramsObject,
                isProcessed: false
            };
        }
    };

    this.Enums = {
        BrowserId: { Others: 0, IE: 1, Firefox: 2, Chrome: 3, Opera: 4, Safari: 5 },
        TrafficScenario: { OnPage: 1, SameDomain: 2, CrossDomain: 128 }
    };

    this.CommonData = {};

    var runSafely = function (action) {
        try {
            var ret = action();
            return ret !== undefined ? ret : true;
        } catch (e) { return false; }
    };

    var objectsToUpperCase = function () {
        var upperCaseObj = {};
        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    upperCaseObj[key.toUpperCase()] = obj[key];
                }
            }
        }
        return upperCaseObj;
    };

    var appendCacheBuster = function (url) {
        if (url !== undefined && url !== null && url.match("^http") == "http") {
            if (url.indexOf('?') !== -1) {
                if (url.slice(-1) == '&')
                    url += 'cbust=' + dv_GetRnd();
                else
                    url += '&cbust=' + dv_GetRnd();
            }
            else
                url += '?cbust=' + dv_GetRnd();
        }
        return url;
    };

    this.dispatchRegisteredEventsFromAllTags = function () {
        for (var impressionId in this.tags) {
            if (typeof this.tags[impressionId] !== 'function' && typeof this.tags[impressionId] !== 'undefined')
                dispatchEventCalls(impressionId, this);
        }
    };

    var dispatchEventCalls = function (impressionId, dvObj) {
        var tag = dvObj.tags[impressionId];
        var eventObj = eventsForDispatch[impressionId];
        if (typeof eventObj !== 'undefined' && eventObj != null) {
            var url = tag.protocol + '//' + tag.ServerPublicDns + "/bsevent.gif?impid=" + impressionId + '&' + createQueryStringParams(eventObj);
            dvObj.domUtilities.addImage(url, tag.tagElement.parentElement);
            eventsForDispatch[impressionId] = null;
        }
    };

    this.registerEventCall = function (impressionId, eventObject, timeoutMs) {
        addEventCallForDispatch(impressionId, eventObject);

        if (typeof timeoutMs === 'undefined' || timeoutMs == 0 || isNaN(timeoutMs))
            dispatchEventCallsNow(this, impressionId, eventObject);
        else {
            if (timeoutMs > 2000)
                timeoutMs = 2000;

            var dvObj = this;
            setTimeout(function () {
                dispatchEventCalls(impressionId, dvObj);
            }, timeoutMs);
        }
    };

    var dispatchEventCallsNow = function (dvObj, impressionId, eventObject) {
        addEventCallForDispatch(impressionId, eventObject);
        dispatchEventCalls(impressionId, dvObj);
    };

    var addEventCallForDispatch = function (impressionId, eventObject) {
        for (var key in eventObject) {
            if (typeof eventObject[key] !== 'function' && eventObject.hasOwnProperty(key)) {
                if (!eventsForDispatch[impressionId])
                    eventsForDispatch[impressionId] = {};
                eventsForDispatch[impressionId][key] = eventObject[key];
            }
        }
    };

    if (window.addEventListener) {
        window.addEventListener('unload', function () { that.dispatchRegisteredEventsFromAllTags(); }, false);
        window.addEventListener('beforeunload', function () { that.dispatchRegisteredEventsFromAllTags(); }, false);
    }
    else if (window.attachEvent) {
        window.attachEvent('onunload', function () { that.dispatchRegisteredEventsFromAllTags(); }, false);
        window.attachEvent('onbeforeunload', function () { that.dispatchRegisteredEventsFromAllTags(); }, false);
    }
    else {
        window.document.body.onunload = function () { that.dispatchRegisteredEventsFromAllTags(); };
        window.document.body.onbeforeunload = function () { that.dispatchRegisteredEventsFromAllTags(); };
    }

    var createQueryStringParams = function (values) {
        var params = '';
        for (var key in values) {
            if (typeof values[key] !== 'function') {
                var value = encodeURIComponent(values[key]);
                if (params === '')
                    params += key + '=' + value;
                else
                    params += '&' + key + '=' + value;
            }
        }

        return params;
    };

 
}

function dv_handler30(){function B(e,d,b,a,k,c,p){var i,m,n;n=window._dv_win.dv_config&&window._dv_win.dv_config.bst2tid?window._dv_win.dv_config.bst2tid:dv_GetRnd();var H,B=window.parent.postMessage&&window.JSON,h=!0,r=!1;if("0"==dv_GetParam(e.dvparams,"t2te")||window._dv_win.dv_config&&!0==window._dv_win.dv_config.supressT2T)r=!0;if(B&&!1==r)try{r="https://cdn3.doubleverify.com/bst2tv3.html";window._dv_win&&(window._dv_win.dv_config&&window._dv_win.dv_config.bst2turl)&&(r=window._dv_win.dv_config.bst2turl);
var D="bst2t_"+n,q;if(document.createElement&&(q=document.createElement("iframe")))q.name=q.id="iframe_"+dv_GetRnd(),q.width=0,q.height=0,q.id=D,q.style.display="none",q.src=r;H=q;if(window._dv_win.document.body)window._dv_win.document.body.insertBefore(H,window._dv_win.document.body.firstChild),h=!0;else{var K=0,L=function(){if(window._dv_win.document.body)try{window._dv_win.document.body.insertBefore(H,window._dv_win.document.body.firstChild)}catch(b){}else K++,150>K&&setTimeout(L,20)};setTimeout(L,
20);h=!1}}catch(X){}r=e.rand;q="__verify_callback_"+r;r="__tagObject_callback_"+r;window[q]=function(b){try{if(void 0==b.ResultID)document.write(1!=b?e.tagsrc:e.altsrc);else switch(b.ResultID){case 1:b.Passback?document.write(decodeURIComponent(b.Passback)):document.write(e.altsrc);break;case 2:case 3:document.write(e.tagsrc)}}catch(a){}};var M="http:",N="http:",O="0";"https"==window._dv_win.location.toString().match("^https")&&(M="https:","https"==p.src.match("^https")&&(N="https:",O="1"));var I=
window._dv_win.document.visibilityState;window[r]=function(b){try{var a={};a.protocol=M;a.ssl=O;a.dv_protocol=N;a.serverPublicDns=b.ServerPublicDns;a.ServerPublicDns=b.ServerPublicDns;a.tagElement=p;a.redirect=e;a.impressionId=b.ImpressionID;window._dv_win.$dvbsr.tags.add(b.ImpressionID,a);if("prerender"===I)if("prerender"!==window._dv_win.document.visibilityState&&"unloaded"!==visibilityStateLocal)window._dv_win.$dvbsr.registerEventCall(b.ImpressionID,{prndr:0});else{var c;"undefined"!==typeof window._dv_win.document.hidden?
c="visibilitychange":"undefined"!==typeof window._dv_win.document.mozHidden?c="mozvisibilitychange":"undefined"!==typeof window._dv_win.document.msHidden?c="msvisibilitychange":"undefined"!==typeof window._dv_win.document.webkitHidden&&(c="webkitvisibilitychange");var d=function(){var a=window._dv_win.document.visibilityState;"prerender"===I&&("prerender"!==a&&"unloaded"!==a)&&(I=a,window._dv_win.$dvbsr.registerEventCall(b.ImpressionID,{prndr:0}),window._dv_win.document.removeEventListener(c,d))};
window._dv_win.document.addEventListener(c,d,!1)}}catch(f){}};void 0==e.dvregion&&(e.dvregion=0);var D="http:",P="0";"https"==window.location.toString().match("^https")&&(D="https:",P="1");try{for(var f=b,w=0;10>w&&f!=window.top;)w++,f=f.parent;b.depth=w;var j=S(b);m="&aUrl="+encodeURIComponent(j.url);i="&aUrlD="+j.depth;var Q=b.depth+a;k&&b.depth--}catch(Y){i=m=Q=b.depth=""}void 0!=e.aUrl&&(m="&aUrl="+e.aUrl);var C;a=function(){try{return!!window.sessionStorage}catch(b){return!0}};k=function(){try{return!!window.localStorage}catch(b){return!0}};
j=function(){var b=document.createElement("canvas");if(b.getContext&&b.getContext("2d")){var a=b.getContext("2d");a.textBaseline="top";a.font="14px 'Arial'";a.textBaseline="alphabetic";a.fillStyle="#f60";a.fillRect(0,0,62,20);a.fillStyle="#069";a.fillText("!image!",2,15);a.fillStyle="rgba(102, 204, 0, 0.7)";a.fillText("!image!",4,17);return b.toDataURL()}return null};try{f=[];f.push(["lang",navigator.language||navigator.browserLanguage]);f.push(["tz",(new Date).getTimezoneOffset()]);f.push(["hss",
a()?"1":"0"]);f.push(["hls",k()?"1":"0"]);f.push(["odb",typeof window.openDatabase||""]);f.push(["cpu",navigator.cpuClass||""]);f.push(["pf",navigator.platform||""]);f.push(["dnt",navigator.doNotTrack||""]);f.push(["canv",j()]);var l=f.join("=!!!=");if(null==l||""==l)C="";else{for(var a=function(a){for(var b="",c,d=7;0<=d;d--)c=a>>>4*d&15,b+=c.toString(16);return b},k=[1518500249,1859775393,2400959708,3395469782],l=l+String.fromCharCode(128),x=Math.ceil((l.length/4+2)/16),y=Array(x),j=0;j<x;j++){y[j]=
Array(16);for(f=0;16>f;f++)y[j][f]=l.charCodeAt(64*j+4*f)<<24|l.charCodeAt(64*j+4*f+1)<<16|l.charCodeAt(64*j+4*f+2)<<8|l.charCodeAt(64*j+4*f+3)}y[x-1][14]=8*(l.length-1)/Math.pow(2,32);y[x-1][14]=Math.floor(y[x-1][14]);y[x-1][15]=8*(l.length-1)&4294967295;for(var l=1732584193,f=4023233417,w=2562383102,E=271733878,F=3285377520,s=Array(80),z,t,u,v,G,j=0;j<x;j++){for(var g=0;16>g;g++)s[g]=y[j][g];for(g=16;80>g;g++)s[g]=(s[g-3]^s[g-8]^s[g-14]^s[g-16])<<1|(s[g-3]^s[g-8]^s[g-14]^s[g-16])>>>31;z=l;t=f;u=
w;v=E;G=F;for(g=0;80>g;g++){var R=Math.floor(g/20),T=z<<5|z>>>27,A;c:{switch(R){case 0:A=t&u^~t&v;break c;case 1:A=t^u^v;break c;case 2:A=t&u^t&v^u&v;break c;case 3:A=t^u^v;break c}A=void 0}var U=T+A+G+k[R]+s[g]&4294967295;G=v;v=u;u=t<<30|t>>>2;t=z;z=U}l=l+z&4294967295;f=f+t&4294967295;w=w+u&4294967295;E=E+v&4294967295;F=F+G&4294967295}C=a(l)+a(f)+a(w)+a(E)+a(F)}}catch(Z){C=null}b=(window._dv_win&&window._dv_win.dv_config&&window._dv_win.dv_config.verifyJSCURL?dvConfig.verifyJSCURL+"?":D+"//rtb"+
e.dvregion+".doubleverify.com/verifyc.js?")+e.dvparams+"&num=5&srcurlD="+b.depth+"&callback="+q+"&jsTagObjCallback="+r+"&ssl="+P+"&refD="+Q+"&htmlmsging="+(B?"1":"0")+"&guid="+n+(null!=C?"&aadid="+C:"");d="dv_url="+encodeURIComponent(d);if(!1==h||c)b=b+("&dvp_isBodyExistOnLoad="+(h?"1":"0"))+("&dvp_isOnHead="+(c?"1":"0"));if((c=window[J("=@42E:@?")][J("2?46DE@C~C:8:?D")])&&0<c.length){h=[];h[0]=window.location.protocol+"//"+window.location.hostname;for(n=0;n<c.length;n++)h[n+1]=c[n];c=h.reverse().join(",")}else c=
null;c&&(d+="&ancChain="+encodeURIComponent(c));if(!1==/MSIE (\d+\.\d+);/.test(navigator.userAgent)||7<new Number(RegExp.$1)||2E3>=m.length+i.length+b.length)b+=i,d+=m;if(void 0!=window._dv_win.$dvbsr.CommonData.BrowserId&&void 0!=window._dv_win.$dvbsr.CommonData.BrowserVersion&&void 0!=window._dv_win.$dvbsr.CommonData.BrowserIdFromUserAgent)c=window._dv_win.$dvbsr.CommonData.BrowserId,i=window._dv_win.$dvbsr.CommonData.BrowserVersion,m=window._dv_win.$dvbsr.CommonData.BrowserIdFromUserAgent;else{c=
[{id:4,brRegex:"OPR|Opera",verRegex:"(OPR/|Version/)"},{id:1,brRegex:"MSIE|Trident/7.*rv:11|rv:11.*Trident/7|Edge/",verRegex:"(MSIE |rv:| Edge/)"},{id:2,brRegex:"Firefox",verRegex:"Firefox/"},{id:0,brRegex:"Mozilla.*Android.*AppleWebKit(?!.*Chrome.*)|Linux.*Android.*AppleWebKit.* Version/.*Chrome",verRegex:null},{id:0,brRegex:"AOL/.*AOLBuild/|AOLBuild/.*AOL/|Puffin|Maxthon|Valve|Silk|PLAYSTATION|PlayStation|Nintendo|wOSBrowser",verRegex:null},{id:3,brRegex:"Chrome",verRegex:"Chrome/"},{id:5,brRegex:"Safari|(OS |OS X )[0-9].*AppleWebKit",
verRegex:"Version/"}];m=0;i="";n=navigator.userAgent;for(h=0;h<c.length;h++)if(null!=n.match(RegExp(c[h].brRegex))){m=c[h].id;if(null==c[h].verRegex)break;n=n.match(RegExp(c[h].verRegex+"[0-9]*"));null!=n&&(i=n[0].match(RegExp(c[h].verRegex)),i=n[0].replace(i[0],""));break}c=h=V();i=h===m?i:"";window._dv_win.$dvbsr.CommonData.BrowserId=c;window._dv_win.$dvbsr.CommonData.BrowserVersion=i;window._dv_win.$dvbsr.CommonData.BrowserIdFromUserAgent=m}b+="&brid="+c+"&brver="+i+"&bridua="+m;"prerender"===
window._dv_win.document.visibilityState&&(b+="&prndr=1");m=W();b+="&vavbkt="+m.vdcd;b+="&lvvn="+m.vdcv;return b+"&eparams="+encodeURIComponent(J(d))}function W(){try{return{vdcv:12,vdcd:eval(function(d,b,a,e,c,p){c=function(a){return(a<b?"":c(parseInt(a/b)))+(35<(a%=b)?String.fromCharCode(a+29):a.toString(36))};if(!"".replace(/^/,String)){for(;a--;)p[c(a)]=e[a]||c(a);e=[function(a){return p[a]}];c=function(){return"\\w+"};a=1}for(;a--;)e[a]&&(d=d.replace(RegExp("\\b"+c(a)+"\\b","g"),e[a]));return d}("(y(){1d{m V=[1c];1d{m w=1c;3r(w!=w.21&&w.1i.3s.3q){V.1a(w.1i);w=w.1i}}1f(e){}y 1o(O){1d{12(m i=0;i<V.1g;i++){17(O(V[i]))b V[i]==1c.21?-1:1}b 0}1f(e){b 1k}}y 1V(K){b 1o(y(G){b G[K]!=1k})}y 1T(G,1S,O){12(m K 3p G){17(K.1Y(1S)>-1&&(!O||O(G[K])))b 3m}b 3n}y g(s){m h=\"\",t=\"3o.;j&3t}3u/0:3A'3B=B(3z-3y!,3v)5r\\\\{ >3w+3x\\\"3l<\";12(i=0;i<s.1g;i++)f=s.1X(i),e=t.1Y(f),0<=e&&(f=t.1X((e+41)%3k)),h+=f;b h}m c=['39\"1n-3a\"38\"37','p','l','34&p','p','{','-5,!u<}\"35}\"','p','J','-36}\"<3b','p','=o','\\\\}29\"2f\"1O\\\\}29\"2f\"3c}2\"<,u\"<5}?\"4','e','J=',':<3i}T}<\"','p','h','\\\\}6-2}\"E(d\"H}8?\\\\}6-2}\"E(d\"1B<N\"[1q*1t\\\\\\\\1z-3j<1x\"1L\"3h]14}C\"Q','e','3g','\"1D\\\\}3d\"I<-3e\"1y\"5\"3f}1P<}3C\"1D\\\\}1e}1s>1r-1l}2}\"1y\"5\"3D}1P<}44','e','=J','1v}U\"<5}45\"n}F\\\\}Z[43}40:3X]k}7\\\\}Z[t:26\"3Y]k}7\\\\}Z[3Z})5-u<}t]k}7\\\\}Z[46]k}7\\\\}Z[47}4c]k}4d','e','4b',':4a}<\"W-48/2M','p','49','\\\\}D<U/10}7\\\\}D<U/!k}8','e','=l','\\\\}1E!33\\\\}1E!3V)p?\"4','e','3K','3L:,','p','3J','1v}U\"<5}1j:3I\\\\}6-2}\"3E\".42-2}\"3F-3G<N\"3M<3N<3T}C\"3H<3U<3S[<]E\"27\"1n}\"2}\"3R[<]E\"27\"1n}\"2}\"E<}15&3O\"1\\\\}1M\\\\3P\\\\}1M\\\\3Q}1s>1r-1l}2}\"z<4e-2}\"2F\"2.42-2}\"2l=2k\"n}2h\"n}P=2i','e','x','2n)','p','+','\\\\}1I)u\"2t\\\\}1I)u\"2q?\"4','e','2o','\\\\}1F}s<2b\\\\}1F}s<2d\" 2a-2S?\"4','e','2Q','\\\\}6-2}\"E(d\"H}8?\\\\}6-2}\"E(d\"2O<:[\\\\2P}}2M][\\\\2U,5}2]2V}C\"Q','e','30','18\\\\}31}2Z\\\\}2Y$2W','e','2X',':2N<Z','p','2L','\\\\}9-2J\\\\}9-2I}2H\\\\}9-2T<2G?\"4','e','2K','\\\\}9\"1C\\\\}9\"1A-2E?\"4','e','2C','18\\\\}2x:,2w}U\"<5}2y\"n}2z<2B<1K}2A','e','2R','\\\\}D<U/2v&1Z\"E/24\\\\}D<U/32}C\"28\\\\}D<U/f[&1Z\"E/24\\\\}D<U/2e[S]]2c\"2u}8?\"4','e','2p','2r}2g}2m>2s','p','2j','\\\\}X:<19}s<3W}7\\\\}X:<19}s<4p<}f\"u}23\\\\}1Q\\\\}X:<19}s<C[S]E:26\"10}8','e','l{','5p\\'<}5n\\\\T}5l','p','==','\\\\}1m<5m\\\\}1m<5q\\\\<Z\"5s\\\\}1m<5w<5v\"?\"4','e','5u','\\\\}9\"2f\"5t\\\\}5k<5j?\"4','e','o{','\\\\}1u}\"11}5b\"-5a\"2f\"q\\\\}v\"<5}59?\"4','e','o+',' &W)&5d','p','5e','\\\\}9.:2}\"c\"<5i}7\\\\}5h}7\\\\}5g<}f\"u}23\\\\}1Q\\\\}1e:}\"k}8','e','4g','5y\"5-\\'5W:2M','p','J{','\\\\}6-2}\"E(d\"H}8?\\\\}6-2}\"E(d\"1B<N\"[1q*1t\\\\\\\\1z-1x\"1L/5P<5O]14}C\"Q','e','5S',')5T!5U}s<C','p','5V','\\\\}1N.L>g;W\\'T)Y.5N\\\\}1N.L>g;5D&&5C>W\\'T)Y.I?\"4','e','l=','W:<Z<:5','p','5A','\\\\}1K\\\\}9\"5E\\\\}v\"<5}1U\"1R}/1W\\\\}6-2}\"20<}15&5F\\\\}v\"<5}13\"}u-5K=?1v}U\"<5}1j\"1w\"n}5J\\\\}1u}\"1p\"<5}5I\"22\"n}F\"5G','e','5H','\\\\}1b-U\\\\1O\\\\}1b-5x\\\\}1b-\\\\<}?\"4','e','57','4y-N:4w','p','4A','\\\\}1h\"4B\\\\}1h\"4F\"<5}4D\\\\}1h\"4C||\\\\}4u?\"4','e','h+','\\\\}v\"<5}13\"}u-4t\\\\}1e}1s>1r-1l}2}\"q\\\\}v\"<5}13\"}u-2D','e','=S','c>A','p','=','\\\\}6-2}\"E(d\"H}8?\\\\}6-2}\"E(d\"1H<:[<Z*1t:Z,1G]F:<4n[<Z*4s]14}C\"Q','e','h=','4r-2}\"1p\"<5}k}8','e','4q','\\\\}6-2}\"E(d\"H}8?\\\\}6-2}\"E(d\"1H<:[<Z*4o}1G]R<-C[1q*4G]14}C\"Q','e','4H','18\\\\}1J\"\\\\4Z\\\\}1J\"\\\\4Y','e','4X','\\\\}4V}Z<}50}7\\\\}51<f\"k}7\\\\}55/<}C!!54<\"42.42-2}\"10}7\\\\}52\"<5}k}8?\"4','e','4U','T>;4L\"<4f','p','h{','\\\\}4J<u-4O\\\\4S}7\\\\}X<}4R}8?\"4','e','4Q','\\\\}4P\\\\}56}<(4K?\"4','e','4M','\\\\}9\"1C\\\\}9\"1A-4T}U\"<5}1j\"1w\"n}F\\\\}1u}\"1p\"<5}13\"E<}15&4m}4j=4l\"22\"n}F\"4x?\"4','e','5B','\\\\}5X<5R a}58}7\\\\}9}5c\"5o 4E- 10}8','e','4v','4W\\\\}v\"<5}4N}4I\"5M&M<C<}53}C\"28\\\\}v\"<5}1U\"1R}/1W\\\\}6-2}\"4i\\\\}6-2}\"20<}15&4h[S]4k=?\"4','e','l+'];m 16=[];12(m j=0;j<c.1g;j+=3){m r=c[j+1]=='p'?1V(g(c[j])):1o(y(G){b 4z(1T.5z()+g(c[j]))});17(r>0||r<0)16.1a(r*25(g(c[j+2])));5L 17(r==1k)16.1a(-5Q*25(g(c[j+2])))}b 16}1f(e){b[-5f]}})();",
62,370,"    Ma2vsu4f2  ZEZ5Ua a44OO a44 ZE  return  a2MQ0242U       P1  var aM        ZE45Uu tmpWnd  function     ZEBM   wnd 5ML44P1   prop    func  3RSvsu4f2     wndz _ ZE_   fP1  for E35f WDE42 Z27 results if U5q ZU5 push ZEuf window try ZE2 catch length ZEuZ parent qD8 null N5 ZE3 g5 ch E45Uu fMU Tg5 U5Z2c  ZENuM2 qsa MQ8M2 kN7 ENM5 BuZfEU5 UT 5ML44qWfUM UIuCTZOO QN25sF ZE_Y ZELZg5 _t 5ML44qWZ ZEufB Zzt__ ZP1 MuU Zz5 ZEcIT_0 OO Z2s ZELMMuQOO vB4u str co E3M2sP1tuB5a ex tOO charAt indexOf BV2U EM2s2MM2ME top U3q2D8M2 U25sF 2Qfq parseInt uf  3RSOO ZEf35M Mu COO Ef2 CEC2 fD  5IMu PSHM2 HnDqD hx DM2 tDRm fY45 Ld0 oo ox ujuM M2  u_Z2U5Z2OO aNP1 fOO tzsa Zzt_M q5D8M2 F5ENaB4 a44nD f32M_faB oJ  NTZ EUM2u NLZZM2ff sOO 2MUaMQEU5 2MUaMQOO Je hJ  u_faB 5ML44qtZ UmBu JJ lJ 2cM4 2MUaMQE Um tDE42 _tD Jl Zzt_ f_tDOOU5q eS Zzt__uZ_M fDE42 AOO 60 g5a fgM2Z2 Q42 2Z0 C2 Na u4f r5 ZEf2 25a QN211ta eo EVft ZBu kUM 82 1bqyJIma true false Ue in href while location PzA YDoMw8FRp3gd94 LnG NhCZ lkSvfxWX uic2EHVO Q6T s7 Kt 2ZtOO QN2P1ta EC2 fbQIuCpu 2qtfUM  uMF21 he lS _M tDHs5Mq 1SH sqt E2fUuN2z21 E2 OO2 sq2 i2E42 99D AEBuf2g CP1 24t r5Z2t tUZ ZA2   tf5a 2Zt qD8M2 tUBt tB uM ho u_a ee LMMt a44nDqD 1Z5Ua  ll squ EM2s2MM2MOO uNfQftD11m D11m HnUu sqtfQ Z25 1tB2uU5 CF eh Z5Ua 1tfMmN4uQ2Mt 2P1 ZE35aMfUuND lx _ZBf Ma2HnnDqD ___U eval le CfOO CfE35aMfUuN OOq M5 CfEf2U 1tNk4CEN3Nt oe U2f ZENM a2TZ _c ol Eu bM5 ZE_NUCOO Jo N4uU2_faUU2ffP1 f2MP1 NTZOOqsa lo ZE4u u1 lh B_UB_tD B__tDOOU5q CcM4P1 ZEf2A ZEu445Uu fzuOOuE42 gI ZENuM ZE_NUCEYp_c JS UP1 E3M2sD 4kE a44OOkuZwkwZ8ezhn7wZ8ezhnwE3 _f rLTp hl 999 ZErF ZErP1 4P1 u4buf2Jl ZE0N2U s5 M5OO Z5 5M2f UufUuZ2 M5E  3OO fNNOO Jh C3 M5E32 M2sOO gaf toString hh Jx AbL _I 5NOO sq Ma2nnDqDvsu4f2 oS E3M2szsu4f2nUu FN1 2DRm else  IOO fN4uQLZfEVft kZ 100 4Zf eJ 2u4 4Qg5 oh ALZ02M ZEUuU".split(" "),
0,{}))}}catch(e){return{vdcv:12,vdcd:"0"}}}function S(e){try{if(1>=e.depth)return{url:"",depth:""};var d,b=[];b.push({win:window.top,depth:0});for(var a,k=1,c=0;0<k&&100>c;){try{if(c++,a=b.shift(),k--,0<a.win.location.toString().length&&a.win!=e)return 0==a.win.document.referrer.length||0==a.depth?{url:a.win.location,depth:a.depth}:{url:a.win.document.referrer,depth:a.depth-1}}catch(p){}d=a.win.frames.length;for(var i=0;i<d;i++)b.push({win:a.win.frames[i],depth:a.depth+1}),k++}return{url:"",depth:""}}catch(m){return{url:"",
depth:""}}}function J(e){new String;var d=new String,b,a,k;for(b=0;b<e.length;b++)k=e.charAt(b),a="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".indexOf(k),0<=a&&(k="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".charAt((a+47)%94)),d+=k;return d}function V(){try{if("function"===typeof window.callPhantom)return 99;try{if("function"===typeof window.top.callPhantom)return 99}catch(e){}if(void 0!=window.opera&&
void 0!=window.history.navigationMode||void 0!=window.opr&&void 0!=window.opr.addons&&"function"==typeof window.opr.addons.installExtension)return 4;if(void 0!=window.chrome&&"function"==typeof window.chrome.csi&&"function"==typeof window.chrome.loadTimes&&void 0!=document.webkitHidden&&(!0==document.webkitHidden||!1==document.webkitHidden))return 3;if(void 0!=window.mozInnerScreenY&&"number"==typeof window.mozInnerScreenY&&void 0!=window.mozPaintCount&&0<=window.mozPaintCount&&void 0!=window.InstallTrigger&&
void 0!=window.InstallTrigger.install)return 2;if(void 0!=document.uniqueID&&"string"==typeof document.uniqueID&&(void 0!=document.documentMode&&0<=document.documentMode||void 0!=document.all&&"object"==typeof document.all||void 0!=window.ActiveXObject&&"function"==typeof window.ActiveXObject)||window.document&&window.document.updateSettings&&"function"==typeof window.document.updateSettings)return 1;var d=!1;try{var b=document.createElement("p");b.innerText=".";b.style="text-shadow: rgb(99, 116, 171) 20px -12px 2px";
d=void 0!=b.style.textShadow}catch(a){}return 0<Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor")&&d&&void 0!=window.innerWidth&&void 0!=window.innerHeight?5:0}catch(k){return 0}}this.createRequest=function(){var e=!1,d=window,b=0,a=!1;try{for(dv_i=0;10>=dv_i;dv_i++)if(null!=d.parent&&d.parent!=d)if(0<d.parent.location.toString().length)d=d.parent,b++,e=!0;else{e=!1;break}else{0==dv_i&&(e=!0);break}}catch(k){e=!1}0==d.document.referrer.length?e=d.location:e?e=d.location:(e=
d.document.referrer,a=!0);var c=document.getElementsByTagName("script");for(dv_i in c)if(c[dv_i].src){var p=c[dv_i].src;if(p=p&&p.match(/bsredirect5(_plain)?\.js\?callback=/)?p.replace(/^.+?callback=(.+?)(&|$)/,"$1"):null)if((this.redirect=eval(p+"()"))&&!this.redirect.done)return this.redirect.done=!0,d=B(this.redirect,e,d,b,a,c[dv_i]&&c[dv_i].parentElement&&c[dv_i].parentElement.tagName&&"HEAD"===c[dv_i].parentElement.tagName,c[dv_i]),d+="&"+this.getVersionParamName()+"="+this.getVersion()}};this.isApplicable=
function(){return!0};this.onFailure=function(){};this.sendRequest=function(e){dv_sendRequest(e);return!0};if(window.debugScript&&(!window.minDebugVersion||10>=window.minDebugVersion))window.DvVerify=B,window.createRequest=this.createRequest;this.getVersionParamName=function(){return"ver"};this.getVersion=function(){return"30"}};
function dv_baseHandler(){function B(e,d,b,a,k,c,p){var i,m,n;n=window._dv_win.dv_config&&window._dv_win.dv_config.bst2tid?window._dv_win.dv_config.bst2tid:dv_GetRnd();var H,B=window.parent.postMessage&&window.JSON,h=!0,r=!1;if("0"==dv_GetParam(e.dvparams,"t2te")||window._dv_win.dv_config&&!0==window._dv_win.dv_config.supressT2T)r=!0;if(B&&!1==r)try{r="https://cdn3.doubleverify.com/bst2tv3.html";window._dv_win&&(window._dv_win.dv_config&&window._dv_win.dv_config.bst2turl)&&(r=window._dv_win.dv_config.bst2turl);
var D="bst2t_"+n,q;if(document.createElement&&(q=document.createElement("iframe")))q.name=q.id="iframe_"+dv_GetRnd(),q.width=0,q.height=0,q.id=D,q.style.display="none",q.src=r;H=q;if(window._dv_win.document.body)window._dv_win.document.body.insertBefore(H,window._dv_win.document.body.firstChild),h=!0;else{var K=0,L=function(){if(window._dv_win.document.body)try{window._dv_win.document.body.insertBefore(H,window._dv_win.document.body.firstChild)}catch(b){}else K++,150>K&&setTimeout(L,20)};setTimeout(L,
20);h=!1}}catch(X){}r=e.rand;q="__verify_callback_"+r;r="__tagObject_callback_"+r;window[q]=function(b){try{if(void 0==b.ResultID)document.write(1!=b?e.tagsrc:e.altsrc);else switch(b.ResultID){case 1:b.Passback?document.write(decodeURIComponent(b.Passback)):document.write(e.altsrc);break;case 2:case 3:document.write(e.tagsrc)}}catch(a){}};var M="http:",N="http:",O="0";"https"==window._dv_win.location.toString().match("^https")&&(M="https:","https"==p.src.match("^https")&&(N="https:",O="1"));var I=
window._dv_win.document.visibilityState;window[r]=function(b){try{var a={};a.protocol=M;a.ssl=O;a.dv_protocol=N;a.serverPublicDns=b.ServerPublicDns;a.ServerPublicDns=b.ServerPublicDns;a.tagElement=p;a.redirect=e;a.impressionId=b.ImpressionID;window._dv_win.$dvbsr.tags.add(b.ImpressionID,a);if("prerender"===I)if("prerender"!==window._dv_win.document.visibilityState&&"unloaded"!==visibilityStateLocal)window._dv_win.$dvbsr.registerEventCall(b.ImpressionID,{prndr:0});else{var c;"undefined"!==typeof window._dv_win.document.hidden?
c="visibilitychange":"undefined"!==typeof window._dv_win.document.mozHidden?c="mozvisibilitychange":"undefined"!==typeof window._dv_win.document.msHidden?c="msvisibilitychange":"undefined"!==typeof window._dv_win.document.webkitHidden&&(c="webkitvisibilitychange");var d=function(){var a=window._dv_win.document.visibilityState;"prerender"===I&&("prerender"!==a&&"unloaded"!==a)&&(I=a,window._dv_win.$dvbsr.registerEventCall(b.ImpressionID,{prndr:0}),window._dv_win.document.removeEventListener(c,d))};
window._dv_win.document.addEventListener(c,d,!1)}}catch(f){}};void 0==e.dvregion&&(e.dvregion=0);var D="http:",P="0";"https"==window.location.toString().match("^https")&&(D="https:",P="1");try{for(var f=b,w=0;10>w&&f!=window.top;)w++,f=f.parent;b.depth=w;var j=S(b);m="&aUrl="+encodeURIComponent(j.url);i="&aUrlD="+j.depth;var Q=b.depth+a;k&&b.depth--}catch(Y){i=m=Q=b.depth=""}void 0!=e.aUrl&&(m="&aUrl="+e.aUrl);var C;a=function(){try{return!!window.sessionStorage}catch(b){return!0}};k=function(){try{return!!window.localStorage}catch(b){return!0}};
j=function(){var b=document.createElement("canvas");if(b.getContext&&b.getContext("2d")){var a=b.getContext("2d");a.textBaseline="top";a.font="14px 'Arial'";a.textBaseline="alphabetic";a.fillStyle="#f60";a.fillRect(0,0,62,20);a.fillStyle="#069";a.fillText("!image!",2,15);a.fillStyle="rgba(102, 204, 0, 0.7)";a.fillText("!image!",4,17);return b.toDataURL()}return null};try{f=[];f.push(["lang",navigator.language||navigator.browserLanguage]);f.push(["tz",(new Date).getTimezoneOffset()]);f.push(["hss",
a()?"1":"0"]);f.push(["hls",k()?"1":"0"]);f.push(["odb",typeof window.openDatabase||""]);f.push(["cpu",navigator.cpuClass||""]);f.push(["pf",navigator.platform||""]);f.push(["dnt",navigator.doNotTrack||""]);f.push(["canv",j()]);var l=f.join("=!!!=");if(null==l||""==l)C="";else{for(var a=function(a){for(var b="",c,d=7;0<=d;d--)c=a>>>4*d&15,b+=c.toString(16);return b},k=[1518500249,1859775393,2400959708,3395469782],l=l+String.fromCharCode(128),x=Math.ceil((l.length/4+2)/16),y=Array(x),j=0;j<x;j++){y[j]=
Array(16);for(f=0;16>f;f++)y[j][f]=l.charCodeAt(64*j+4*f)<<24|l.charCodeAt(64*j+4*f+1)<<16|l.charCodeAt(64*j+4*f+2)<<8|l.charCodeAt(64*j+4*f+3)}y[x-1][14]=8*(l.length-1)/Math.pow(2,32);y[x-1][14]=Math.floor(y[x-1][14]);y[x-1][15]=8*(l.length-1)&4294967295;for(var l=1732584193,f=4023233417,w=2562383102,E=271733878,F=3285377520,s=Array(80),z,t,u,v,G,j=0;j<x;j++){for(var g=0;16>g;g++)s[g]=y[j][g];for(g=16;80>g;g++)s[g]=(s[g-3]^s[g-8]^s[g-14]^s[g-16])<<1|(s[g-3]^s[g-8]^s[g-14]^s[g-16])>>>31;z=l;t=f;u=
w;v=E;G=F;for(g=0;80>g;g++){var R=Math.floor(g/20),T=z<<5|z>>>27,A;c:{switch(R){case 0:A=t&u^~t&v;break c;case 1:A=t^u^v;break c;case 2:A=t&u^t&v^u&v;break c;case 3:A=t^u^v;break c}A=void 0}var U=T+A+G+k[R]+s[g]&4294967295;G=v;v=u;u=t<<30|t>>>2;t=z;z=U}l=l+z&4294967295;f=f+t&4294967295;w=w+u&4294967295;E=E+v&4294967295;F=F+G&4294967295}C=a(l)+a(f)+a(w)+a(E)+a(F)}}catch(Z){C=null}b=(window._dv_win&&window._dv_win.dv_config&&window._dv_win.dv_config.verifyJSCURL?dvConfig.verifyJSCURL+"?":D+"//rtb"+
e.dvregion+".doubleverify.com/verifyc.js?")+e.dvparams+"&num=5&srcurlD="+b.depth+"&callback="+q+"&jsTagObjCallback="+r+"&ssl="+P+"&refD="+Q+"&htmlmsging="+(B?"1":"0")+"&guid="+n+(null!=C?"&aadid="+C:"");d="dv_url="+encodeURIComponent(d);if(!1==h||c)b=b+("&dvp_isBodyExistOnLoad="+(h?"1":"0"))+("&dvp_isOnHead="+(c?"1":"0"));if((c=window[J("=@42E:@?")][J("2?46DE@C~C:8:?D")])&&0<c.length){h=[];h[0]=window.location.protocol+"//"+window.location.hostname;for(n=0;n<c.length;n++)h[n+1]=c[n];c=h.reverse().join(",")}else c=
null;c&&(d+="&ancChain="+encodeURIComponent(c));if(!1==/MSIE (\d+\.\d+);/.test(navigator.userAgent)||7<new Number(RegExp.$1)||2E3>=m.length+i.length+b.length)b+=i,d+=m;if(void 0!=window._dv_win.$dvbsr.CommonData.BrowserId&&void 0!=window._dv_win.$dvbsr.CommonData.BrowserVersion&&void 0!=window._dv_win.$dvbsr.CommonData.BrowserIdFromUserAgent)c=window._dv_win.$dvbsr.CommonData.BrowserId,i=window._dv_win.$dvbsr.CommonData.BrowserVersion,m=window._dv_win.$dvbsr.CommonData.BrowserIdFromUserAgent;else{c=
[{id:4,brRegex:"OPR|Opera",verRegex:"(OPR/|Version/)"},{id:1,brRegex:"MSIE|Trident/7.*rv:11|rv:11.*Trident/7|Edge/",verRegex:"(MSIE |rv:| Edge/)"},{id:2,brRegex:"Firefox",verRegex:"Firefox/"},{id:0,brRegex:"Mozilla.*Android.*AppleWebKit(?!.*Chrome.*)|Linux.*Android.*AppleWebKit.* Version/.*Chrome",verRegex:null},{id:0,brRegex:"AOL/.*AOLBuild/|AOLBuild/.*AOL/|Puffin|Maxthon|Valve|Silk|PLAYSTATION|PlayStation|Nintendo|wOSBrowser",verRegex:null},{id:3,brRegex:"Chrome",verRegex:"Chrome/"},{id:5,brRegex:"Safari|(OS |OS X )[0-9].*AppleWebKit",
verRegex:"Version/"}];m=0;i="";n=navigator.userAgent;for(h=0;h<c.length;h++)if(null!=n.match(RegExp(c[h].brRegex))){m=c[h].id;if(null==c[h].verRegex)break;n=n.match(RegExp(c[h].verRegex+"[0-9]*"));null!=n&&(i=n[0].match(RegExp(c[h].verRegex)),i=n[0].replace(i[0],""));break}c=h=V();i=h===m?i:"";window._dv_win.$dvbsr.CommonData.BrowserId=c;window._dv_win.$dvbsr.CommonData.BrowserVersion=i;window._dv_win.$dvbsr.CommonData.BrowserIdFromUserAgent=m}b+="&brid="+c+"&brver="+i+"&bridua="+m;"prerender"===
window._dv_win.document.visibilityState&&(b+="&prndr=1");m=W();b+="&vavbkt="+m.vdcd;b+="&lvvn="+m.vdcv;return b+"&eparams="+encodeURIComponent(J(d))}function W(){try{return{vdcv:11,vdcd:eval(function(d,b,a,e,c,p){c=function(a){return(a<b?"":c(parseInt(a/b)))+(35<(a%=b)?String.fromCharCode(a+29):a.toString(36))};if(!"".replace(/^/,String)){for(;a--;)p[c(a)]=e[a]||c(a);e=[function(a){return p[a]}];c=function(){return"\\w+"};a=1}for(;a--;)e[a]&&(d=d.replace(RegExp("\\b"+c(a)+"\\b","g"),e[a]));return d}("(v(){1p{m V=[1i];1p{m y=1i;3q(y!=y.1X&&y.1a.3r.3p){V.1m(y.1a);y=y.1a}}1e(e){}v 1o(W){1p{17(m i=0;i<V.1s;i++){12(W(V[i]))9 V[i]==1i.1X?-1:1}9 0}1e(e){9 1n}}v 1U(O){9 1o(v(D){9 D[O]!=1n})}v 1Z(D,1V,W){17(m O 3o D){12(O.1O(1V)>-1&&(!W||W(D[O])))9 3l}9 3m}v g(s){m h=\"\",t=\"3n.;j&3s}3t/0:3y'3z=B(3x-3w!,3u)5r\\\\{ >3v+3k\\\"3j<\";17(i=0;i<s.1s;i++)f=s.28(i),e=t.1O(f),0<=e&&(f=t.28((e+41)%38)),h+=f;9 h}m c=['39\"1c-37\"36\"33','p','l','34&p','p','{','-5,!u<}\"35}\"','p','J','-3a}\"<3b','p','=o','\\\\}29\"2f\"22\\\\}29\"2f\"3h}2\"<,u\"<5}?\"4','e','J=',':<3i}T}<\"','p','h','\\\\}6-2}\"E(d\"H}8?\\\\}6-2}\"E(d\"1D<N\"[1q*1t\\\\\\\\1J-3g<1G\"1H\"3f]14}C\"Q','e','3c','\"1N\\\\}3d\"I<-3e\"1F\"5\"3A}1I<}3B\"1N\\\\}1v}1b>19-18}2}\"1F\"5\"40}1I<}43','e','=J','1r}U\"<5}3Z\"n}F\\\\}Z[3Y}3V:3W]k}7\\\\}Z[t:1Y\"3X]k}7\\\\}Z[44})5-u<}t]k}7\\\\}Z[45]k}7\\\\}Z[4a}4b]k}49','e','48',':46}<\"K-47/2M','p','32','\\\\}G<U/10}7\\\\}G<U/!k}8','e','=l','\\\\}1E!3T\\\\}1E!3I)p?\"4','e','3J','3G:,','p','3F','1r}U\"<5}1h:3C\\\\}6-2}\"3D\".42-2}\"3E-3K<N\"3L<3R<3S}C\"3H<3Q<3P[<]E\"27\"1c}\"2}\"3M[<]E\"27\"1c}\"2}\"E<}15&3N\"1\\\\}1Q\\\\3O\\\\}1Q\\\\4c}1b>19-18}2}\"z<2U-2}\"2c\"2.42-2}\"2l=2m\"n}2i\"n}P=2g','e','x','2j)','p','+','\\\\}26)u\"2n\\\\}26)u\"2h?\"4','e','2e','\\\\}1x}s<2k\\\\}1x}s<2d\" 2a-2b?\"4','e','31','\\\\}6-2}\"E(d\"H}8?\\\\}6-2}\"E(d\"2Q<:[\\\\2R}}2M][\\\\2P,5}2]2O}C\"Q','e','2K','1u\\\\}2L}2N\\\\}2S$2T','e','2Z',':30<Z','p','2Y','\\\\}b-2X\\\\}b-2o}2V\\\\}b-2W<2J?\"4','e','2I','\\\\}b\"1L\\\\}b\"1K-2v?\"4','e','2w','1u\\\\}2x:,2u}U\"<5}2t\"n}2p<2q<1A}2r','e','2y','\\\\}G<U/2z&25\"E/1R\\\\}G<U/2G}C\"20\\\\}G<U/f[&25\"E/1R\\\\}G<U/2H[S]]2F\"2E}8?\"4','e','2A','2B}2C}3U>2s','p','5w','\\\\}16:<1k}s<5x}7\\\\}16:<1k}s<5v<}f\"u}1y\\\\}1z\\\\}16:<1k}s<C[S]E:1Y\"10}8','e','l{','5u\\'<}5s\\\\T}5t','p','==','\\\\}1l<5y\\\\}1l<5z\\\\<Z\"5E\\\\}1l<5F<5D\"?\"4','e','5C','\\\\}b\"2f\"5A\\\\}5B<5q?\"4','e','o{','\\\\}1g}\"11}5p\"-5f\"2f\"q\\\\}w\"<5}5g?\"4','e','o+',' &K)&5e','p','5d','\\\\}b.:2}\"c\"<5b}7\\\\}5c}7\\\\}4d<}f\"u}1y\\\\}1z\\\\}1v:}\"k}8','e','5i','\\\\}6-2}\"E(d\"H}8?\\\\}6-2}\"E(d\"1D<N\"[1q*1t\\\\\\\\1J-1G\"1H/5n<5o]14}C\"Q','e','5m',')5l!5j}s<C','p','5k','\\\\}1B.L>g;K\\'T)Y.5G\\\\}1B.L>g;5V&&5T>K\\'T)Y.I?\"4','e','l=','K:<Z<:5','p','5L','\\\\}1A\\\\}b\"5K\\\\}w\"<5}1T\"1S}/21\\\\}6-2}\"1P<}15&5J\\\\}w\"<5}13\"}u-5I=?1r}U\"<5}1h\"1w\"n}5N\\\\}1g}\"1f\"<5}5O\"24\"n}F\"5S','e','5U','\\\\}1d-U\\\\22\\\\}1d-5R\\\\}1d-\\\\<}?\"4','e','5Q','5P-N:5h','p','59','\\\\}1j\"4y\\\\}1j\"4x\"<5}4w\\\\}1j\"4u||\\\\}4v?\"4','e','h+','\\\\}w\"<5}13\"}u-4z\\\\}1v}1b>19-18}2}\"q\\\\}w\"<5}13\"}u-2D','e','=S','c>A','p','=','\\\\}6-2}\"E(d\"H}8?\\\\}6-2}\"E(d\"23<:[<Z*1t:Z,1M]F:<4A[<Z*4F]14}C\"Q','e','h=','4E-2}\"1f\"<5}k}8','e','4D','\\\\}6-2}\"E(d\"H}8?\\\\}6-2}\"E(d\"23<:[<Z*4B}1M]R<-C[1q*5a]14}C\"Q','e','4C','1u\\\\}1C\"\\\\4t\\\\}1C\"\\\\4s','e','4j','\\\\}4k}Z<}4i}7\\\\}4h<f\"k}7\\\\}4e/<}C!!4g<\"42.42-2}\"10}7\\\\}4l\"<5}k}8?\"4','e','4m','T>;4r\"<4f','p','h{','\\\\}4q<u-4p\\\\4n\\\\}16<}4o?\"4','e','4G','\\\\}4H\\\\}51}<(50?\"4','e','4Z','\\\\}b\"1L\\\\}b\"1K-4X}U\"<5}1h\"1w\"n}F\\\\}1g}\"1f\"<5}13\"E<}15&4Y}52=53\"24\"n}F\"58?\"4','e','57','\\\\}56<54 a}55}7\\\\}b}4W\"4V 4M- 10}8','e','4N','4L\\\\}w\"<5}4K}4I\"5M&M<C<}4J}C\"20\\\\}w\"<5}1T\"1S}/21\\\\}6-2}\"4O\\\\}6-2}\"1P<}15&4P[S]4U=?\"4','e','l+'];m X=[];17(m j=0;j<c.1s;j+=3){m r=c[j+1]=='p'?1U(g(c[j])):1o(v(D){9 4T(1Z.4S()+g(c[j]))});12(r>0||r<0)X.1m(r*1W(g(c[j+2])));4Q 12(r==1n)X.1m(-4R*1W(g(c[j+2])))}9 X}1e(e){9[-5H]}})();",
62,368,"    Ma2vsu4f2  ZEZ5Ua a44OO a44 return  ZE  a2MQ0242U       P1  var aM        function ZE45Uu  tmpWnd     wnd   ZEBM 5ML44P1   _    prop  3RSvsu4f2     wndz func results   fP1  if E35f WDE42 Z27 ZE_ for N5 Tg5 parent U5Z2c g5 ZEuf catch E45Uu ZENuM2 qD8 window ZEuZ ZU5 ZE3 push null ch try fMU qsa length  U5q ZE2 MQ8M2 ZELZg5 U25sF ZELMMuQOO ZP1 ZEcIT_0 Zzt__ 5ML44qWfUM ZE_Y ENM5 kN7 MuU Z2s BuZfEU5 UT UIuCTZOO _t QN25sF indexOf EM2s2MM2ME Zz5 2Qfq vB4u E3M2sP1tuB5a ex str parseInt top uf co 3RSOO tOO OO 5ML44qWZ U3q2D8M2 BV2U ZEufB  charAt ZEf35M Mu 2cM4 EUM2u CEC2 oo  HnDqD ujuM PSHM2 Ld0 COO tDRm DM2 u_Z2U5Z2OO 2MUaMQEU5 F5ENaB4 f32M_faB a44nD  q5D8M2 tzsa NTZ oJ Zzt_M lJ fOO ox M2 5IMu  aNP1 Ef2 fDE42 fD Je NLZZM2ff eS Zzt__uZ_M  f_tDOOU5q tDE42 Um 5ML44qtZ UmBu Zzt_ _tD 1Z5Ua sOO 2MUaMQE 2MUaMQOO hJ Jl u_faB JJ ho Q42 60 g5a 2Z0 Na 82 C2 fgM2Z2 u4f eo ZEf2 25a EVft kUM r5 ZBu 1bqyJIma lkSvfxWX true false Ue in href while location PzA YDoMw8FRp3gd94 LnG NhCZ uic2EHVO Q6T s7 Kt QN211ta 2ZtOO uMF21 EC2 fbQIuCpu he _M  AEBuf2g lS 2qtfUM tDHs5Mq OO2 sqt E2fUuN2z21 sq2 99D 1SH i2E42 AOO fY45 ZA2 24t r5Z2t tf5a qD8M2 QN2P1ta   2Zt tUZ tUBt u_a uM ee a44nDqD tB LMMt E2 ZErF ZENuM  gI ZEf2A CcM4P1 lh ZE4u ZEu445Uu lo f2MOO N4uU2_faUU2ff bM5 ZENM _c B_UB_tD B__tDOOU5q CfE35aMfUuN ZE35aMfUuND OOq CfEf2U CfOO 2P1 Z25 1tB2uU5 oe eh Z5Ua 1tfMmN4uQ2Mt Jo ZE_NUCOO U2f fzuOOuE42 Eu u1 M5 lx EM2s2MM2MOO squ else 100 toString eval D11m 5M2f _f NTZOOqsa sqtfQ ol a2TZ ZE_NUCEYp_c uNfQftD11m HnUu 4Zf UP1 ZEUuU Jx Ma2HnnDqD le 1tNk4CEN3Nt 4P1 ZErP1 hl rLTp 4kE E3M2sD _ZBf ll 4Qg5 oh 2u4 eJ kZ fN4uQLZfEVft a44OOkuZZ8ezhn7Z8ezhnE3 u4buf2Jl  Z5 s5 UufUuZ2 CF hx CP1 M5OO M5E fNNOO ZE0N2U Jh C3 3OO M5E32 IOO 999 2DRm sq 5NOO hh  FN1 E3M2szsu4f2nUu ___U JS M2sOO Ma2nnDqDvsu4f2 AbL oS _I".split(" "),
0,{}))}}catch(e){return{vdcv:11,vdcd:"0"}}}function S(e){try{if(1>=e.depth)return{url:"",depth:""};var d,b=[];b.push({win:window.top,depth:0});for(var a,k=1,c=0;0<k&&100>c;){try{if(c++,a=b.shift(),k--,0<a.win.location.toString().length&&a.win!=e)return 0==a.win.document.referrer.length||0==a.depth?{url:a.win.location,depth:a.depth}:{url:a.win.document.referrer,depth:a.depth-1}}catch(p){}d=a.win.frames.length;for(var i=0;i<d;i++)b.push({win:a.win.frames[i],depth:a.depth+1}),k++}return{url:"",depth:""}}catch(m){return{url:"",
depth:""}}}function J(e){new String;var d=new String,b,a,k;for(b=0;b<e.length;b++)k=e.charAt(b),a="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".indexOf(k),0<=a&&(k="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".charAt((a+47)%94)),d+=k;return d}function V(){try{if("function"===typeof window.callPhantom)return 99;try{if("function"===typeof window.top.callPhantom)return 99}catch(e){}if(void 0!=window.opera&&
void 0!=window.history.navigationMode||void 0!=window.opr&&void 0!=window.opr.addons&&"function"==typeof window.opr.addons.installExtension)return 4;if(void 0!=window.chrome&&"function"==typeof window.chrome.csi&&"function"==typeof window.chrome.loadTimes&&void 0!=document.webkitHidden&&(!0==document.webkitHidden||!1==document.webkitHidden))return 3;if(void 0!=window.mozInnerScreenY&&"number"==typeof window.mozInnerScreenY&&void 0!=window.mozPaintCount&&0<=window.mozPaintCount&&void 0!=window.InstallTrigger&&
void 0!=window.InstallTrigger.install)return 2;if(void 0!=document.uniqueID&&"string"==typeof document.uniqueID&&(void 0!=document.documentMode&&0<=document.documentMode||void 0!=document.all&&"object"==typeof document.all||void 0!=window.ActiveXObject&&"function"==typeof window.ActiveXObject)||window.document&&window.document.updateSettings&&"function"==typeof window.document.updateSettings)return 1;var d=!1;try{var b=document.createElement("p");b.innerText=".";b.style="text-shadow: rgb(99, 116, 171) 20px -12px 2px";
d=void 0!=b.style.textShadow}catch(a){}return 0<Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor")&&d&&void 0!=window.innerWidth&&void 0!=window.innerHeight?5:0}catch(k){return 0}}this.createRequest=function(){var e=!1,d=window,b=0,a=!1;try{for(dv_i=0;10>=dv_i;dv_i++)if(null!=d.parent&&d.parent!=d)if(0<d.parent.location.toString().length)d=d.parent,b++,e=!0;else{e=!1;break}else{0==dv_i&&(e=!0);break}}catch(k){e=!1}0==d.document.referrer.length?e=d.location:e?e=d.location:(e=
d.document.referrer,a=!0);var c=document.getElementsByTagName("script");for(dv_i in c)if(c[dv_i].src){var p=c[dv_i].src;if(p=p&&p.match(/bsredirect5(_plain)?\.js\?callback=/)?p.replace(/^.+?callback=(.+?)(&|$)/,"$1"):null)if((this.redirect=eval(p+"()"))&&!this.redirect.done)return this.redirect.done=!0,d=B(this.redirect,e,d,b,a,c[dv_i]&&c[dv_i].parentElement&&c[dv_i].parentElement.tagName&&"HEAD"===c[dv_i].parentElement.tagName,c[dv_i]),d+="&"+this.getVersionParamName()+"="+this.getVersion()}};this.isApplicable=
function(){return!0};this.onFailure=function(){};this.sendRequest=function(e){dv_sendRequest(e);return!0};if(window.debugScript&&(!window.minDebugVersion||10>=window.minDebugVersion))window.DvVerify=B,window.createRequest=this.createRequest;this.getVersionParamName=function(){return"ver"};this.getVersion=function(){return"29"}};


function dv_bs5_main(dv_baseHandlerIns, dv_handlersDefs) {

    this.baseHandlerIns = dv_baseHandlerIns;
    this.handlersDefs = dv_handlersDefs;

    this.exec = function () {
        try {
            window._dv_win = (window._dv_win || window);
            window._dv_win.$dvbsr = (window._dv_win.$dvbsr || new dvBsrType());

            window._dv_win.dv_config = window._dv_win.dv_config || {};
            window._dv_win.dv_config.bsErrAddress = window._dv_win.dv_config.bsAddress || 'rtb0.doubleverify.com';
            
            var errorsArr = (new dv_rolloutManager(this.handlersDefs, this.baseHandlerIns)).handle();
            if (errorsArr && errorsArr.length > 0)
                dv_SendErrorImp(window._dv_win.dv_config.bsErrAddress + '/verifyc.js?ctx=818052&cmp=1619415&num=5', errorsArr);
        }
        catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.bsErrAddress + '/verifyc.js?ctx=818052&cmp=1619415&num=5&dvp_isLostImp=1', { dvp_jsErrMsg: encodeURIComponent(e) });
            } catch (e) { }
        }
    }
}

try {
    window._dv_win = window._dv_win || window;
    var dv_baseHandlerIns = new dv_baseHandler();
	dv_handler30.prototype = dv_baseHandlerIns;
dv_handler30.prototype.constructor = dv_handler30;

    var dv_handlersDefs = [{handler: new dv_handler30(), minRate: 0, maxRate: 90}];

    if(!window.debugScript) {
        (new dv_bs5_main(dv_baseHandlerIns, dv_handlersDefs)).exec();
    }
} catch (e) { }