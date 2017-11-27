/**
 * Created by JOHN_LAPTOP on 10/26/14.
 */
/*
 This plug-in is written based on the W3C Navigational Timing spec
 REC-navigational-timing-20121217 (http://www.w3.org/TR/navigation-timing/)

 ======================================================================================================================
 Per the spec:
 The interface is not intended to be uses as any sort of performance benchmark for user agents.

 The plug-in is measuring various timing attributes of the browser.
 pageLoad - Page Load time
 The amount of time before the page onLoad event takes place.  IT DOES NOT INCLUDE ANY TIME THE BROWSER IS
 LOADING ASYNC SCRIPTING OR PROCESSING JAVASCRIPTING THAT IS ON THE PAGE.
 IT IS NOT MEASURING WHEN THE VISITOR CAN INTERACT WITH THE PAGE.  HENCE, THE VISITOR PERCEIVED PAGE LOAD
 TIME CAN BE SIGNIFICANTLY MORE DEPENDING ON THE SCRIPTING THAT'S ON THE PAGE.

 pageRedir - Page Redirect time
 If there is a page redirect this parameter indicates the time required for the redirect to take place.
 Its generally not very useful.  The data will always be zero unless there is a callback for tracking because
 the redirect will move the page before the tracking can occur.

 serverConn - Page Connection time
 The amount of time it takes to connect to the server, and for the server to respond to the connection request.
 Note that for ssl connections this metric will be larger because it includes the time to negotiate the SSL
 connections and SOCKS authentication.  When evaluating this metrics if should be segmented by ssl and non ssl
 connection types.

 pageDns - Page Domain Lookup time
 The amount of time it takes for the domain name lookup for the current document.

 serverResponse - Server Response time
 The time to receive the page from the server

 pageDownload - The amount fo time it takes to download teh page markup


 domContentLoaded = about of time it took for the content to fully load

 All parameters return seconds to the 1,000 decimal

 ++++++++++++++++++++++++++++++++++++++++
 ********** IMPORTANT *******************
 ++++++++++++++++++++++++++++++++++++++++
 This plugin creates an additional server call.  Take this into consideration when setting the sampleRate as it
 can potentially double your page load server calls.

 ****************************************

 Options:

 maxT = max time before data will not be sent.  2 minutes default.
 This guards against extreme time skewing the averages

 sampleRate = the percentage of pages to send the time on.  50 ist the default

 dcsid = the dcsid tp send the data to (default is the current tag dcsid)
 domain: the sdc address to send the data to (default = current tag domain)

 Parameters Created:
 WT.tm_pageLoad	        example - 0.185
 WT.tm_serverConn	    example - 0.000
 WT.tm_pageDns	        example - 0.000
 WT.tm_serverResponse	example - 0.000
 WT.tm_pageDownload	    example - 0.000
 WT.tm_domContentLoaded example - 0.185
 WT.tm_tv	            example - 1.0.0
 WT.dl                  example - 70


 Example load:
 plugin:{
 pageLoadTiming:{src:"/WebtrendsAsset/PageLoadTimePlugin.js",sampleRate:100, maxT:3}
 }
 */


