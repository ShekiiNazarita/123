define(['browser', 'dom', 'layoutManager', 'css!components/viewManager/viewContainer'], function (browser, dom, layoutManager) {
    'use strict';

    /**
     * @param view
     * @param options
     */
    function setControllerClass (view, options) {
        if (options.controllerFactory) {
            return Promise.resolve();
        }

        var controllerUrl = view.getAttribute('data-controller');

        if (controllerUrl) {
            if (controllerUrl.indexOf('__plugin/') === 0) {
                controllerUrl = controllerUrl.substring('__plugin/'.length);
            }

            controllerUrl = Dashboard.getConfigurationResourceUrl(controllerUrl);
            return getRequirePromise([controllerUrl]).then(function (ControllerFactory) {
                options.controllerFactory = ControllerFactory;
            });
        }

        return Promise.resolve();
    }

    /**
     * @param deps
     */
    function getRequirePromise (deps) {
        return new Promise(function (resolve, reject) {
            require(deps, resolve);
        });
    }

    /**
     * @param options
     */
    function loadView (options) {
        if (!options.cancel) {
            var selected = selectedPageIndex;
            var previousAnimatable = selected === -1 ? null : allPages[selected];
            var pageIndex = selected + 1;

            if (pageIndex >= pageContainerCount) {
                pageIndex = 0;
            }

            var isPluginpage = options.url.toLowerCase().indexOf('/configurationpage') !== -1;
            var newViewInfo = normalizeNewView(options, isPluginpage);
            var newView = newViewInfo.elem;

            if (isPluginpage) {
                require(['legacyDashboard']);
            }

            if (newViewInfo.hasjQuerySelect) {
                require(['legacySelectMenu']);
            }

            if (newViewInfo.hasjQueryChecked) {
                require(['fnchecked']);
            }

            return new Promise(function (resolve) {
                var currentPage = allPages[pageIndex];

                if (currentPage) {
                    triggerDestroy(currentPage);
                }

                var view = newView;

                if (typeof view === 'string') {
                    view = document.createElement('div');
                    view.innerHTML = newView;
                }

                view.classList.add('mainAnimatedPage');

                if (currentPage) {
                    if (newViewInfo.hasScript && window.$) {
                        view = $(view).appendTo(mainAnimatedPages)[0];
                        mainAnimatedPages.removeChild(currentPage);
                    } else {
                        mainAnimatedPages.replaceChild(view, currentPage);
                    }
                } else {
                    if (newViewInfo.hasScript && window.$) {
                        view = $(view).appendTo(mainAnimatedPages)[0];
                    } else {
                        mainAnimatedPages.appendChild(view);
                    }
                }

                if (options.type) {
                    view.setAttribute('data-type', options.type);
                }

                var properties = [];

                if (options.fullscreen) {
                    properties.push('fullscreen');
                }

                if (properties.length) {
                    view.setAttribute('data-properties', properties.join(','));
                }

                allPages[pageIndex] = view;
                setControllerClass(view, options).then(function () {
                    if (onBeforeChange) {
                        onBeforeChange(view, false, options);
                    }

                    beforeAnimate(allPages, pageIndex, selected);
                    selectedPageIndex = pageIndex;
                    currentUrls[pageIndex] = options.url;

                    if (!options.cancel && previousAnimatable) {
                        afterAnimate(allPages, pageIndex);
                    }

                    if (window.$) {
                        $.mobile = $.mobile || {};
                        $.mobile.activePage = view;
                    }

                    resolve(view);
                });
            });
        }
    }

    /**
     * @param str
     * @param find
     * @param replace
     */
    function replaceAll (str, find, replace) {
        return str.split(find).join(replace);
    }

    /**
     * @param html
     * @param hasScript
     */
    function parseHtml (html, hasScript) {
        if (hasScript) {
            html = replaceAll(html, '\x3c!--<script', '<script');
            html = replaceAll(html, '<\/script>--\x3e', '<\/script>');
        }

        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        return wrapper.querySelector('div[data-role="page"]');
    }

    /**
     * @param options
     * @param isPluginpage
     */
    function normalizeNewView (options, isPluginpage) {
        var viewHtml = options.view;

        if (viewHtml.indexOf('data-role="page"') === -1) {
            return viewHtml;
        }

        var hasScript = viewHtml.indexOf('<script') !== -1;
        var elem = parseHtml(viewHtml, hasScript);

        if (hasScript) {
            hasScript = elem.querySelector('script') != null;
        }

        var hasjQuery = false;
        var hasjQuerySelect = false;
        var hasjQueryChecked = false;

        if (isPluginpage) {
            hasjQuery = viewHtml.indexOf('jQuery') != -1 || viewHtml.indexOf('$(') != -1 || viewHtml.indexOf('$.') != -1;
            hasjQueryChecked = viewHtml.indexOf('.checked(') != -1;
            hasjQuerySelect = viewHtml.indexOf('.selectmenu(') != -1;
        }

        return {
            elem: elem,
            hasScript: hasScript,
            hasjQuerySelect: hasjQuerySelect,
            hasjQueryChecked: hasjQueryChecked,
            hasjQuery: hasjQuery
        };
    }

    /**
     * @param allPages
     * @param newPageIndex
     * @param oldPageIndex
     */
    function beforeAnimate (allPages, newPageIndex, oldPageIndex) {
        for (var index = 0, length = allPages.length; index < length; index++) {
            if (newPageIndex !== index && oldPageIndex !== index) {
                allPages[index].classList.add('hide');
            }
        }
    }

    /**
     * @param allPages
     * @param newPageIndex
     */
    function afterAnimate (allPages, newPageIndex) {
        for (var index = 0, length = allPages.length; index < length; index++) {
            if (newPageIndex !== index) {
                allPages[index].classList.add('hide');
            }
        }
    }

    /**
     * @param fn
     */
    function setOnBeforeChange (fn) {
        onBeforeChange = fn;
    }

    /**
     * @param options
     */
    function tryRestoreView (options) {
        var url = options.url;
        var index = currentUrls.indexOf(url);

        if (index !== -1) {
            var animatable = allPages[index];
            var view = animatable;

            if (view) {
                if (options.cancel) {
                    return;
                }

                var selected = selectedPageIndex;
                var previousAnimatable = selected === -1 ? null : allPages[selected];
                return setControllerClass(view, options).then(function () {
                    if (onBeforeChange) {
                        onBeforeChange(view, true, options);
                    }

                    beforeAnimate(allPages, index, selected);
                    animatable.classList.remove('hide');
                    selectedPageIndex = index;

                    if (!options.cancel && previousAnimatable) {
                        afterAnimate(allPages, index);
                    }

                    if (window.$) {
                        $.mobile = $.mobile || {};
                        $.mobile.activePage = view;
                    }

                    return view;
                });
            }
        }

        return Promise.reject();
    }

    /**
     * @param view
     */
    function triggerDestroy (view) {
        view.dispatchEvent(new CustomEvent('viewdestroy', {}));
    }

    /**
     *
     */
    function reset () {
        allPages = [];
        currentUrls = [];
        mainAnimatedPages.innerHTML = '';
        selectedPageIndex = -1;
    }

    var onBeforeChange;
    var mainAnimatedPages = document.querySelector('.mainAnimatedPages');
    var allPages = [];
    var currentUrls = [];
    var pageContainerCount = 3;
    var selectedPageIndex = -1;
    reset();
    mainAnimatedPages.classList.remove('hide');
    return {
        loadView: loadView,
        tryRestoreView: tryRestoreView,
        reset: reset,
        setOnBeforeChange: setOnBeforeChange
    };
});
