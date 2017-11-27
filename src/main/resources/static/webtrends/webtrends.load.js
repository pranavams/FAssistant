// WebTrends SmartSource Data Collector Tag v10.4.1
// Copyright (c) 2014 Webtrends Inc.  All rights reserved.
// Tag Builder Version: 4.1.3.2
// Created: 2014.03.27
window.webtrendsAsyncInit=function(){
    var dcs=new Webtrends.dcs().init({
        dcsid:"dcsge84kp100004jdukrosmvn_9w5f",
        domain:"www.tagwebtrends.ford.com",
        timezone:-5,
        i18n:true,
        offsite:true,
        download:true,
        downloadtypes:"xls,doc,pdf,txt,csv,zip,docx,xlsx,rar,gzip,ppt,pptx",
        anchor:true,
        javascript: true,
        onsitedoms:"agtp843.ford.com",
        fpcdom:".agtp843.ford.com",
        plugins:{
          pageLoadTiming: {src: "webtrends/PageLoadTimePlugin.js",sampleRate:100, maxT:3}
        }
        }).track();
};
(function(){
    var s=document.createElement("script"); s.async=true; s.src="webtrends/webtrends.js";
    var s2=document.getElementsByTagName("script")[0]; s2.parentNode.insertBefore(s,s2);
}());
