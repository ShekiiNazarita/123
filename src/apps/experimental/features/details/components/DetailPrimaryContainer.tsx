import React, { type FC, useCallback } from 'react';
import { useApi } from 'hooks/useApi';
import { useTrackSelections } from '../hooks/useTrackSelections';

import { playbackManager } from 'components/playback/playbackmanager';
import { appHost } from 'components/apphost';
import dom from 'scripts/dom';
import { getPlaybackCapabilities } from '../utils/items';
import { CardShape } from 'utils/card';
import itemHelper from 'components/itemHelper';

import Card from 'components/cardbuilder/Card/Card';
import TextLines from 'components/common/textLines/TextLines';
import PrimaryMediaInfo from 'components/mediainfo/PrimaryMediaInfo';
import SecondaryMediaInfo from 'components/mediainfo/SecondaryMediaInfo';

import PlayOrResumeButton from './buttons/PlayOrResumeButton';
import DownloadButton from './buttons/DownloadButton';
import PlayTrailerButton from './buttons/PlayTrailerButton';
import InstantMixButton from './buttons/InstantMixButton';
import ShuffleButton from './buttons/ShuffleButton';
import CancelSeriesTimerButton from './buttons/CancelSeriesTimerButton';
import CancelTimerButton from './buttons/CancelTimerButton';
import PlayedButton from 'elements/emby-playstatebutton/PlayedButton';
import FavoriteButton from 'elements/emby-ratingbutton/FavoriteButton';
import SplitVersionsButton from './buttons/SplitVersionsButton';
import MoreCommandsButton from './buttons/MoreCommandsButton';

import { ItemKind } from 'types/base/models/item-kind';
import { ItemStatus } from 'types/base/models/item-status';
import type { ItemDto } from 'types/base/models/item-dto';
import type { CardOptions } from 'types/cardOptions';

interface DetailPrimaryContainerProps {
    item: ItemDto;
    paramId: string | null;
}

