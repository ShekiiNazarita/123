/**
 * Gets the url search string.
 * This function should be used instead of location.search alone, because the app router
 * includes search parameters in the hash portion of the url.
 * @returns The url search string.
 */
export const getLocationSearch = () => {
    // Return location.search if it exists
    if (window.location.search) {
        return window.location.search;
    }

    // Check the entire url in case the search string is in the hash
    const index = window.location.href.indexOf('?');
    if (index !== -1) {
        return window.location.href.substring(index);
    }

    return '';
};

/**
 * Gets the value of a url search parameter by name.
 * @param name The parameter name.
 * @param url The url to search (optional).
 * @returns The parameter value.
 */
export const getParameterByName = (name: string, url?: string | null | undefined) => {
    if (!url) {
        url = getLocationSearch();
    }

    // eslint-disable-next-line compat/compat
    return new URLSearchParams(url).get(name) ?? '';
};