Webtrends.registerPlugin('pageLoadTiming', function (tag, plugin) {
    try {
        var maxT = 2;
        var sampleRate = 50;
        var keepParms = {tz: 1, bh: 1, dl:1, ul: 1, cd: 1, sr: 1, jo: 1, ti: 1, js: 1, jv: 1, ct: 1, bs: 1, fv: 1, slv: 1, le: 1, tv: 1, ssl: 1, es: 1, cg: 1, cg_s: 1, ce: 1, vt_f_tlh: 1, vtvs: 1, vtid: 1, co_f: 1};

        if (typeof plugin != 'undefined' && plugin.maxT) {
            maxT = plugin.maxT;
        }
        if (typeof plugin != 'undefined' && plugin.sampleRate) {
            sampleRate = plugin.sampleRate;
        }
        if (typeof plugin != 'undefined' && plugin.keepParms) {
            keepParms = plugin.keepParms;
        }

        // max time to send
        var maxMS = maxT * 60 * 1000;

        Webtrends.pageLoadtrack = function () {
            // wait until the onload event handler completes
            setTimeout(function () {
                var s = tm.timing;
                var timingResults = [];
                var navStart = s.navigationStart;
                if (navStart == 0) return; // something went wrong

                // page load time
                timingResults['WT.tm_pageLoad'] = s.loadEventEnd - navStart < maxMS ? Number((s.loadEventEnd - navStart) / 1000).toFixed(3) : null;
                if (timingResults['WT.tm_pageLoad'] < 0 ) return;

                // page redirect time
                timingResults['WT.tm_pageRedir'] = null;

                if (s.redirectEnd - s.redirectStart > 0)
                    timingResults['WT.tm_pageRedir'] = s.redirectEnd - s.redirectStart < maxMS ? Number((s.redirectEnd - s.redirectStart) / 1000).toFixed(3) : null;

                //Server connection time
                timingResults['WT.tm_serverConn'] = s.connectEnd - s.connectStart < maxMS ? Number((s.connectEnd - s.connectStart) / 1000).toFixed(3) : null;

                // dns lookup time
                timingResults['WT.tm_pageDns'] = s.domainLookupEnd - s.domainLookupStart < maxMS ? Number((s.domainLookupEnd - s.domainLookupStart) / 1000).toFixed(3) : null;

                // server response time
                timingResults['WT.tm_serverResponse'] = s.responseEnd - s.responseStart < maxMS ? Number((s.responseEnd - s.responseStart) / 1000).toFixed(3) : null;

                // page download time
                timingResults['WT.tm_pageDownload'] = s.responseEnd - s.requestStart < maxMS ? Number((s.responseEnd - s.requestStart) / 1000).toFixed(3) : null;

                // dom ContentLoad
                timingResults['WT.tm_domContentLoaded'] = s.domContentLoadedEventEnd - navStart < maxMS ? Number((s.domContentLoadedEventStart - navStart) / 1000).toFixed(3) : null;

                timingResults['WT.dl'] = 70;
                timingResults['WT.tm_tv'] = '1.0.0';


                tagObj.dcsMultiTrack({args: timingResults,
                    transform: function (d, o) {
                        // clear out stuff we don't want to send
                        for (t in d.WT) {
                            if (typeof keepParms[t] == 'undefined') {
                                o.argsa.push('WT.' + t, null);
                            }
                        }
                    }});

            }, 0);
        };

// if the browser does not support the function then do nothing
        var tm = window.performance || window.webkitPerformance;
        if (tm) {

            // sent data sample rate trigger
            if ((sampleRate - Math.random() * 100) > 0) {

                // clone a private tag object so we don't interfere with the main tag or propagate our paramaters
                var tagObj = new Webtrends.dcs();
                var config = {
                    dcsid: ((plugin["dcsid"]) ? plugin["dcsid"] : tag["dcsid"]),
                    domain: ((plugin["domain"]) ? plugin["domain"] : tag["domain"]),
                    timezone: tag['timezone'],
                    i18n: tag['i18n'],
                    vtid: tag['vtid'],
                    enabled: tag['enabled'],
                    privateFlag: true
                };

                if (tag['FPCConfig']) {
                    var FPCConfig = {};
                    var TPCConfig = {};

                    FPCConfig['enabled'] = tag['FPCConfig']['enabled'];
                    FPCConfig['name'] = tag['FPCConfig']['name'];
                    FPCConfig['domain'] = tag['FPCConfig']['domain'];
                    FPCConfig['expires'] = tag['FPCConfig']['expiry'];

                    TPCConfig['enabled'] = tag['enabled'];
                    TPCConfig['cfgType'] = tag['cfgType'];

                    config['FPCConfig'] = FPCConfig;
                    config['TPCConfig'] = TPCConfig;
                }
                else {
                    config['fpc'] = tag['fpc'];
                    config['fpcdom'] = tag['fpcdom'];
                    config['cookieexpires'] = tag['cookieExp'];
                }

                tagObj.init(config);


                if (document.readyState === 'complete') {
                    Webtrends.pageLoadtrack();
                } else {
                    // don't do anything until the onload event handler fires
                    window[ window.addEventListener ? 'addEventListener' : 'attachEvent' ]
                    (window.addEventListener ? 'load' : 'onload', Webtrends.pageLoadtrack);
                }
            }
        }
    } catch (e) {
    }
});