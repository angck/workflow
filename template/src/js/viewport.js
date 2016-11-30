(function(win, lib) {
    var doc = window.document;
    var docEl = doc.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var flexibleEl = doc.querySelector('meta[name="flexible"]');
    var dpr = 0;
    var scale = 0;
    var tid;
    var flexible = lib.flexible || (lib.flexiable = {});

    if(metaEl) {
        console.warn('将根据已有的meta标签来设置缩放比例');
        var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
        if(match) {
            scale = parseFloat(match[1]);
            dpr = parseInt(1/scale);
        }
    } else if(flexibleEl) {
        var content = flexibleEl.getAttribute('content');
        if(content) {
            var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
            var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);

            if(initialDpr) {
                dpr = parseFloat(initialDpr[1]);
                scale = parseInt(1/dpr);
            }

            if(maximumDpr) {
                dpr = parseFloat(maximumDpr[1]);
                scale = parseInt(1/dpr);
            }
        }
    }

    if(!dpr && !scale) {
        var isAndroid = win.navigator.appVersion.match(/android/gi);
        var isIPhone = win.navigator.appVersion.match(/iphone/gi);
        var devicePixelRatio = win.devicePixelRatio;

        if(isIPhone || isAndroid) {
            if(devicePixelRatio >= 3) {
                dpr = 3;
            } else if(devicePixelRatio >=2) {
                dpr = 2;
            } else {
                dpr = 1;
            }
        }
    }

    docEl.setAttribute('data-dpr', dpr);

    if(!metaEl) {
        metaEl = doc.createElement('meta');
        metaEl.setAttribute('name', 'viewport');
        metaEl.setAttribute('content', 'initial-scale='+ scale +', maximum-scale='+ scale +', minimum-scale='+ scale +', user-scalable=no');
        if(docEl.firstElementChild) {
            docEl.firstElementChild.appendChild(metaEl);
        } else {
            var wrap = doc.createElement('div');
            wrap.appendChild(metaEl);
            doc.write(wrap.innerHTML);
        }
    }

    function refreshRem() {
        var width = docEl.getBoundingClientRect().width;
        
        if(width / dpr > 540) {
            width = 540 * dpr;
        }
        
        var rem = width / 10;
        docEl.style.fontSize = rem + 'px';
        flexible.rem = win.rem = rem;
    }

    win.addEventListener('resize', function() {
        clearTimeout(tid);
        // 节流
        tid = setTimeout(refreshRem, 300);
    }, false);

    win.addEventListener('pageshow', function(e) {
        // persisted 检测页面是否存在往返缓存（back-forward cache或bfcache）中
        if(e.persisted) {
            clearTimeout(tid);
            tid = setTimeout(refreshRem, 300);
        }
    }, false);

    if(doc.readyState === 'complete') {
        doc.body.style.fontSize = 12 * dpr + 'px';
    } else {
        doc.addEventListener('DOMContentLoaded', function() {
            doc.body.style.fontSize = 12 * dpr + 'px';
        }, false);
    }

    refreshRem();

    flexible.dpr = window.dpr = dpr;
    flexible.refreshRem = refreshRem;
    flexible.rem2px = function(d) {
        var val = parseFloat(d) * this.rem;
        if(typeof d === 'string' && d.match(/rem$/)) {
            val += 'px';
        }
        return val;
    };
    flexible.px2rem = function(d) {
        var val = parseFloat(d) / this.rem;
        if(typeof d === 'string' && d.match(/px$/)) {
            val += 'rem';
        }
        return val;
    };
})(window, window['lib'] || (window['lib'] = {}));