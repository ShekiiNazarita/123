import type { AxiosRequestConfig } from 'axios';
import type { ParentalRating } from '@jellyfin/sdk/lib/generated-client/models/parental-rating';
import { getLocalizationApi } from '@jellyfin/sdk/lib/utils/api/localization-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { type JellyfinApiContext, useApi } from 'hooks/useApi';

function groupRating(data: ParentalRating[]) {
    const ratings: ParentalRating[] = [];

    for (const parentalRating of data) {
        const rating: ParentalRating = {
            Name: parentalRating.Name,
            Value:
                parentalRating.Value !== undefined ?
                    parentalRating.Value :
                    null
        };

        const existingRating = ratings.find((r) => r.Value === rating.Value);
        if (existingRating) {
            existingRating.Name += '/' + rating.Name;
        } else {
            ratings.push(rating);
        }
    }

    return ratings;
}

const getParentalRatings = async (
    apiContext: JellyfinApiContext,
    options?: AxiosRequestConfig
) => {
    const { api } = apiContext;
    if (!api) throw new Error('No API instance available');

    const response = await getLocalizationApi(api).getParentalRatings(options);
    return groupRating(response.data || []);
};

export const getParentalRatingsQuery = (apiContext: JellyfinApiContext) =>
    queryOptions({
        queryKey: ['ParentalRatings'],
        queryFn: ({ signal }) => getParentalRatings(apiContext, { signal }),
        enabled: !!apiContext.api
    });

export const useGetParentalRatings = () => {
    const apiContext = useApi();
    return useQuery(getParentalRatingsQuery(apiContext));
};
