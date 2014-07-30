
/*!
* TableSorter 2.17.5 min - Client-side table sorting with ease!
* Copyright (c) 2007 Christian Bach
*/
!function(g){g.extend({tablesorter:new function(){function d(){var b=arguments[0],a=1<arguments.length?Array.prototype.slice.call(arguments):b;if("undefined"!==typeof console&&"undefined"!==typeof console.log)console[/error/i.test(b)?"error":/warn/i.test(b)?"warn":"log"](a);else alert(a)}function v(b,a){d(b+" ("+((new Date).getTime()-a.getTime())+"ms)")}function p(b){for(var a in b)return!1;return!0}function n(b,a,c){if(!a)return"";var h,e=b.config,r=e.textExtraction||"",k="",k="basic"===r?g(a).attr(e.textAttribute)|| a.textContent||a.innerText||g(a).text()||"":"function"===typeof r?r(a,b,c):"function"===typeof(h=f.getColumnData(b,r,c))?h(a,b,c):a.textContent||a.innerText||g(a).text()||"";return g.trim(k)}function t(b){var a=b.config,c=a.$tbodies=a.$table.children("tbody:not(."+a.cssInfoBlock+")"),h,e,r,k,l,m,g,u,p,q=0,s="",t=c.length;if(0===t)return a.debug?d("Warning: *Empty table!* Not building a parser cache"):"";a.debug&&(p=new Date,d("Detecting parsers for each column"));for(e=[];q<t;){h=c[q].rows;if(h[q])for(r= a.columns,k=0;k<r;k++){l=a.$headers.filter('[data-column="'+k+'"]:last');m=f.getColumnData(b,a.headers,k);u=f.getParserById(f.getData(l,m,"sorter"));g="false"===f.getData(l,m,"parser");a.empties[k]=f.getData(l,m,"empty")||a.emptyTo||(a.emptyToBottom?"bottom":"top");a.strings[k]=f.getData(l,m,"string")||a.stringTo||"max";g&&(u=f.getParserById("no-parser"));if(!u)a:{l=b;m=h;g=-1;u=k;for(var A=void 0,x=f.parsers.length,z=!1,F="",A=!0;""===F&&A;)g++,m[g]?(z=m[g].cells[u],F=n(l,z,u),l.config.debug&&d("Checking if value was empty on row "+ g+", column: "+u+': "'+F+'"')):A=!1;for(;0<=--x;)if((A=f.parsers[x])&&"text"!==A.id&&A.is&&A.is(F,l,z)){u=A;break a}u=f.getParserById("text")}a.debug&&(s+="column:"+k+"; parser:"+u.id+"; string:"+a.strings[k]+"; empty: "+a.empties[k]+"\n");e[k]=u}q+=e.length?t:1}a.debug&&(d(s?s:"No parsers detected"),v("Completed detecting parsers",p));a.parsers=e}function x(b){var a,c,h,e,r,k,l,m,y,u,p,q=b.config,s=q.$table.children("tbody"),t=q.parsers;q.cache={};q.totalRows=0;if(!t)return q.debug?d("Warning: *Empty table!* Not building a cache"): "";q.debug&&(m=new Date);q.showProcessing&&f.isProcessing(b,!0);for(r=0;r<s.length;r++)if(p=[],a=q.cache[r]={normalized:[]},!s.eq(r).hasClass(q.cssInfoBlock)){y=s[r]&&s[r].rows.length||0;for(h=0;h<y;++h)if(u={child:[]},k=g(s[r].rows[h]),l=[],k.hasClass(q.cssChildRow)&&0!==h)c=a.normalized.length-1,a.normalized[c][q.columns].$row=a.normalized[c][q.columns].$row.add(k),k.prev().hasClass(q.cssChildRow)||k.prev().addClass(f.css.cssHasChild),u.child[c]=g.trim(k[0].textContent||k[0].innerText||k.text()|| "");else{u.$row=k;u.order=h;for(e=0;e<q.columns;++e)"undefined"===typeof t[e]?q.debug&&d("No parser found for cell:",k[0].cells[e],"does it have a header?"):(c=n(b,k[0].cells[e],e),c="no-parser"===t[e].id?"":t[e].format(c,b,k[0].cells[e],e),l.push(c),"numeric"===(t[e].type||"").toLowerCase()&&(p[e]=Math.max(Math.abs(c)||0,p[e]||0)));l[q.columns]=u;a.normalized.push(l)}a.colMax=p;q.totalRows+=a.normalized.length}q.showProcessing&&f.isProcessing(b);q.debug&&v("Building cache for "+y+" rows",m)}function z(b, a){var c=b.config,h=c.widgetOptions,e=b.tBodies,r=[],k=c.cache,d,m,y,u,n,q;if(p(k))return c.appender?c.appender(b,r):b.isUpdating?c.$table.trigger("updateComplete",b):"";c.debug&&(q=new Date);for(n=0;n<e.length;n++)if(d=g(e[n]),d.length&&!d.hasClass(c.cssInfoBlock)){y=f.processTbody(b,d,!0);d=k[n].normalized;m=d.length;for(u=0;u<m;u++)r.push(d[u][c.columns].$row),c.appender&&(!c.pager||c.pager.removeRows&&h.pager_removeRows||c.pager.ajax)||y.append(d[u][c.columns].$row);f.processTbody(b,y,!1)}c.appender&& c.appender(b,r);c.debug&&v("Rebuilt table",q);a||c.appender||f.applyWidget(b);b.isUpdating&&c.$table.trigger("updateComplete",b)}function C(b){return/^d/i.test(b)||1===b}function D(b){var a,c,h,e,r,k,l,m=b.config;m.headerList=[];m.headerContent=[];m.debug&&(l=new Date);m.columns=f.computeColumnIndex(m.$table.children("thead, tfoot").children("tr"));e=m.cssIcon?'<i class="'+(m.cssIcon===f.css.icon?f.css.icon:m.cssIcon+" "+f.css.icon)+'"></i>':"";m.$headers.each(function(d){c=g(this);a=f.getColumnData(b, m.headers,d,!0);m.headerContent[d]=g(this).html();r=m.headerTemplate.replace(/\{content\}/g,g(this).html()).replace(/\{icon\}/g,e);m.onRenderTemplate&&(h=m.onRenderTemplate.apply(c,[d,r]))&&"string"===typeof h&&(r=h);g(this).html('<div class="'+f.css.headerIn+'">'+r+"</div>");m.onRenderHeader&&m.onRenderHeader.apply(c,[d]);this.column=parseInt(g(this).attr("data-column"),10);this.order=C(f.getData(c,a,"sortInitialOrder")||m.sortInitialOrder)?[1,0,2]:[0,1,2];this.count=-1;this.lockedOrder=!1;k=f.getData(c, a,"lockedOrder")||!1;"undefined"!==typeof k&&!1!==k&&(this.order=this.lockedOrder=C(k)?[1,1,1]:[0,0,0]);c.addClass(f.css.header+" "+m.cssHeader);m.headerList[d]=this;c.parent().addClass(f.css.headerRow+" "+m.cssHeaderRow).attr("role","row");m.tabIndex&&c.attr("tabindex",0)}).attr({scope:"col",role:"columnheader"});B(b);m.debug&&(v("Built headers:",l),d(m.$headers))}function E(b,a,c){var h=b.config;h.$table.find(h.selectorRemove).remove();t(b);x(b);H(h.$table,a,c)}function B(b){var a,c,h=b.config; h.$headers.each(function(e,r){c=g(r);a="false"===f.getData(r,f.getColumnData(b,h.headers,e,!0),"sorter");r.sortDisabled=a;c[a?"addClass":"removeClass"]("sorter-false").attr("aria-disabled",""+a);b.id&&(a?c.removeAttr("aria-controls"):c.attr("aria-controls",b.id))})}function G(b){var a,c,h=b.config,e=h.sortList,r=e.length,d=f.css.sortNone+" "+h.cssNone,l=[f.css.sortAsc+" "+h.cssAsc,f.css.sortDesc+" "+h.cssDesc],m=["ascending","descending"],y=g(b).find("tfoot tr").children().add(h.$extraHeaders).removeClass(l.join(" ")); h.$headers.removeClass(l.join(" ")).addClass(d).attr("aria-sort","none");for(a=0;a<r;a++)if(2!==e[a][1]&&(b=h.$headers.not(".sorter-false").filter('[data-column="'+e[a][0]+'"]'+(1===r?":last":"")),b.length)){for(c=0;c<b.length;c++)b[c].sortDisabled||b.eq(c).removeClass(d).addClass(l[e[a][1]]).attr("aria-sort",m[e[a][1]]);y.length&&y.filter('[data-column="'+e[a][0]+'"]').removeClass(d).addClass(l[e[a][1]])}h.$headers.not(".sorter-false").each(function(){var b=g(this),a=this.order[(this.count+1)%(h.sortReset? 3:2)],a=b.text()+": "+f.language[b.hasClass(f.css.sortAsc)?"sortAsc":b.hasClass(f.css.sortDesc)?"sortDesc":"sortNone"]+f.language[0===a?"nextAsc":1===a?"nextDesc":"nextNone"];b.attr("aria-label",a)})}function L(b){if(b.config.widthFixed&&0===g(b).find("colgroup").length){var a=g("<colgroup>"),c=g(b).width();g(b.tBodies[0]).find("tr:first").children("td:visible").each(function(){a.append(g("<col>").css("width",parseInt(g(this).width()/c*1E3,10)/10+"%"))});g(b).prepend(a)}}function M(b,a){var c,h,e, f,d,l=b.config,m=a||l.sortList;l.sortList=[];g.each(m,function(b,a){f=parseInt(a[0],10);if(e=l.$headers.filter('[data-column="'+f+'"]:last')[0]){h=(h=(""+a[1]).match(/^(1|d|s|o|n)/))?h[0]:"";switch(h){case "1":case "d":h=1;break;case "s":h=d||0;break;case "o":c=e.order[(d||0)%(l.sortReset?3:2)];h=0===c?1:1===c?0:2;break;case "n":e.count+=1;h=e.order[e.count%(l.sortReset?3:2)];break;default:h=0}d=0===b?h:d;c=[f,parseInt(h,10)||0];l.sortList.push(c);h=g.inArray(c[1],e.order);e.count=0<=h?h:c[1]%(l.sortReset? 3:2)}})}function N(b,a){return b&&b[a]?b[a].type||"":""}function O(b,a,c){var h,e,d,k=b.config,l=!c[k.sortMultiSortKey],m=k.$table;m.trigger("sortStart",b);a.count=c[k.sortResetKey]?2:(a.count+1)%(k.sortReset?3:2);k.sortRestart&&(e=a,k.$headers.each(function(){this===e||!l&&g(this).is("."+f.css.sortDesc+",."+f.css.sortAsc)||(this.count=-1)}));e=a.column;if(l){k.sortList=[];if(null!==k.sortForce)for(h=k.sortForce,c=0;c<h.length;c++)h[c][0]!==e&&k.sortList.push(h[c]);h=a.order[a.count];if(2>h&&(k.sortList.push([e, h]),1<a.colSpan))for(c=1;c<a.colSpan;c++)k.sortList.push([e+c,h])}else{if(k.sortAppend&&1<k.sortList.length)for(c=0;c<k.sortAppend.length;c++)d=f.isValueInArray(k.sortAppend[c][0],k.sortList),0<=d&&k.sortList.splice(d,1);if(0<=f.isValueInArray(e,k.sortList))for(c=0;c<k.sortList.length;c++)d=k.sortList[c],h=k.$headers.filter('[data-column="'+d[0]+'"]:last')[0],d[0]===e&&(d[1]=h.order[a.count],2===d[1]&&(k.sortList.splice(c,1),h.count=-1));else if(h=a.order[a.count],2>h&&(k.sortList.push([e,h]),1<a.colSpan))for(c= 1;c<a.colSpan;c++)k.sortList.push([e+c,h])}if(null!==k.sortAppend)for(h=k.sortAppend,c=0;c<h.length;c++)h[c][0]!==e&&k.sortList.push(h[c]);m.trigger("sortBegin",b);setTimeout(function(){G(b);I(b);z(b);m.trigger("sortEnd",b)},1)}function I(b){var a,c,h,e,d,k,g,m,y,n,t,q=0,s=b.config,w=s.textSorter||"",x=s.sortList,z=x.length,B=b.tBodies.length;if(!s.serverSideSorting&&!p(s.cache)){s.debug&&(d=new Date);for(c=0;c<B;c++)k=s.cache[c].colMax,g=s.cache[c].normalized,g.sort(function(c,d){for(a=0;a<z;a++){e= x[a][0];m=x[a][1];q=0===m;if(s.sortStable&&c[e]===d[e]&&1===z)break;(h=/n/i.test(N(s.parsers,e)))&&s.strings[e]?(h="boolean"===typeof s.string[s.strings[e]]?(q?1:-1)*(s.string[s.strings[e]]?-1:1):s.strings[e]?s.string[s.strings[e]]||0:0,y=s.numberSorter?s.numberSorter(c[e],d[e],q,k[e],b):f["sortNumeric"+(q?"Asc":"Desc")](c[e],d[e],h,k[e],e,b)):(n=q?c:d,t=q?d:c,y="function"===typeof w?w(n[e],t[e],q,e,b):"object"===typeof w&&w.hasOwnProperty(e)?w[e](n[e],t[e],q,e,b):f["sortNatural"+(q?"Asc":"Desc")](c[e], d[e],e,b,s));if(y)return y}return c[s.columns].order-d[s.columns].order});s.debug&&v("Sorting on "+x.toString()+" and dir "+m+" time",d)}}function J(b,a){b[0].isUpdating&&b.trigger("updateComplete");g.isFunction(a)&&a(b[0])}function H(b,a,c){var h=b[0].config.sortList;!1!==a&&!b[0].isProcessing&&h.length?b.trigger("sorton",[h,function(){J(b,c)},!0]):(J(b,c),f.applyWidget(b[0],!1))}function K(b){var a=b.config,c=a.$table;c.unbind("sortReset update updateRows updateCell updateAll addRows updateComplete sorton appendCache updateCache applyWidgetId applyWidgets refreshWidgets destroy mouseup mouseleave ".split(" ").join(a.namespace+ " ")).bind("sortReset"+a.namespace,function(c,e){c.stopPropagation();a.sortList=[];G(b);I(b);z(b);g.isFunction(e)&&e(b)}).bind("updateAll"+a.namespace,function(c,e,d){c.stopPropagation();b.isUpdating=!0;f.refreshWidgets(b,!0,!0);f.restoreHeaders(b);D(b);f.bindEvents(b,a.$headers,!0);K(b);E(b,e,d)}).bind("update"+a.namespace+" updateRows"+a.namespace,function(a,c,d){a.stopPropagation();b.isUpdating=!0;B(b);E(b,c,d)}).bind("updateCell"+a.namespace,function(h,e,d,f){h.stopPropagation();b.isUpdating= !0;c.find(a.selectorRemove).remove();var l,m;l=c.find("tbody");m=g(e);h=l.index(g.fn.closest?m.closest("tbody"):m.parents("tbody").filter(":first"));var p=g.fn.closest?m.closest("tr"):m.parents("tr").filter(":first");e=m[0];l.length&&0<=h&&(l=l.eq(h).find("tr").index(p),m=m.index(),a.cache[h].normalized[l][a.columns].$row=p,e=a.cache[h].normalized[l][m]="no-parser"===a.parsers[m].id?"":a.parsers[m].format(n(b,e,m),b,e,m),"numeric"===(a.parsers[m].type||"").toLowerCase()&&(a.cache[h].colMax[m]=Math.max(Math.abs(e)|| 0,a.cache[h].colMax[m]||0)),H(c,d,f))}).bind("addRows"+a.namespace,function(h,e,d,f){h.stopPropagation();b.isUpdating=!0;if(p(a.cache))B(b),E(b,d,f);else{e=g(e);var l,m,v,u,x=e.filter("tr").length,q=c.find("tbody").index(e.parents("tbody").filter(":first"));a.parsers&&a.parsers.length||t(b);for(h=0;h<x;h++){m=e[h].cells.length;u=[];v={child:[],$row:e.eq(h),order:a.cache[q].normalized.length};for(l=0;l<m;l++)u[l]="no-parser"===a.parsers[l].id?"":a.parsers[l].format(n(b,e[h].cells[l],l),b,e[h].cells[l], l),"numeric"===(a.parsers[l].type||"").toLowerCase()&&(a.cache[q].colMax[l]=Math.max(Math.abs(u[l])||0,a.cache[q].colMax[l]||0));u.push(v);a.cache[q].normalized.push(u)}H(c,d,f)}}).bind("updateComplete"+a.namespace,function(){b.isUpdating=!1}).bind("sorton"+a.namespace,function(a,e,d,k){var l=b.config;a.stopPropagation();c.trigger("sortStart",this);M(b,e);G(b);l.delayInit&&p(l.cache)&&x(b);c.trigger("sortBegin",this);I(b);z(b,k);c.trigger("sortEnd",this);f.applyWidget(b);g.isFunction(d)&&d(b)}).bind("appendCache"+ a.namespace,function(a,c,d){a.stopPropagation();z(b,d);g.isFunction(c)&&c(b)}).bind("updateCache"+a.namespace,function(c,e){a.parsers&&a.parsers.length||t(b);x(b);g.isFunction(e)&&e(b)}).bind("applyWidgetId"+a.namespace,function(c,e){c.stopPropagation();f.getWidgetById(e).format(b,a,a.widgetOptions)}).bind("applyWidgets"+a.namespace,function(a,c){a.stopPropagation();f.applyWidget(b,c)}).bind("refreshWidgets"+a.namespace,function(a,c,d){a.stopPropagation();f.refreshWidgets(b,c,d)}).bind("destroy"+ a.namespace,function(a,c,d){a.stopPropagation();f.destroy(b,c,d)}).bind("resetToLoadState"+a.namespace,function(){f.refreshWidgets(b,!0,!0);a=g.extend(!0,f.defaults,a.originalSettings);b.hasInitialized=!1;f.setup(b,a)})}var f=this;f.version="2.17.5";f.parsers=[];f.widgets=[];f.defaults={theme:"default",widthFixed:!1,showProcessing:!1,headerTemplate:"{content}",onRenderTemplate:null,onRenderHeader:null,cancelSelection:!0,tabIndex:!0,dateFormat:"mmddyyyy",sortMultiSortKey:"shiftKey",sortResetKey:"ctrlKey", usNumberFormat:!0,delayInit:!1,serverSideSorting:!1,headers:{},ignoreCase:!0,sortForce:null,sortList:[],sortAppend:null,sortStable:!1,sortInitialOrder:"asc",sortLocaleCompare:!1,sortReset:!1,sortRestart:!1,emptyTo:"bottom",stringTo:"max",textExtraction:"basic",textAttribute:"data-text",textSorter:null,numberSorter:null,widgets:[],widgetOptions:{zebra:["even","odd"]},initWidgets:!0,initialized:null,tableClass:"",cssAsc:"",cssDesc:"",cssNone:"",cssHeader:"",cssHeaderRow:"",cssProcessing:"",cssChildRow:"tablesorter-childRow", cssIcon:"tablesorter-icon",cssInfoBlock:"tablesorter-infoOnly",selectorHeaders:"> thead th, > thead td",selectorSort:"th, td",selectorRemove:".remove-me",debug:!1,headerList:[],empties:{},strings:{},parsers:[]};f.css={table:"tablesorter",cssHasChild:"tablesorter-hasChildRow",childRow:"tablesorter-childRow",header:"tablesorter-header",headerRow:"tablesorter-headerRow",headerIn:"tablesorter-header-inner",icon:"tablesorter-icon",info:"tablesorter-infoOnly",processing:"tablesorter-processing",sortAsc:"tablesorter-headerAsc", sortDesc:"tablesorter-headerDesc",sortNone:"tablesorter-headerUnSorted"};f.language={sortAsc:"Ascending sort applied, ",sortDesc:"Descending sort applied, ",sortNone:"No sort applied, ",nextAsc:"activate to apply an ascending sort",nextDesc:"activate to apply a descending sort",nextNone:"activate to remove the sort"};f.log=d;f.benchmark=v;f.construct=function(b){return this.each(function(){var a=g.extend(!0,{},f.defaults,b);a.originalSettings=b;!this.hasInitialized&&f.buildTable&&"TABLE"!==this.tagName? f.buildTable(this,a):f.setup(this,a)})};f.setup=function(b,a){if(!b||!b.tHead||0===b.tBodies.length||!0===b.hasInitialized)return a.debug?d("ERROR: stopping initialization! No table, thead, tbody or tablesorter has already been initialized"):"";var c="",h=g(b),e=g.metadata;b.hasInitialized=!1;b.isProcessing=!0;b.config=a;g.data(b,"tablesorter",a);a.debug&&g.data(b,"startoveralltimer",new Date);a.supportsDataObject=function(a){a[0]=parseInt(a[0],10);return 1<a[0]||1===a[0]&&4<=parseInt(a[1],10)}(g.fn.jquery.split(".")); a.string={max:1,min:-1,emptyMin:1,emptyMax:-1,zero:0,none:0,"null":0,top:!0,bottom:!1};/tablesorter\-/.test(h.attr("class"))||(c=""!==a.theme?" tablesorter-"+a.theme:"");a.table=b;a.$table=h.addClass(f.css.table+" "+a.tableClass+c).attr({role:"grid"});a.$headers=g(b).find(a.selectorHeaders);a.namespace=a.namespace?"."+a.namespace.replace(/\W/g,""):".tablesorter"+Math.random().toString(16).slice(2);a.$tbodies=h.children("tbody:not(."+a.cssInfoBlock+")").attr({"aria-live":"polite","aria-relevant":"all"}); a.$table.find("caption").length&&a.$table.attr("aria-labelledby","theCaption");a.widgetInit={};a.textExtraction=a.$table.attr("data-text-extraction")||a.textExtraction||"basic";D(b);L(b);t(b);a.totalRows=0;a.delayInit||x(b);f.bindEvents(b,a.$headers,!0);K(b);a.supportsDataObject&&"undefined"!==typeof h.data().sortlist?a.sortList=h.data().sortlist:e&&h.metadata()&&h.metadata().sortlist&&(a.sortList=h.metadata().sortlist);f.applyWidget(b,!0);0<a.sortList.length?h.trigger("sorton",[a.sortList,{},!a.initWidgets, !0]):(G(b),a.initWidgets&&f.applyWidget(b,!1));a.showProcessing&&h.unbind("sortBegin"+a.namespace+" sortEnd"+a.namespace).bind("sortBegin"+a.namespace+" sortEnd"+a.namespace,function(c){clearTimeout(a.processTimer);f.isProcessing(b);"sortBegin"===c.type&&(a.processTimer=setTimeout(function(){f.isProcessing(b,!0)},500))});b.hasInitialized=!0;b.isProcessing=!1;a.debug&&f.benchmark("Overall initialization time",g.data(b,"startoveralltimer"));h.trigger("tablesorter-initialized",b);"function"===typeof a.initialized&& a.initialized(b)};f.getColumnData=function(b,a,c,h){if("undefined"!==typeof a&&null!==a){b=g(b)[0];var e,d=b.config;if(a[c])return h?a[c]:a[d.$headers.index(d.$headers.filter('[data-column="'+c+'"]:last'))];for(e in a)if("string"===typeof e&&(b=h?d.$headers.eq(c).filter(e):d.$headers.filter('[data-column="'+c+'"]:last').filter(e),b.length))return a[e]}};f.computeColumnIndex=function(b){var a=[],c=0,h,e,d,f,l,m,p,v,n,q;for(h=0;h<b.length;h++)for(l=b[h].cells,e=0;e<l.length;e++){d=l[e];f=g(d);m=d.parentNode.rowIndex; f.index();p=d.rowSpan||1;v=d.colSpan||1;"undefined"===typeof a[m]&&(a[m]=[]);for(d=0;d<a[m].length+1;d++)if("undefined"===typeof a[m][d]){n=d;break}c=Math.max(n,c);f.attr({"data-column":n});for(d=m;d<m+p;d++)for("undefined"===typeof a[d]&&(a[d]=[]),q=a[d],f=n;f<n+v;f++)q[f]="x"}return c+1};f.isProcessing=function(b,a,c){b=g(b);var d=b[0].config,e=c||b.find("."+f.css.header);a?("undefined"!==typeof c&&0<d.sortList.length&&(e=e.filter(function(){return this.sortDisabled?!1:0<=f.isValueInArray(parseFloat(g(this).attr("data-column")), d.sortList)})),b.add(e).addClass(f.css.processing+" "+d.cssProcessing)):b.add(e).removeClass(f.css.processing+" "+d.cssProcessing)};f.processTbody=function(b,a,c){b=g(b)[0];if(c)return b.isProcessing=!0,a.before('<span class="tablesorter-savemyplace"/>'),c=g.fn.detach?a.detach():a.remove();c=g(b).find("span.tablesorter-savemyplace");a.insertAfter(c);c.remove();b.isProcessing=!1};f.clearTableBody=function(b){g(b)[0].config.$tbodies.children().detach()};f.bindEvents=function(b,a,c){b=g(b)[0];var d, e=b.config;!0!==c&&(e.$extraHeaders=e.$extraHeaders?e.$extraHeaders.add(a):a);a.find(e.selectorSort).add(a.filter(e.selectorSort)).unbind(["mousedown","mouseup","sort","keyup",""].join(e.namespace+" ")).bind(["mousedown","mouseup","sort","keyup",""].join(e.namespace+" "),function(c,f){var l;l=c.type;if(!(1!==(c.which||c.button)&&!/sort|keyup/.test(l)||"keyup"===l&&13!==c.which||"mouseup"===l&&!0!==f&&250<(new Date).getTime()-d)){if("mousedown"===l)return d=(new Date).getTime(),/(input|select|button|textarea)/i.test(c.target.tagName)? "":!e.cancelSelection;e.delayInit&&p(e.cache)&&x(b);l=g.fn.closest?g(this).closest("th, td")[0]:/TH|TD/.test(this.tagName)?this:g(this).parents("th, td")[0];l=e.$headers[a.index(l)];l.sortDisabled||O(b,l,c)}});e.cancelSelection&&a.attr("unselectable","on").bind("selectstart",!1).css({"user-select":"none",MozUserSelect:"none"})};f.restoreHeaders=function(b){var a=g(b)[0].config;a.$table.find(a.selectorHeaders).each(function(b){g(this).find("."+f.css.headerIn).length&&g(this).html(a.headerContent[b])})}; f.destroy=function(b,a,c){b=g(b)[0];if(b.hasInitialized){f.refreshWidgets(b,!0,!0);var d=g(b),e=b.config,r=d.find("thead:first"),k=r.find("tr."+f.css.headerRow).removeClass(f.css.headerRow+" "+e.cssHeaderRow),l=d.find("tfoot:first > tr").children("th, td");!1===a&&0<=g.inArray("uitheme",e.widgets)&&(d.trigger("applyWidgetId",["uitheme"]),d.trigger("applyWidgetId",["zebra"]));r.find("tr").not(k).remove();d.removeData("tablesorter").unbind("sortReset update updateAll updateRows updateCell addRows updateComplete sorton appendCache updateCache applyWidgetId applyWidgets refreshWidgets destroy mouseup mouseleave keypress sortBegin sortEnd resetToLoadState ".split(" ").join(e.namespace+ " "));e.$headers.add(l).removeClass([f.css.header,e.cssHeader,e.cssAsc,e.cssDesc,f.css.sortAsc,f.css.sortDesc,f.css.sortNone].join(" ")).removeAttr("data-column").removeAttr("aria-label").attr("aria-disabled","true");k.find(e.selectorSort).unbind(["mousedown","mouseup","keypress",""].join(e.namespace+" "));f.restoreHeaders(b);d.toggleClass(f.css.table+" "+e.tableClass+" tablesorter-"+e.theme,!1===a);b.hasInitialized=!1;delete b.config.cache;"function"===typeof c&&c(b)}};f.regex={chunk:/(^([+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)?$|^0x[0-9a-f]+$|\d+)/gi, chunks:/(^\\0|\\0$)/,hex:/^0x[0-9a-f]+$/i};f.sortNatural=function(b,a){if(b===a)return 0;var c,d,e,g,k,l;d=f.regex;if(d.hex.test(a)){c=parseInt(b.match(d.hex),16);e=parseInt(a.match(d.hex),16);if(c<e)return-1;if(c>e)return 1}c=b.replace(d.chunk,"\\0$1\\0").replace(d.chunks,"").split("\\0");d=a.replace(d.chunk,"\\0$1\\0").replace(d.chunks,"").split("\\0");l=Math.max(c.length,d.length);for(k=0;k<l;k++){e=isNaN(c[k])?c[k]||0:parseFloat(c[k])||0;g=isNaN(d[k])?d[k]||0:parseFloat(d[k])||0;if(isNaN(e)!== isNaN(g))return isNaN(e)?1:-1;typeof e!==typeof g&&(e+="",g+="");if(e<g)return-1;if(e>g)return 1}return 0};f.sortNaturalAsc=function(b,a,c,d,e){if(b===a)return 0;c=e.string[e.empties[c]||e.emptyTo];return""===b&&0!==c?"boolean"===typeof c?c?-1:1:-c||-1:""===a&&0!==c?"boolean"===typeof c?c?1:-1:c||1:f.sortNatural(b,a)};f.sortNaturalDesc=function(b,a,c,d,e){if(b===a)return 0;c=e.string[e.empties[c]||e.emptyTo];return""===b&&0!==c?"boolean"===typeof c?c?-1:1:c||1:""===a&&0!==c?"boolean"===typeof c?c? 1:-1:-c||-1:f.sortNatural(a,b)};f.sortText=function(b,a){return b>a?1:b<a?-1:0};f.getTextValue=function(b,a,c){if(c){var d=b?b.length:0,e=c+a;for(c=0;c<d;c++)e+=b.charCodeAt(c);return a*e}return 0};f.sortNumericAsc=function(b,a,c,d,e,g){if(b===a)return 0;g=g.config;e=g.string[g.empties[e]||g.emptyTo];if(""===b&&0!==e)return"boolean"===typeof e?e?-1:1:-e||-1;if(""===a&&0!==e)return"boolean"===typeof e?e?1:-1:e||1;isNaN(b)&&(b=f.getTextValue(b,c,d));isNaN(a)&&(a=f.getTextValue(a,c,d));return b-a};f.sortNumericDesc= function(b,a,c,d,e,g){if(b===a)return 0;g=g.config;e=g.string[g.empties[e]||g.emptyTo];if(""===b&&0!==e)return"boolean"===typeof e?e?-1:1:e||1;if(""===a&&0!==e)return"boolean"===typeof e?e?1:-1:-e||-1;isNaN(b)&&(b=f.getTextValue(b,c,d));isNaN(a)&&(a=f.getTextValue(a,c,d));return a-b};f.sortNumeric=function(b,a){return b-a};f.characterEquivalents={a:"\u00e1\u00e0\u00e2\u00e3\u00e4\u0105\u00e5",A:"\u00c1\u00c0\u00c2\u00c3\u00c4\u0104\u00c5",c:"\u00e7\u0107\u010d",C:"\u00c7\u0106\u010c",e:"\u00e9\u00e8\u00ea\u00eb\u011b\u0119", E:"\u00c9\u00c8\u00ca\u00cb\u011a\u0118",i:"\u00ed\u00ec\u0130\u00ee\u00ef\u0131",I:"\u00cd\u00cc\u0130\u00ce\u00cf",o:"\u00f3\u00f2\u00f4\u00f5\u00f6",O:"\u00d3\u00d2\u00d4\u00d5\u00d6",ss:"\u00df",SS:"\u1e9e",u:"\u00fa\u00f9\u00fb\u00fc\u016f",U:"\u00da\u00d9\u00db\u00dc\u016e"};f.replaceAccents=function(b){var a,c="[",d=f.characterEquivalents;if(!f.characterRegex){f.characterRegexArray={};for(a in d)"string"===typeof a&&(c+=d[a],f.characterRegexArray[a]=new RegExp("["+d[a]+"]","g"));f.characterRegex= new RegExp(c+"]")}if(f.characterRegex.test(b))for(a in d)"string"===typeof a&&(b=b.replace(f.characterRegexArray[a],a));return b};f.isValueInArray=function(b,a){var c,d=a.length;for(c=0;c<d;c++)if(a[c][0]===b)return c;return-1};f.addParser=function(b){var a,c=f.parsers.length,d=!0;for(a=0;a<c;a++)f.parsers[a].id.toLowerCase()===b.id.toLowerCase()&&(d=!1);d&&f.parsers.push(b)};f.getParserById=function(b){if("false"==b)return!1;var a,c=f.parsers.length;for(a=0;a<c;a++)if(f.parsers[a].id.toLowerCase()=== b.toString().toLowerCase())return f.parsers[a];return!1};f.addWidget=function(b){f.widgets.push(b)};f.hasWidget=function(b,a){b=g(b);return b.length&&b[0].config&&b[0].config.widgetInit[a]||!1};f.getWidgetById=function(b){var a,c,d=f.widgets.length;for(a=0;a<d;a++)if((c=f.widgets[a])&&c.hasOwnProperty("id")&&c.id.toLowerCase()===b.toLowerCase())return c};f.applyWidget=function(b,a){b=g(b)[0];var c=b.config,d=c.widgetOptions,e=[],p,k,l;!1!==a&&b.hasInitialized&&(b.isApplyingWidgets||b.isUpdating)|| (c.debug&&(p=new Date),c.widgets.length&&(b.isApplyingWidgets=!0,c.widgets=g.grep(c.widgets,function(a,b){return g.inArray(a,c.widgets)===b}),g.each(c.widgets||[],function(a,b){(l=f.getWidgetById(b))&&l.id&&(l.priority||(l.priority=10),e[a]=l)}),e.sort(function(a,b){return a.priority<b.priority?-1:a.priority===b.priority?0:1}),g.each(e,function(e,f){if(f){if(a||!c.widgetInit[f.id])c.widgetInit[f.id]=!0,f.hasOwnProperty("options")&&(d=b.config.widgetOptions=g.extend(!0,{},f.options,d)),f.hasOwnProperty("init")&& f.init(b,f,c,d);!a&&f.hasOwnProperty("format")&&f.format(b,c,d,!1)}})),setTimeout(function(){b.isApplyingWidgets=!1},0),c.debug&&(k=c.widgets.length,v("Completed "+(!0===a?"initializing ":"applying ")+k+" widget"+(1!==k?"s":""),p)))};f.refreshWidgets=function(b,a,c){b=g(b)[0];var h,e=b.config,p=e.widgets,k=f.widgets,l=k.length;for(h=0;h<l;h++)k[h]&&k[h].id&&(a||0>g.inArray(k[h].id,p))&&(e.debug&&d('Refeshing widgets: Removing "'+k[h].id+'"'),k[h].hasOwnProperty("remove")&&e.widgetInit[k[h].id]&&(k[h].remove(b, e,e.widgetOptions),e.widgetInit[k[h].id]=!1));!0!==c&&f.applyWidget(b,a)};f.getData=function(b,a,c){var d="";b=g(b);var e,f;if(!b.length)return"";e=g.metadata?b.metadata():!1;f=" "+(b.attr("class")||"");"undefined"!==typeof b.data(c)||"undefined"!==typeof b.data(c.toLowerCase())?d+=b.data(c)||b.data(c.toLowerCase()):e&&"undefined"!==typeof e[c]?d+=e[c]:a&&"undefined"!==typeof a[c]?d+=a[c]:" "!==f&&f.match(" "+c+"-")&&(d=f.match(new RegExp("\\s"+c+"-([\\w-]+)"))[1]||"");return g.trim(d)};f.formatFloat= function(b,a){if("string"!==typeof b||""===b)return b;var c;b=(a&&a.config?!1!==a.config.usNumberFormat:"undefined"!==typeof a?a:1)?b.replace(/,/g,""):b.replace(/[\s|\.]/g,"").replace(/,/g,".");/^\s*\([.\d]+\)/.test(b)&&(b=b.replace(/^\s*\(([.\d]+)\)/,"-$1"));c=parseFloat(b);return isNaN(c)?g.trim(b):c};f.isDigit=function(b){return isNaN(b)?/^[\-+(]?\d+[)]?$/.test(b.toString().replace(/[,.'"\s]/g,"")):!0}}});var n=g.tablesorter;g.fn.extend({tablesorter:n.construct});n.addParser({id:"no-parser",is:function(){return!1}, format:function(){return""},type:"text"});n.addParser({id:"text",is:function(){return!0},format:function(d,v){var p=v.config;d&&(d=g.trim(p.ignoreCase?d.toLocaleLowerCase():d),d=p.sortLocaleCompare?n.replaceAccents(d):d);return d},type:"text"});n.addParser({id:"digit",is:function(d){return n.isDigit(d)},format:function(d,v){var p=n.formatFloat((d||"").replace(/[^\w,. \-()]/g,""),v);return d&&"number"===typeof p?p:d?g.trim(d&&v.config.ignoreCase?d.toLocaleLowerCase():d):d},type:"numeric"});n.addParser({id:"currency", is:function(d){return/^\(?\d+[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]|[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]\d+\)?$/.test((d||"").replace(/[+\-,. ]/g,""))},format:function(d,v){var p=n.formatFloat((d||"").replace(/[^\w,. \-()]/g,""),v);return d&&"number"===typeof p?p:d?g.trim(d&&v.config.ignoreCase?d.toLocaleLowerCase():d):d},type:"numeric"});n.addParser({id:"ipAddress",is:function(d){return/^\d{1,3}[\.]\d{1,3}[\.]\d{1,3}[\.]\d{1,3}$/.test(d)},format:function(d,g){var p,w=d?d.split("."):"",t="",x=w.length; for(p=0;p<x;p++)t+=("00"+w[p]).slice(-3);return d?n.formatFloat(t,g):d},type:"numeric"});n.addParser({id:"url",is:function(d){return/^(https?|ftp|file):\/\//.test(d)},format:function(d){return d?g.trim(d.replace(/(https?|ftp|file):\/\//,"")):d},type:"text"});n.addParser({id:"isoDate",is:function(d){return/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(d)},format:function(d,g){return d?n.formatFloat(""!==d?(new Date(d.replace(/-/g,"/"))).getTime()||d:"",g):d},type:"numeric"});n.addParser({id:"percent",is:function(d){return/(\d\s*?%|%\s*?\d)/.test(d)&& 15>d.length},format:function(d,g){return d?n.formatFloat(d.replace(/%/g,""),g):d},type:"numeric"});n.addParser({id:"usLongDate",is:function(d){return/^[A-Z]{3,10}\.?\s+\d{1,2},?\s+(\d{4})(\s+\d{1,2}:\d{2}(:\d{2})?(\s+[AP]M)?)?$/i.test(d)||/^\d{1,2}\s+[A-Z]{3,10}\s+\d{4}/i.test(d)},format:function(d,g){return d?n.formatFloat((new Date(d.replace(/(\S)([AP]M)$/i,"$1 $2"))).getTime()||d,g):d},type:"numeric"});n.addParser({id:"shortDate",is:function(d){return/(^\d{1,2}[\/\s]\d{1,2}[\/\s]\d{4})|(^\d{4}[\/\s]\d{1,2}[\/\s]\d{1,2})/.test((d|| "").replace(/\s+/g," ").replace(/[\-.,]/g,"/"))},format:function(d,g,p,w){if(d){p=g.config;var t=p.$headers.filter("[data-column="+w+"]:last");w=t.length&&t[0].dateFormat||n.getData(t,n.getColumnData(g,p.headers,w),"dateFormat")||p.dateFormat;d=d.replace(/\s+/g," ").replace(/[\-.,]/g,"/");"mmddyyyy"===w?d=d.replace(/(\d{1,2})[\/\s](\d{1,2})[\/\s](\d{4})/,"$3/$1/$2"):"ddmmyyyy"===w?d=d.replace(/(\d{1,2})[\/\s](\d{1,2})[\/\s](\d{4})/,"$3/$2/$1"):"yyyymmdd"===w&&(d=d.replace(/(\d{4})[\/\s](\d{1,2})[\/\s](\d{1,2})/, "$1/$2/$3"))}return d?n.formatFloat((new Date(d)).getTime()||d,g):d},type:"numeric"});n.addParser({id:"time",is:function(d){return/^(([0-2]?\d:[0-5]\d)|([0-1]?\d:[0-5]\d\s?([AP]M)))$/i.test(d)},format:function(d,g){return d?n.formatFloat((new Date("2000/01/01 "+d.replace(/(\S)([AP]M)$/i,"$1 $2"))).getTime()||d,g):d},type:"numeric"});n.addParser({id:"metadata",is:function(){return!1},format:function(d,n,p){d=n.config;d=d.parserMetadataName?d.parserMetadataName:"sortValue";return g(p).metadata()[d]}, type:"numeric"});n.addWidget({id:"zebra",priority:90,format:function(d,v,p){var w,t,x,z,C,D,E=new RegExp(v.cssChildRow,"i"),B=v.$tbodies;v.debug&&(C=new Date);for(d=0;d<B.length;d++)w=B.eq(d),D=w.children("tr").length,1<D&&(x=0,w=w.children("tr:visible").not(v.selectorRemove),w.each(function(){t=g(this);E.test(this.className)||x++;z=0===x%2;t.removeClass(p.zebra[z?1:0]).addClass(p.zebra[z?0:1])}));v.debug&&n.benchmark("Applying Zebra widget",C)},remove:function(d,n,p){var w;n=n.$tbodies;var t=(p.zebra|| ["even","odd"]).join(" ");for(p=0;p<n.length;p++)w=g.tablesorter.processTbody(d,n.eq(p),!0),w.children().removeClass(t),g.tablesorter.processTbody(d,w,!1)}})}(jQuery);


/*
 * 
 * jacwright/date.format
 * https://github.com/jacwright/date.format
 * 
 */
(function() {
    
    Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    Date.longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    Date.shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    Date.longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // defining patterns
    var replaceChars = {
        // Day
        d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
        D: function() { return Date.shortDays[this.getDay()]; },
        j: function() { return this.getDate(); },
        l: function() { return Date.longDays[this.getDay()]; },
        N: function() { return this.getDay() + 1; },
        S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
        w: function() { return this.getDay(); },
        z: function() { var d = new Date(this.getFullYear(),0,1); return Math.ceil((this - d) / 86400000); }, // Fixed now
        // Week
        W: function() { var d = new Date(this.getFullYear(), 0, 1); return Math.ceil((((this - d) / 86400000) + d.getDay() + 1) / 7); }, // Fixed now
        // Month
        F: function() { return Date.longMonths[this.getMonth()]; },
        m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
        M: function() { return Date.shortMonths[this.getMonth()]; },
        n: function() { return this.getMonth() + 1; },
        t: function() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0).getDate() }, // Fixed now, gets #days of date
        // Year
        L: function() { var year = this.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)); },   // Fixed now
        o: function() { var d  = new Date(this.valueOf());  d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
        Y: function() { return this.getFullYear(); },
        y: function() { return ('' + this.getFullYear()).substr(2); },
        // Time
        a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
        A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
        B: function() { return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24); }, // Fixed now
        g: function() { return this.getHours() % 12 || 12; },
        G: function() { return this.getHours(); },
        h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
        H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
        i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
        s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
        u: function() { var m = this.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ?
    '0' : '')) + m; },
        // Timezone
        e: function() { return "Not Yet Supported"; },
        I: function() {
            var DST = null;
                for (var i = 0; i < 12; ++i) {
                        var d = new Date(this.getFullYear(), i, 1);
                        var offset = d.getTimezoneOffset();
    
                        if (DST === null) DST = offset;
                        else if (offset < DST) { DST = offset; break; }                     else if (offset > DST) break;
                }
                return (this.getTimezoneOffset() == DST) | 0;
            },
        O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
        P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00'; }, // Fixed now
        T: function() { return this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); },
        Z: function() { return -this.getTimezoneOffset() * 60; },
        // Full Date/Time
        c: function() { return this.format("Y-m-d\\TH:i:sP"); }, // Fixed now
        r: function() { return this.toString(); },
        U: function() { return this.getTime() / 1000; }
    };

    // Simulates PHP's date function
    Date.prototype.format = function(format) {
        var date = this;
        return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
            return (esc === '' && replaceChars[chr]) ? replaceChars[chr].call(date) : chr;
        });
    };

}).call(this);