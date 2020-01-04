define(['tabbedView', 'globalize', 'require', 'emby-tabs', 'emby-button', 'emby-scroller'], function (TabbedView, globalize, require) {
    'use strict';

    /**
     *
     */
    function getTabs () {
        return [{
            name: globalize.translate('Home')
        }, {
            name: globalize.translate('Favorites')
        }];
    }

    /**
     *
     */
    function getDefaultTabIndex () {
        return 0;
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
     * @param index
     */
    function getTabController (index) {
        if (index == null) {
            throw new Error('index cannot be null');
        }

        var depends = [];

        switch (index) {
        case 0:
            depends.push('controllers/hometab');
            break;

        case 1:
            depends.push('controllers/favorites');
        }

        var instance = this;
        return getRequirePromise(depends).then(function (controllerFactory) {
            var controller = instance.tabControllers[index];

            if (!controller) {
                controller = new controllerFactory(instance.view.querySelector(".tabContent[data-index='" + index + "']"), instance.params);
                instance.tabControllers[index] = controller;
            }

            return controller;
        });
    }

    /**
     * @param view
     * @param params
     */
    function HomeView (view, params) {
        TabbedView.call(this, view, params);
    }

    Object.assign(HomeView.prototype, TabbedView.prototype);
    HomeView.prototype.getTabs = getTabs;
    HomeView.prototype.getDefaultTabIndex = getDefaultTabIndex;
    HomeView.prototype.getTabController = getTabController;

    HomeView.prototype.setTitle = function () {
        Emby.Page.setTitle(null);
    };

    HomeView.prototype.onPause = function () {
        TabbedView.prototype.onPause.call(this);
        document.querySelector('.skinHeader').classList.remove('noHomeButtonHeader');
    };

    HomeView.prototype.onResume = function (options) {
        TabbedView.prototype.onResume.call(this, options);
        document.querySelector('.skinHeader').classList.add('noHomeButtonHeader');
    };

    return HomeView;
});
