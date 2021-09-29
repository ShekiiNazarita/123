import React, { FunctionComponent } from 'react';

type IProps = {
    user: any;
    Name: string;
    Id: string;
}

const createCheckBoxElement = ({Name, Id, checkedAttribute}) => ({
    __html: `<label>
    <input
    type="checkbox"
    is="emby-checkbox"
    class="chkChannel"
    data-id="${Id}" ${checkedAttribute}
    />
    <span>${Name}</span>
    </label>`
});

const LibraryChannelAccess: FunctionComponent<IProps> = ({user, Name, Id}: IProps) => {
    const isChecked = user.Policy.EnableAllChannels || user.Policy.EnabledChannels.indexOf(Id) != -1;
    const checkedAttribute = isChecked ? ' checked="checked"' : '';
    return (
        <div
            dangerouslySetInnerHTML={createCheckBoxElement({
                Name: Name,
                Id: Id,
                checkedAttribute: checkedAttribute
            })}
        />
    );
};

export default LibraryChannelAccess;

