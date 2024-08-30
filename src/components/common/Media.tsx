import { BaseItemKind, ImageType } from '@jellyfin/sdk/lib/generated-client';
import React, { type FC } from 'react';
import Image from './Image';
import DefaultIconText from './DefaultIconText';
import type { ItemDto } from 'types/base/models/item-dto';

interface MediaProps {
    item: ItemDto;
    imgUrl: string | undefined;
    blurhash?: string;
    imageType?: ImageType
    defaultCardImageIcon?: string
}

const Media: FC<MediaProps> = ({
    item,
    imgUrl,
    blurhash,
    imageType,
    defaultCardImageIcon
}) => {
    return imgUrl ? (
        <Image
            imgUrl={imgUrl}
            blurhash={blurhash}
            containImage={item.Type === BaseItemKind.TvChannel || imageType === ImageType.Logo}
        />
    ) : (
        <DefaultIconText
            item={item}
            defaultCardImageIcon={defaultCardImageIcon}
        />
    );
};

export default Media;
