import dialogHelper from 'dialogHelper';
import layoutManager from 'layoutManager';
import globalize from 'globalize';
import 'paper-icon-button-light';
import 'emby-input';
import 'emby-select';
import 'formDialogStyle';

function centerFocus(elem, horiz, on) {
    import('scrollHelper').then(({default: scrollHelper}) => {
        const fn = on ? 'on' : 'off';
        scrollHelper.centerFocus[fn](elem, horiz);
    });
}

export function show(codecProfile) {
    return new Promise(function (resolve, reject) {
        import('text!./codecProfileEditor.template.html').then(({default: template}) => {
            const dialogOptions = {
                removeOnClose: true,
                scrollY: false
            };

            if (layoutManager.tv) {
                dialogOptions.size = 'fullscreen';
            } else {
                dialogOptions.size = 'small';
            }

            const dlg = dialogHelper.createDialog(dialogOptions);

            dlg.classList.add('formDialog');

            let html = '';
            let submitted = false;

            html += globalize.translateHtml(template, 'core');

            dlg.innerHTML = html;

            dlg.querySelector('#selectCodecProfileType', dlg).value = codecProfile.Type || 'Video';
            dlg.querySelector('#txtCodecProfileCodec', dlg).value = codecProfile.Codec || '';

            if (layoutManager.tv) {
                centerFocus(dlg.querySelector('.formDialogContent'), false, true);
            }

            dialogHelper.open(dlg);

            dlg.addEventListener('close', function () {
                if (layoutManager.tv) {
                    centerFocus(dlg.querySelector('.formDialogContent'), false, false);
                }

                if (submitted) {
                    resolve(codecProfile);
                } else {
                    reject();
                }
            });

            dlg.querySelector('.btnCancel').addEventListener('click', function (e) {
                dialogHelper.close(dlg);
            });

            dlg.querySelector('form').addEventListener('submit', function (e) {
                submitted = true;

                codecProfile.Type = dlg.querySelector('#selectCodecProfileType', dlg).value;
                codecProfile.Codec = dlg.querySelector('#txtCodecProfileCodec', dlg).value;

                dialogHelper.close(dlg);

                e.preventDefault();
                return false;
            });

            dlg.querySelector('#selectCodecProfileType').dispatchEvent(new CustomEvent('change', {
                bubbles: true
            }));
        });
    });
}

export default {
    show: show
};

