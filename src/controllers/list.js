define(['globalize', 'listView', 'layoutManager', 'userSettings', 'focusManager', 'cardBuilder', 'loading', 'connectionManager', 'alphaNumericShortcuts', 'scroller', 'playbackManager', 'alphaPicker', 'emby-itemscontainer', 'emby-scroller'], function (globalize, listView, layoutManager, userSettings, focusManager, cardBuilder, loading, connectionManager, AlphaNumericShortcuts, scroller, playbackManager, alphaPicker) {
    'use strict';

    /**
     * @param instance
     * @param params
     */
    function getInitialLiveTvQuery (instance, params) {
        var query = {
            UserId: connectionManager.getApiClient(params.serverId).getCurrentUserId(),
            StartIndex: 0,
            Fields: 'ChannelInfo,PrimaryImageAspectRatio',
            Limit: 300
        };

        if (params.type === 'Recordings') {
            query.IsInProgress = false;
        } else {
            query.HasAired = false;
        }

        if (params.genreId) {
            query.GenreIds = params.genreId;
        }

        if (params.IsMovie === 'true') {
            query.IsMovie = true;
        } else if (params.IsMovie === 'false') {
            query.IsMovie = false;
        }

        if (params.IsSeries === 'true') {
            query.IsSeries = true;
        } else if (params.IsSeries === 'false') {
            query.IsSeries = false;
        }

        if (params.IsNews === 'true') {
            query.IsNews = true;
        } else if (params.IsNews === 'false') {
            query.IsNews = false;
        }

        if (params.IsSports === 'true') {
            query.IsSports = true;
        } else if (params.IsSports === 'false') {
            query.IsSports = false;
        }

        if (params.IsKids === 'true') {
            query.IsKids = true;
        } else if (params.IsKids === 'false') {
            query.IsKids = false;
        }

        if (params.IsAiring === 'true') {
            query.IsAiring = true;
        } else if (params.IsAiring === 'false') {
            query.IsAiring = false;
        }

        return modifyQueryWithFilters(instance, query);
    }

    /**
     * @param instance
     * @param query
     */
    function modifyQueryWithFilters (instance, query) {
        var sortValues = instance.getSortValues();

        if (!query.SortBy) {
            query.SortBy = sortValues.sortBy;
            query.SortOrder = sortValues.sortOrder;
        }

        query.Fields = query.Fields ? query.Fields + ',PrimaryImageAspectRatio' : 'PrimaryImageAspectRatio';
        query.ImageTypeLimit = 1;
        var hasFilters;
        var queryFilters = [];
        var filters = instance.getFilters();

        if (filters.IsPlayed) {
            queryFilters.push('IsPlayed');
            hasFilters = true;
        }

        if (filters.IsUnplayed) {
            queryFilters.push('IsUnplayed');
            hasFilters = true;
        }

        if (filters.IsFavorite) {
            queryFilters.push('IsFavorite');
            hasFilters = true;
        }

        if (filters.IsResumable) {
            queryFilters.push('IsResumable');
            hasFilters = true;
        }

        if (filters.VideoTypes) {
            hasFilters = true;
            query.VideoTypes = filters.VideoTypes;
        }

        if (filters.GenreIds) {
            hasFilters = true;
            query.GenreIds = filters.GenreIds;
        }

        if (filters.Is4K) {
            query.Is4K = true;
            hasFilters = true;
        }

        if (filters.IsHD) {
            query.IsHD = true;
            hasFilters = true;
        }

        if (filters.IsSD) {
            query.IsHD = false;
            hasFilters = true;
        }

        if (filters.Is3D) {
            query.Is3D = true;
            hasFilters = true;
        }

        if (filters.HasSubtitles) {
            query.HasSubtitles = true;
            hasFilters = true;
        }

        if (filters.HasTrailer) {
            query.HasTrailer = true;
            hasFilters = true;
        }

        if (filters.HasSpecialFeature) {
            query.HasSpecialFeature = true;
            hasFilters = true;
        }

        if (filters.HasThemeSong) {
            query.HasThemeSong = true;
            hasFilters = true;
        }

        if (filters.HasThemeVideo) {
            query.HasThemeVideo = true;
            hasFilters = true;
        }

        query.Filters = queryFilters.length ? queryFilters.join(',') : null;
        instance.setFilterStatus(hasFilters);

        if (instance.alphaPicker) {
            query.NameStartsWithOrGreater = instance.alphaPicker.value();
        }

        return query;
    }

    /**
     * @param instance
     */
    function updateSortText (instance) {
        var btnSortText = instance.btnSortText;

        if (btnSortText) {
            var options = instance.getSortMenuOptions();
            var values = instance.getSortValues();
            var sortBy = values.sortBy;

            for (var i = 0, length = options.length; i < length; i++) {
                if (sortBy === options[i].value) {
                    btnSortText.innerHTML = globalize.translate('SortByValue', options[i].name);
                    break;
                }
            }

            var btnSortIcon = instance.btnSortIcon;

            if (btnSortIcon) {
                btnSortIcon.innerHTML = values.sortOrder === 'Descending' ? 'arrow_downward' : 'arrow_upward';
            }
        }
    }

    /**
     * @param instance
     */
    function updateItemsContainerForViewType (instance) {
        if (instance.getViewSettings().imageType === 'list') {
            instance.itemsContainer.classList.remove('vertical-wrap');
            instance.itemsContainer.classList.add('vertical-list');
        } else {
            instance.itemsContainer.classList.add('vertical-wrap');
            instance.itemsContainer.classList.remove('vertical-list');
        }
    }

    /**
     * @param instance
     * @param numItems
     */
    function updateAlphaPickerState (instance, numItems) {
        if (instance.alphaPicker) {
            var alphaPicker = instance.alphaPickerElement;

            if (alphaPicker) {
                var values = instance.getSortValues();

                if (numItems == null) {
                    numItems = 100;
                }

                if (values.sortBy === 'SortName' && values.sortOrder === 'Ascending' && numItems > 40) {
                    alphaPicker.classList.remove('hide');

                    if (layoutManager.tv) {
                        instance.itemsContainer.parentNode.classList.add('padded-left-withalphapicker');
                    } else {
                        instance.itemsContainer.parentNode.classList.add('padded-right-withalphapicker');
                    }
                } else {
                    alphaPicker.classList.add('hide');
                    instance.itemsContainer.parentNode.classList.remove('padded-left-withalphapicker');
                    instance.itemsContainer.parentNode.classList.remove('padded-right-withalphapicker');
                }
            }
        }
    }

    /**
     * @param instance
     * @param params
     * @param item
     * @param sortBy
     * @param startIndex
     * @param limit
     */
    function getItems (instance, params, item, sortBy, startIndex, limit) {
        var apiClient = connectionManager.getApiClient(params.serverId);

        instance.queryRecursive = false;
        if (params.type === 'Recordings') {
            return apiClient.getLiveTvRecordings(getInitialLiveTvQuery(instance, params));
        }

        if (params.type === 'Programs') {
            if (params.IsAiring === 'true') {
                return apiClient.getLiveTvRecommendedPrograms(getInitialLiveTvQuery(instance, params));
            }

            return apiClient.getLiveTvPrograms(getInitialLiveTvQuery(instance, params));
        }

        if (params.type === 'nextup') {
            return apiClient.getNextUpEpisodes(modifyQueryWithFilters(instance, {
                Limit: limit,
                Fields: 'PrimaryImageAspectRatio,SeriesInfo,DateCreated,BasicSyncInfo',
                UserId: apiClient.getCurrentUserId(),
                ImageTypeLimit: 1,
                EnableImageTypes: 'Primary,Backdrop,Thumb',
                EnableTotalRecordCount: false,
                SortBy: sortBy
            }));
        }

        if (!item) {
            instance.queryRecursive = true;
            var method = 'getItems';

            if (params.type === 'MusicArtist') {
                method = 'getArtists';
            } else if (params.type === 'Person') {
                method = 'getPeople';
            }

            return apiClient[method](apiClient.getCurrentUserId(), modifyQueryWithFilters(instance, {
                StartIndex: startIndex,
                Limit: limit,
                Fields: 'PrimaryImageAspectRatio,SortName',
                ImageTypeLimit: 1,
                IncludeItemTypes: params.type === 'MusicArtist' || params.type === 'Person' ? null : params.type,
                Recursive: true,
                IsFavorite: params.IsFavorite === 'true' || null,
                ArtistIds: params.artistId || null,
                SortBy: sortBy
            }));
        }

        if (item.Type === 'Genre' || item.Type === 'MusicGenre' || item.Type === 'Studio' || item.Type === 'Person') {
            instance.queryRecursive = true;
            var query = {
                StartIndex: startIndex,
                Limit: limit,
                Fields: 'PrimaryImageAspectRatio,SortName',
                Recursive: true,
                parentId: params.parentId,
                SortBy: sortBy
            };

            if (item.Type === 'Studio') {
                query.StudioIds = item.Id;
            } else if (item.Type === 'Genre' || item.Type === 'MusicGenre') {
                query.GenreIds = item.Id;
            } else if (item.Type === 'Person') {
                query.PersonIds = item.Id;
            }

            if (item.Type === 'MusicGenre') {
                query.IncludeItemTypes = 'MusicAlbum';
            } else if (item.Type === 'GameGenre') {
                query.IncludeItemTypes = 'Game';
            } else if (item.CollectionType === 'movies') {
                query.IncludeItemTypes = 'Movie';
            } else if (item.CollectionType === 'tvshows') {
                query.IncludeItemTypes = 'Series';
            } else if (item.Type === 'Genre') {
                query.IncludeItemTypes = 'Movie,Series,Video';
            } else if (item.Type === 'Person') {
                query.IncludeItemTypes = params.type;
            }

            return apiClient.getItems(apiClient.getCurrentUserId(), modifyQueryWithFilters(instance, query));
        }

        return apiClient.getItems(apiClient.getCurrentUserId(), modifyQueryWithFilters(instance, {
            StartIndex: startIndex,
            Limit: limit,
            Fields: 'PrimaryImageAspectRatio,SortName',
            ImageTypeLimit: 1,
            ParentId: item.Id,
            SortBy: sortBy
        }));
    }

    /**
     * @param params
     */
    function getItem (params) {
        if (params.type === 'Recordings' || params.type === 'Programs' || params.type === 'nextup') {
            return Promise.resolve(null);
        }

        var apiClient = connectionManager.getApiClient(params.serverId);
        var itemId = params.genreId || params.musicGenreId || params.studioId || params.personId || params.parentId;

        if (itemId) {
            return apiClient.getItem(apiClient.getCurrentUserId(), itemId);
        }

        return Promise.resolve(null);
    }

    /**
     *
     */
    function showViewSettingsMenu () {
        var instance = this;

        require(['viewSettings'], function (ViewSettings) {
            new ViewSettings().show({
                settingsKey: instance.getSettingsKey(),
                settings: instance.getViewSettings(),
                visibleSettings: instance.getVisibleViewSettings()
            }).then(function () {
                updateItemsContainerForViewType(instance);
                instance.itemsContainer.refreshItems();
            });
        });
    }

    /**
     *
     */
    function showFilterMenu () {
        var instance = this;

        require(['filterMenu'], function (FilterMenu) {
            new FilterMenu().show({
                settingsKey: instance.getSettingsKey(),
                settings: instance.getFilters(),
                visibleSettings: instance.getVisibleFilters(),
                onChange: instance.itemsContainer.refreshItems.bind(instance.itemsContainer),
                parentId: instance.params.parentId,
                itemTypes: instance.getItemTypes(),
                serverId: instance.params.serverId,
                filterMenuOptions: instance.getFilterMenuOptions()
            }).then(function () {
                instance.itemsContainer.refreshItems();
            });
        });
    }

    /**
     *
     */
    function showSortMenu () {
        var instance = this;

        require(['sortMenu'], function (SortMenu) {
            new SortMenu().show({
                settingsKey: instance.getSettingsKey(),
                settings: instance.getSortValues(),
                onChange: instance.itemsContainer.refreshItems.bind(instance.itemsContainer),
                serverId: instance.params.serverId,
                sortOptions: instance.getSortMenuOptions()
            }).then(function () {
                updateSortText(instance);
                updateAlphaPickerState(instance);
                instance.itemsContainer.refreshItems();
            });
        });
    }

    /**
     *
     */
    function onNewItemClick () {
        var instance = this;

        require(['playlistEditor'], function (playlistEditor) {
            new playlistEditor().show({
                items: [],
                serverId: instance.params.serverId
            });
        });
    }

    /**
     * @param elems
     * @param hide
     */
    function hideOrShowAll (elems, hide) {
        for (var i = 0, length = elems.length; i < length; i++) {
            if (hide) {
                elems[i].classList.add('hide');
            } else {
                elems[i].classList.remove('hide');
            }
        }
    }

    /**
     * @param elems
     * @param eventName
     * @param fn
     */
    function bindAll (elems, eventName, fn) {
        for (var i = 0, length = elems.length; i < length; i++) {
            elems[i].addEventListener(eventName, fn);
        }
    }

    /**
     * @param view
     * @param params
     */
    function ItemsView (view, params) {
        /**
         *
         */
        function fetchData () {
            return getItems(self, params, self.currentItem).then(function (result) {
                if (self.totalItemCount == null) {
                    self.totalItemCount = result.Items ? result.Items.length : result.length;
                }

                updateAlphaPickerState(self, self.totalItemCount);
                return result;
            });
        }

        /**
         * @param items
         */
        function getItemsHtml (items) {
            var settings = self.getViewSettings();

            if (settings.imageType === 'list') {
                return listView.getListViewHtml({
                    items: items
                });
            }

            var shape;
            var preferThumb;
            var preferDisc;
            var preferLogo;
            var defaultShape;
            var item = self.currentItem;
            var lines = settings.showTitle ? 2 : 0;

            if (settings.imageType === 'banner') {
                shape = 'banner';
            } else if (settings.imageType === 'disc') {
                shape = 'square';
                preferDisc = true;
            } else if (settings.imageType === 'logo') {
                shape = 'backdrop';
                preferLogo = true;
            } else if (settings.imageType === 'thumb') {
                shape = 'backdrop';
                preferThumb = true;
            } else if (params.type === 'nextup') {
                shape = 'backdrop';
                preferThumb = settings.imageType === 'thumb';
            } else if (params.type === 'Programs' || params.type === 'Recordings') {
                shape = params.IsMovie === 'true' ? 'portrait' : 'autoVertical';
                preferThumb = params.IsMovie !== 'true' ? 'auto' : false;
                defaultShape = params.IsMovie === 'true' ? 'portrait' : 'backdrop';
            } else {
                shape = 'autoVertical';
            }

            var posterOptions = {
                shape: shape,
                showTitle: settings.showTitle,
                showYear: settings.showTitle,
                centerText: true,
                coverImage: true,
                preferThumb: preferThumb,
                preferDisc: preferDisc,
                preferLogo: preferLogo,
                overlayPlayButton: false,
                overlayMoreButton: true,
                overlayText: !settings.showTitle,
                defaultShape: defaultShape,
                action: params.type === 'Audio' ? 'playallfromhere' : null
            };

            if (params.type === 'nextup') {
                posterOptions.showParentTitle = settings.showTitle;
            } else if (params.type === 'Person') {
                posterOptions.showYear = false;
                posterOptions.showParentTitle = false;
                lines = 1;
            } else if (params.type === 'Audio') {
                posterOptions.showParentTitle = settings.showTitle;
            } else if (params.type === 'MusicAlbum') {
                posterOptions.showParentTitle = settings.showTitle;
            } else if (params.type === 'Episode') {
                posterOptions.showParentTitle = settings.showTitle;
            } else if (params.type === 'MusicArtist') {
                posterOptions.showYear = false;
                lines = 1;
            } else if (params.type === 'Programs') {
                lines = settings.showTitle ? 1 : 0;
                var showParentTitle = settings.showTitle && params.IsMovie !== 'true';

                if (showParentTitle) {
                    lines++;
                }

                var showAirTime = settings.showTitle && params.type !== 'Recordings';

                if (showAirTime) {
                    lines++;
                }

                var showYear = settings.showTitle && params.IsMovie === 'true' && params.type === 'Recordings';

                if (showYear) {
                    lines++;
                }

                posterOptions = Object.assign(posterOptions, {
                    inheritThumb: params.type === 'Recordings',
                    context: 'livetv',
                    showParentTitle: showParentTitle,
                    showAirTime: showAirTime,
                    showAirDateTime: showAirTime,
                    overlayPlayButton: false,
                    overlayMoreButton: true,
                    showYear: showYear,
                    coverImage: true
                });
            } else {
                posterOptions.showParentTitle = settings.showTitle;
            }

            posterOptions.lines = lines;
            posterOptions.items = items;

            if (item && item.CollectionType === 'folders') {
                posterOptions.context = 'folders';
            }

            return cardBuilder.getCardsHtml(posterOptions);
        }

        /**
         *
         */
        function initAlphaPicker () {
            self.scroller = view.querySelector('.scrollFrameY');
            var alphaPickerElement = self.alphaPickerElement;

            if (layoutManager.tv) {
                alphaPickerElement.classList.add('alphaPicker-fixed-left');
                alphaPickerElement.classList.add('focuscontainer-left');
                self.itemsContainer.parentNode.classList.add('padded-left-withalphapicker');
            } else {
                alphaPickerElement.classList.add('alphaPicker-fixed-right');
                alphaPickerElement.classList.add('focuscontainer-right');
                self.itemsContainer.parentNode.classList.add('padded-right-withalphapicker');
            }

            self.alphaPicker = new alphaPicker({
                element: alphaPickerElement,
                itemsContainer: layoutManager.tv ? self.itemsContainer : null,
                itemClass: 'card',
                valueChangeEvent: layoutManager.tv ? null : 'click'
            });
            self.alphaPicker.on('alphavaluechanged', onAlphaPickerValueChanged);
        }

        /**
         *
         */
        function onAlphaPickerValueChanged () {
            self.alphaPicker.value();
            self.itemsContainer.refreshItems();
        }

        /**
         * @param item
         */
        function setTitle (item) {
            Emby.Page.setTitle(getTitle(item) || '');

            if (item && item.CollectionType === 'playlists') {
                hideOrShowAll(view.querySelectorAll('.btnNewItem'), false);
            } else {
                hideOrShowAll(view.querySelectorAll('.btnNewItem'), true);
            }
        }

        /**
         * @param item
         */
        function getTitle (item) {
            if (params.type === 'Recordings') {
                return globalize.translate('Recordings');
            }

            if (params.type === 'Programs') {
                if (params.IsMovie === 'true') {
                    return globalize.translate('Movies');
                }

                if (params.IsSports === 'true') {
                    return globalize.translate('Sports');
                }

                if (params.IsKids === 'true') {
                    return globalize.translate('HeaderForKids');
                }

                if (params.IsAiring === 'true') {
                    return globalize.translate('HeaderOnNow');
                }

                if (params.IsSeries === 'true') {
                    return globalize.translate('Shows');
                }

                if (params.IsNews === 'true') {
                    return globalize.translate('News');
                }

                return globalize.translate('Programs');
            }

            if (params.type === 'nextup') {
                return globalize.translate('NextUp');
            }

            if (params.type === 'favoritemovies') {
                return globalize.translate('FavoriteMovies');
            }

            if (item) {
                return item.Name;
            }

            if (params.type === 'Movie') {
                return globalize.translate('Movies');
            }

            if (params.type === 'Series') {
                return globalize.translate('Shows');
            }

            if (params.type === 'Season') {
                return globalize.translate('Seasons');
            }

            if (params.type === 'Episode') {
                return globalize.translate('Episodes');
            }

            if (params.type === 'MusicArtist') {
                return globalize.translate('Artists');
            }

            if (params.type === 'MusicAlbum') {
                return globalize.translate('Albums');
            }

            if (params.type === 'Audio') {
                return globalize.translate('Songs');
            }

            if (params.type === 'Video') {
                return globalize.translate('Videos');
            }

            return void 0;
        }

        /**
         *
         */
        function play () {
            var currentItem = self.currentItem;

            if (currentItem && !self.hasFilters) {
                playbackManager.play({
                    items: [currentItem]
                });
            } else {
                getItems(self, self.params, currentItem, null, null, 300).then(function (result) {
                    playbackManager.play({
                        items: result.Items
                    });
                });
            }
        }

        /**
         *
         */
        function queue () {
            var currentItem = self.currentItem;

            if (currentItem && !self.hasFilters) {
                playbackManager.queue({
                    items: [currentItem]
                });
            } else {
                getItems(self, self.params, currentItem, null, null, 300).then(function (result) {
                    playbackManager.queue({
                        items: result.Items
                    });
                });
            }
        }

        /**
         *
         */
        function shuffle () {
            var currentItem = self.currentItem;

            if (currentItem && !self.hasFilters) {
                playbackManager.shuffle(currentItem);
            } else {
                getItems(self, self.params, currentItem, 'Random', null, 300).then(function (result) {
                    playbackManager.play({
                        items: result.Items
                    });
                });
            }
        }

        var self = this;
        self.params = params;
        this.itemsContainer = view.querySelector('.itemsContainer');

        if (params.parentId) {
            this.itemsContainer.setAttribute('data-parentid', params.parentId);
        } else if (params.type === 'nextup') {
            this.itemsContainer.setAttribute('data-monitor', 'videoplayback');
        } else if (params.type === 'favoritemovies') {
            this.itemsContainer.setAttribute('data-monitor', 'markfavorite');
        } else if (params.type === 'Programs') {
            this.itemsContainer.setAttribute('data-refreshinterval', '300000');
        }

        var i;
        var length;
        var btnViewSettings = view.querySelectorAll('.btnViewSettings');

        for (i = 0, length = btnViewSettings.length; i < length; i++) {
            btnViewSettings[i].addEventListener('click', showViewSettingsMenu.bind(this));
        }

        var filterButtons = view.querySelectorAll('.btnFilter');
        this.filterButtons = filterButtons;
        var hasVisibleFilters = this.getVisibleFilters().length;

        for (i = 0, length = filterButtons.length; i < length; i++) {
            var btnFilter = filterButtons[i];
            btnFilter.addEventListener('click', showFilterMenu.bind(this));

            if (hasVisibleFilters) {
                btnFilter.classList.remove('hide');
            } else {
                btnFilter.classList.add('hide');
            }
        }

        var sortButtons = view.querySelectorAll('.btnSort');

        for (this.sortButtons = sortButtons, i = 0, length = sortButtons.length; i < length; i++) {
            var sortButton = sortButtons[i];
            sortButton.addEventListener('click', showSortMenu.bind(this));

            if (params.type !== 'nextup') {
                sortButton.classList.remove('hide');
            }
        }

        this.btnSortText = view.querySelector('.btnSortText');
        this.btnSortIcon = view.querySelector('.btnSortIcon');
        bindAll(view.querySelectorAll('.btnNewItem'), 'click', onNewItemClick.bind(this));
        this.alphaPickerElement = view.querySelector('.alphaPicker');
        self.itemsContainer.fetchData = fetchData;
        self.itemsContainer.getItemsHtml = getItemsHtml;
        view.addEventListener('viewshow', function (e) {
            var isRestored = e.detail.isRestored;

            if (!isRestored) {
                loading.show();
                updateSortText(self);
                updateItemsContainerForViewType(self);
            }

            setTitle(null);
            getItem(params).then(function (item) {
                setTitle(item);
                self.currentItem = item;
                var refresh = !isRestored;
                self.itemsContainer.resume({
                    refresh: refresh
                }).then(function () {
                    loading.hide();

                    if (refresh) {
                        focusManager.autoFocus(self.itemsContainer);
                    }
                });

                if (!isRestored && item && item.Type !== 'PhotoAlbum') {
                    initAlphaPicker();
                }

                var itemType = item ? item.Type : null;

                if (itemType === 'MusicGenre' || params.type !== 'Programs' && itemType !== 'Channel') {
                    hideOrShowAll(view.querySelectorAll('.btnPlay'), false);
                } else {
                    hideOrShowAll(view.querySelectorAll('.btnPlay'), true);
                }

                if (itemType === 'MusicGenre' || params.type !== 'Programs' && params.type !== 'nextup' && itemType !== 'Channel') {
                    hideOrShowAll(view.querySelectorAll('.btnShuffle'), false);
                } else {
                    hideOrShowAll(view.querySelectorAll('.btnShuffle'), true);
                }

                if (item && playbackManager.canQueue(item)) {
                    hideOrShowAll(view.querySelectorAll('.btnQueue'), false);
                } else {
                    hideOrShowAll(view.querySelectorAll('.btnQueue'), true);
                }
            });

            if (!isRestored) {
                bindAll(view.querySelectorAll('.btnPlay'), 'click', play);
                bindAll(view.querySelectorAll('.btnQueue'), 'click', queue);
                bindAll(view.querySelectorAll('.btnShuffle'), 'click', shuffle);
            }

            this.alphaNumericShortcuts = new AlphaNumericShortcuts({
                itemsContainer: self.itemsContainer
            });
        });
        view.addEventListener('viewhide', function (e) {
            var itemsContainer = self.itemsContainer;

            if (itemsContainer) {
                itemsContainer.pause();
            }

            var alphaNumericShortcuts = self.alphaNumericShortcuts;

            if (alphaNumericShortcuts) {
                alphaNumericShortcuts.destroy();
                self.alphaNumericShortcuts = null;
            }
        });
        view.addEventListener('viewdestroy', function () {
            if (self.listController) {
                self.listController.destroy();
            }

            if (self.alphaPicker) {
                self.alphaPicker.off('alphavaluechanged', onAlphaPickerValueChanged);
                self.alphaPicker.destroy();
            }

            self.currentItem = null;
            self.scroller = null;
            self.itemsContainer = null;
            self.filterButtons = null;
            self.sortButtons = null;
            self.btnSortText = null;
            self.btnSortIcon = null;
            self.alphaPickerElement = null;
        });
    }

    ItemsView.prototype.getFilters = function () {
        var basekey = this.getSettingsKey();
        return {
            IsPlayed: userSettings.getFilter(basekey + '-filter-IsPlayed') === 'true',
            IsUnplayed: userSettings.getFilter(basekey + '-filter-IsUnplayed') === 'true',
            IsFavorite: userSettings.getFilter(basekey + '-filter-IsFavorite') === 'true',
            IsResumable: userSettings.getFilter(basekey + '-filter-IsResumable') === 'true',
            Is4K: userSettings.getFilter(basekey + '-filter-Is4K') === 'true',
            IsHD: userSettings.getFilter(basekey + '-filter-IsHD') === 'true',
            IsSD: userSettings.getFilter(basekey + '-filter-IsSD') === 'true',
            Is3D: userSettings.getFilter(basekey + '-filter-Is3D') === 'true',
            VideoTypes: userSettings.getFilter(basekey + '-filter-VideoTypes'),
            SeriesStatus: userSettings.getFilter(basekey + '-filter-SeriesStatus'),
            HasSubtitles: userSettings.getFilter(basekey + '-filter-HasSubtitles'),
            HasTrailer: userSettings.getFilter(basekey + '-filter-HasTrailer'),
            HasSpecialFeature: userSettings.getFilter(basekey + '-filter-HasSpecialFeature'),
            HasThemeSong: userSettings.getFilter(basekey + '-filter-HasThemeSong'),
            HasThemeVideo: userSettings.getFilter(basekey + '-filter-HasThemeVideo'),
            GenreIds: userSettings.getFilter(basekey + '-filter-GenreIds')
        };
    };

    ItemsView.prototype.getSortValues = function () {
        var basekey = this.getSettingsKey();
        return {
            sortBy: userSettings.getFilter(basekey + '-sortby') || this.getDefaultSortBy(),
            sortOrder: userSettings.getFilter(basekey + '-sortorder') === 'Descending' ? 'Descending' : 'Ascending'
        };
    };

    ItemsView.prototype.getDefaultSortBy = function () {
        var params = this.params;
        var sortNameOption = this.getNameSortOption(params);

        if (params.type) {
            return sortNameOption.value;
        }

        return 'IsFolder,' + sortNameOption.value;
    };

    ItemsView.prototype.getSortMenuOptions = function () {
        var sortBy = [];
        var params = this.params;

        if (params.type === 'Programs') {
            sortBy.push({
                name: globalize.translate('AirDate'),
                value: 'StartDate,SortName'
            });
        }

        var option = this.getNameSortOption(params);

        if (option) {
            sortBy.push(option);
        }

        option = this.getCommunityRatingSortOption();

        if (option) {
            sortBy.push(option);
        }

        option = this.getCriticRatingSortOption();

        if (option) {
            sortBy.push(option);
        }

        if (params.type !== 'Programs') {
            sortBy.push({
                name: globalize.translate('DateAdded'),
                value: 'DateCreated,SortName'
            });
        }

        option = this.getDatePlayedSortOption();

        if (option) {
            sortBy.push(option);
        }

        if (!params.type) {
            option = this.getNameSortOption(params);
            sortBy.push({
                name: globalize.translate('Folders'),
                value: 'IsFolder,' + option.value
            });
        }

        sortBy.push({
            name: globalize.translate('ParentalRating'),
            value: 'OfficialRating,SortName'
        });
        option = this.getPlayCountSortOption();

        if (option) {
            sortBy.push(option);
        }

        sortBy.push({
            name: globalize.translate('ReleaseDate'),
            value: 'ProductionYear,PremiereDate,SortName'
        });
        sortBy.push({
            name: globalize.translate('Runtime'),
            value: 'Runtime,SortName'
        });
        return sortBy;
    };

    ItemsView.prototype.getNameSortOption = function (params) {
        if (params.type === 'Episode') {
            return {
                name: globalize.translate('Name'),
                value: 'SeriesName,SortName'
            };
        }

        return {
            name: globalize.translate('Name'),
            value: 'SortName'
        };
    };

    ItemsView.prototype.getPlayCountSortOption = function () {
        if (this.params.type === 'Programs') {
            return null;
        }

        return {
            name: globalize.translate('PlayCount'),
            value: 'PlayCount,SortName'
        };
    };

    ItemsView.prototype.getDatePlayedSortOption = function () {
        if (this.params.type === 'Programs') {
            return null;
        }

        return {
            name: globalize.translate('DatePlayed'),
            value: 'DatePlayed,SortName'
        };
    };

    ItemsView.prototype.getCriticRatingSortOption = function () {
        if (this.params.type === 'Programs') {
            return null;
        }

        return {
            name: globalize.translate('CriticRating'),
            value: 'CriticRating,SortName'
        };
    };

    ItemsView.prototype.getCommunityRatingSortOption = function () {
        return {
            name: globalize.translate('CommunityRating'),
            value: 'CommunityRating,SortName'
        };
    };

    ItemsView.prototype.getVisibleFilters = function () {
        var filters = [];
        var params = this.params;

        if (!(params.type === 'nextup')) {
            if (params.type === 'Programs') {
                filters.push('Genres');
            } else {
                params.type;
                filters.push('IsUnplayed');
                filters.push('IsPlayed');

                if (!params.IsFavorite) {
                    filters.push('IsFavorite');
                }

                filters.push('IsResumable');
                filters.push('VideoType');
                filters.push('HasSubtitles');
                filters.push('HasTrailer');
                filters.push('HasSpecialFeature');
                filters.push('HasThemeSong');
                filters.push('HasThemeVideo');
            }
        }

        return filters;
    };

    ItemsView.prototype.setFilterStatus = function (hasFilters) {
        this.hasFilters = hasFilters;
        var filterButtons = this.filterButtons;

        if (filterButtons.length) {
            for (var i = 0, length = filterButtons.length; i < length; i++) {
                var btnFilter = filterButtons[i];
                var bubble = btnFilter.querySelector('.filterButtonBubble');

                if (!bubble) {
                    if (!hasFilters) {
                        continue;
                    }

                    btnFilter.insertAdjacentHTML('afterbegin', '<div class="filterButtonBubble">!</div>');
                    btnFilter.classList.add('btnFilterWithBubble');
                    bubble = btnFilter.querySelector('.filterButtonBubble');
                }

                if (hasFilters) {
                    bubble.classList.remove('hide');
                } else {
                    bubble.classList.add('hide');
                }
            }
        }
    };

    ItemsView.prototype.getFilterMenuOptions = function () {
        var params = this.params;
        return {
            IsAiring: params.IsAiring,
            IsMovie: params.IsMovie,
            IsSports: params.IsSports,
            IsKids: params.IsKids,
            IsNews: params.IsNews,
            IsSeries: params.IsSeries,
            Recursive: this.queryRecursive
        };
    };

    ItemsView.prototype.getVisibleViewSettings = function () {
        var item = (this.params, this.currentItem);
        var fields = ['showTitle'];

        if (!item || item.Type !== 'PhotoAlbum' && item.Type !== 'ChannelFolderItem') {
            fields.push('imageType');
        }

        fields.push('viewType');
        return fields;
    };

    ItemsView.prototype.getViewSettings = function () {
        var basekey = this.getSettingsKey();
        var params = this.params;
        var item = this.currentItem;
        var showTitle = userSettings.get(basekey + '-showTitle');

        if (showTitle === 'true') {
            showTitle = true;
        } else if (showTitle === 'false') {
            showTitle = false;
        } else if (params.type === 'Programs' || params.type === 'Recordings' || params.type === 'Person' || params.type === 'nextup' || params.type === 'Audio' || params.type === 'MusicAlbum' || params.type === 'MusicArtist') {
            showTitle = true;
        } else if (item && item.Type !== 'PhotoAlbum') {
            showTitle = true;
        }

        var imageType = userSettings.get(basekey + '-imageType');

        if (!imageType && params.type === 'nextup') {
            imageType = 'thumb';
        }

        return {
            showTitle: showTitle,
            showYear: userSettings.get(basekey + '-showYear') !== 'false',
            imageType: imageType || 'primary',
            viewType: userSettings.get(basekey + '-viewType') || 'images'
        };
    };

    ItemsView.prototype.getItemTypes = function () {
        var params = this.params;

        if (params.type === 'nextup') {
            return ['Episode'];
        }

        if (params.type === 'Programs') {
            return ['Program'];
        }

        return [];
    };

    ItemsView.prototype.getSettingsKey = function () {
        var values = [];
        values.push('items');
        var params = this.params;

        if (params.type) {
            values.push(params.type);
        } else if (params.parentId) {
            values.push(params.parentId);
        }

        if (params.IsAiring) {
            values.push('IsAiring');
        }

        if (params.IsMovie) {
            values.push('IsMovie');
        }

        if (params.IsKids) {
            values.push('IsKids');
        }

        if (params.IsSports) {
            values.push('IsSports');
        }

        if (params.IsNews) {
            values.push('IsNews');
        }

        if (params.IsSeries) {
            values.push('IsSeries');
        }

        if (params.IsFavorite) {
            values.push('IsFavorite');
        }

        if (params.genreId) {
            values.push('Genre');
        }

        if (params.musicGenreId) {
            values.push('MusicGenre');
        }

        if (params.studioId) {
            values.push('Studio');
        }

        if (params.personId) {
            values.push('Person');
        }

        if (params.parentId) {
            values.push('Folder');
        }

        return values.join('-');
    };

    return ItemsView;
});