const DetailPrimaryContainer: FC<DetailPrimaryContainerProps> = ({
    item,
    paramId
}) => {
    const { user } = useApi();
    const {
        mediaSourceInfo,
        groupedVersions,
        selectedMediaSourceId,
        selectedAudioTrack,
        selectedSubtitleTrack
    } = useTrackSelections();

    const getShape = useCallback(() => {
        let shape: CardShape = CardShape.Square;
        if (item.PrimaryImageAspectRatio) {
            if (item.PrimaryImageAspectRatio >= 3) {
                shape = CardShape.Banner;
            } else if (item.PrimaryImageAspectRatio >= 1.33) {
                shape = CardShape.Backdrop;
            } else if (item.PrimaryImageAspectRatio > 0.8) {
                shape = CardShape.Square;
            } else {
                shape = CardShape.Portrait;
            }
        }

        return shape;
    }, [item.PrimaryImageAspectRatio]);

    const getCardOptions = useCallback(() => {
        const shape = getShape();

        const cardOptions: CardOptions = {
            shape: shape,
            action: 'none',
            width: dom.getWindowSize().innerWidth * 0.25,
            disableHoverMenu: true,
            disableIndicators: true,
            cardLayout: false,
            disableCardFooter: true,
            showProgressBar: false
        };

        return cardOptions;
    }, [getShape]);

    const { isPlayAllowed, isResumeAllowed, isInstantMixAllowed, isShuffleAllowed } = getPlaybackCapabilities(item);

    return (
        <div className='detailPagePrimaryContainer detailRibbon padded-left padded-right'>
            <div className='infoWrapper'>
                <div className='detailImageContainer '>
                    <Card item={item} cardOptions={getCardOptions()} />
                </div>
                <TextLines
                    item={item}
                    className='nameContainer'
                    textClassName='itemName infoText parentNameLast'
                    textLineOpts={{
                        showParentTitle: true,
                        showArtist: true,
                        includeParentInfoInTitle: true,
                        includeIndexNumber: true
                    }}
                    isLargeStyle
                />
                <PrimaryMediaInfo
                    className='itemMiscInfo itemMiscInfo-primary'
                    item={item}
                    mediaSourceInfo={mediaSourceInfo}
                    showOriginalAirDateInfo
                    showCaptionIndicatorInfo
                    showRuntimeInfo
                    showFolderRuntimeInfo
                    showItemCountInfo
                    showStarRatingInfo
                    showOfficialRatingInfo
                    showYearInfo
                    showAudioContainerInfo
                    showProgramIndicatorInfo
                    showCriticRatingInfo
                    showEndsAtInfo
                />

                <SecondaryMediaInfo
                    className='itemMiscInfo itemMiscInfo-secondary'
                    item={item}
                    showProgramTimeInfo
                    showStartDateInfo
                    showChannelNumberInfo
                    showChannelInfo
                    channelInteractive
                    showTimerIndicatorInfo
                />
            </div>
            <div className='mainDetailButtons'>
                {isPlayAllowed && (
                    <PlayOrResumeButton
                        item={item}
                        isResumable={isResumeAllowed}
                        selectedMediaSourceId={selectedMediaSourceId}
                        selectedAudioTrack={selectedAudioTrack}
                        selectedSubtitleTrack={selectedSubtitleTrack}
                    />
                )}

                {isResumeAllowed && (
                    <PlayOrResumeButton
                        item={item}
                        isResumable={false} // Play form the beginning
                        selectedMediaSourceId={selectedMediaSourceId}
                        selectedAudioTrack={selectedAudioTrack}
                        selectedSubtitleTrack={selectedSubtitleTrack}
                    />
                )}

                {item.Id
                    && item.Type === ItemKind.Book
                    && item.CanDownload
                    && appHost.supports('filedownload') && (
                    <DownloadButton
                        itemId={item.Id}
                        itemServerId={item.ServerId}
                        itemName={item.Name}
                        itemPath={item.Path}
                    />
                )}

                {(item.LocalTrailerCount
                    || (item.RemoteTrailers && item.RemoteTrailers.length > 0))
                    && playbackManager
                        .getSupportedCommands()
                        .indexOf('PlayTrailers') !== -1 && (
                    <PlayTrailerButton item={item} />
                )}

                {isInstantMixAllowed && <InstantMixButton item={item} />}

                {isShuffleAllowed && <ShuffleButton item={item} />}

                {item.Type === ItemKind.SeriesTimer
                    && item.Id
                    && user?.Policy?.EnableLiveTvManagement && (
                    <CancelSeriesTimerButton itemId={item.Id} />
                )}

                {item.Type !== ItemKind.Recording
                    || !user?.Policy?.EnableLiveTvManagement
                    || !item.TimerId
                    || (item.Status !== ItemStatus.InProgress && (
                        <CancelTimerButton
                            timerId={item.TimerId}
                            queryKey={['DetailsItem']}
                        />
                    ))}

                {item.UserData && itemHelper.canMarkPlayed(item) && (
                    <PlayedButton
                        className='button-flat btnPlaystate'
                        isPlayed={item.UserData.Played}
                        itemId={item?.Id}
                        itemType={item?.Type}
                        queryKey={['DetailsItem']}
                    />
                )}

                {item.UserData && itemHelper.canRate(item) && (
                    <FavoriteButton
                        className='button-flat btnUserRating'
                        isFavorite={item.UserData.IsFavorite}
                        itemId={item?.Id}
                        queryKey={['DetailsItem']}
                    />
                )}

                {paramId
                    && user?.Policy?.IsAdministrator
                    && groupedVersions
                    && groupedVersions.length > 0 && (
                    <SplitVersionsButton
                        paramId={paramId}
                        queryKey={['DetailsItem']}
                    />
                )}

                {item.Id && (
                    <MoreCommandsButton
                        className='button-flat btnMoreCommands'
                        itemType={item.Type}
                        itemId={item.Id}
                        selectedItemId={selectedMediaSourceId}
                        contextMenuOpts={{
                            open: false,
                            play: false,
                            playAllFromHere: false,
                            queueAllFromHere: false,
                            cancelTimer: false,
                            record: false,
                            deleteItem: item?.CanDelete === true,
                            shuffle: false,
                            instantMix: false,
                            share: true
                        }}
                        queryKey={['DetailsItem']}
                    />
                )}
            </div>
        </div>
    );
};

export default DetailPrimaryContainer;
