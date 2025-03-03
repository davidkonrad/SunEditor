/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import dialog from '../modules/dialog';
import resizing from '../modules/resizing';
import notice from '../modules/notice';

export default {
    name: 'image',
    add: function (core) {
        core.addModule([dialog, resizing, notice]);
        
        const context = core.context;
        context.image = {
            _linkElement: null,
            _container: null,
            _cover: null,
            _element: null,
            _element_w: 1,
            _element_h: 1,
            _element_l: 0,
            _element_t: 0,
            _origin_w: context.option.imageWidth === 'auto' ? '' : context.option.imageWidth,
            _origin_h: '',
            _altText: '',
            _caption: null,
            captionCheckEl: null,
            _linkValue: '',
            _align: 'none',
            _captionChecked: false,
            _proportionChecked: true,
            _floatClassRegExp: 'float\\-[a-z]+',
            _xmlHttp: null,
            _resizing: context.option.imageResizing,
            _defaultAuto: context.option.imageWidth === 'auto' ? true : false,
            _uploadFileLength: 0
        };

        /** image dialog */
        let image_dialog = this.setDialog.call(core);
        context.image.modal = image_dialog;
        context.image.imgUrlFile = image_dialog.querySelector('._se_image_url');
        context.image.imgInputFile = context.image.focusElement = image_dialog.querySelector('._se_image_file');
        context.image.altText = image_dialog.querySelector('._se_image_alt');
        context.image.imgLink = image_dialog.querySelector('._se_image_link');
        context.image.imgLinkNewWindowCheck = image_dialog.querySelector('._se_image_link_check');
        context.image.captionCheckEl = image_dialog.querySelector('._se_image_check_caption');

        /** add event listeners */
        context.image.modal.querySelector('.se-dialog-tabs').addEventListener('click', this.openTab.bind(core));
        context.image.modal.querySelector('.se-btn-primary').addEventListener('click', this.submit.bind(core));
        
        context.image.imageX = {};
        context.image.imageY = {};
        if (context.option.imageResizing) {
            context.image.proportion = image_dialog.querySelector('._se_image_check_proportion');
            context.image.imageX = image_dialog.querySelector('._se_image_size_x');
            context.image.imageY = image_dialog.querySelector('._se_image_size_y');
            context.image.imageX.value = context.option.imageWidth;
            
            context.image.imageX.addEventListener('change', this.setInputSize.bind(core, 'x'));
            context.image.imageY.addEventListener('change', this.setInputSize.bind(core, 'y'));
            image_dialog.querySelector('.se-dialog-btn-revert').addEventListener('click', this.sizeRevert.bind(core));
        }

        /** append html */
        context.dialog.modal.appendChild(image_dialog);

        /** empty memory */
        image_dialog = null;
    },

    /** dialog */
    setDialog: function () {
        const option = this.context.option;
        const lang = this.lang;
        const dialog = this.util.createElement('DIV');

        dialog.className = 'se-dialog-content';
        dialog.style.display = 'none';

        let html = '' +
            '<div class="se-dialog-header">' +
            '   <button type="button" data-command="close" class="close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
            '       <i aria-hidden="true" data-command="close" class="se-icon-cancel"></i>' +
            '   </button>' +
            '   <h5 class="modal-title">' + lang.dialogBox.imageBox.title + '</h5>' +
            '</div>' +
            '<div class="se-dialog-tabs">' +
            '   <button type="button" class="_se_tab_link active" data-tab-link="image">' + lang.toolbar.image + '</button>' +
            '   <button type="button" class="_se_tab_link" data-tab-link="url">' + lang.toolbar.link + '</button>' +
            '</div>' +
            '<form class="editor_image" method="post" enctype="multipart/form-data">' +
            '   <div class="_se_tab_content _se_tab_content_image">' +
            '       <div class="se-dialog-body">';

            if (option.imageFileInput) {
                html += '' +
                    '   <div class="se-dialog-form">' +
                    '       <label>' + lang.dialogBox.imageBox.file + '</label>' +
                    '       <input class="se-input-form _se_image_file" type="file" accept="image/*" multiple="multiple" />' +
                    '   </div>' ;
            }

            if (option.imageUrlInput) {
                html += '' +
                    '   <div class="se-dialog-form">' +
                    '       <label>' + lang.dialogBox.imageBox.url + '</label>' +
                    '       <input class="se-input-form _se_image_url" type="text" />' +
                    '   </div>';
            }

            html += '' +
            '           <div class="se-dialog-form">' +
            '               <label>' + lang.dialogBox.imageBox.altText + '</label><input class="se-input-form _se_image_alt" type="text" />' +
            '           </div>';

            if (option.imageResizing) {
                html += '' +
                '       <div class="se-dialog-form">' +
                '           <div class="se-dialog-size-text"><label class="size-w">' + lang.dialogBox.width + '</label><label class="se-dialog-size-x">&nbsp;</label><label class="size-h">' + lang.dialogBox.height + '</label></div>' +
                '           <input class="se-input-control _se_image_size_x" type="number" min="1" ' + (option.imageWidth === 'auto' ? 'disabled' : '') + ' /><label class="se-dialog-size-x">x</label><input class="se-input-control _se_image_size_y" type="number" min="1" disabled />' +
                '           <label><input type="checkbox" class="_se_image_check_proportion" style="margin-left: 20px;" checked disabled/>&nbsp;' + lang.dialogBox.proportion + '</label>' +
                '           <button type="button" title="' + lang.dialogBox.revertButton + '" class="se-btn-basic se-dialog-btn-revert" style="float: right;"><i class="se-icon-revert"></i></button>' +
                '       </div>' ;
            }

            html += '' +
            '           <div class="se-dialog-form-footer">' +
            '               <label><input type="checkbox" class="_se_image_check_caption" />&nbsp;' + lang.dialogBox.caption + '</label>' +
            '           </div>' +
            '       </div>' +
            '   </div>' +
            '   <div class="_se_tab_content _se_tab_content_url" style="display: none">' +
            '       <div class="se-dialog-body">' +
            '           <div class="se-dialog-form">' +
            '               <label>' + lang.dialogBox.linkBox.url + '</label><input class="se-input-form _se_image_link" type="text" />' +
            '           </div>' +
            '           <label><input type="checkbox" class="_se_image_link_check"/>&nbsp;' + lang.dialogBox.linkBox.newWindowCheck + '</label>' +
            '       </div>' +
            '   </div>' +
            '   <div class="se-dialog-footer">' +
            '       <div style="float: left;">' +
            '           <label><input type="radio" name="suneditor_image_radio" class="se-dialog-btn-radio" value="none" checked>' + lang.dialogBox.basic + '</label>' +
            '           <label><input type="radio" name="suneditor_image_radio" class="se-dialog-btn-radio" value="left">' + lang.dialogBox.left + '</label>' +
            '           <label><input type="radio" name="suneditor_image_radio" class="se-dialog-btn-radio" value="center">' + lang.dialogBox.center + '</label>' +
            '           <label><input type="radio" name="suneditor_image_radio" class="se-dialog-btn-radio" value="right">' + lang.dialogBox.right + '</label>' +
            '       </div>' +
            '       <button type="submit" class="btn se-btn-primary" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
            '   </div>' +
            '</form>';

        dialog.innerHTML = html;

        return dialog;
    },

    openTab: function (e) {
        const modal = this.context.image.modal;
        const targetElement = (e === 'init' ? modal.querySelector('._se_tab_link') : e.target);

        if (!/^BUTTON$/i.test(targetElement.tagName)) {
            return false;
        }

        // Declare all variables
        const tabName = targetElement.getAttribute('data-tab-link');
        const contentClassName = '_se_tab_content';
        let i, tabContent, tabLinks;

        // Get all elements with class="tabcontent" and hide them
        tabContent = modal.getElementsByClassName(contentClassName);
        for (i = 0; i < tabContent.length; i++) {
            tabContent[i].style.display = 'none';
        }

        // Get all elements with class="tablinks" and remove the class "active"
        tabLinks = modal.getElementsByClassName('_se_tab_link');
        for (i = 0; i < tabLinks.length; i++) {
            this.util.removeClass(tabLinks[i], 'active');
        }

        // Show the current tab, and add an "active" class to the button that opened the tab
        modal.querySelector('.' + contentClassName + '_' + tabName).style.display = 'block';
        this.util.addClass(targetElement, 'active');

        // focus
        if (tabName === 'image') {
            this.context.image.imgInputFile.focus();
        } else if (tabName === 'url') {
            this.context.image.imgLink.focus();
        }

        return false;
    },

    onRender_imgInput: function () {
        const submitAction = function (fileList) {
            if (fileList.length > 0) {
                const files = [];
                for (let i = 0, len = fileList.length; i < len; i++) {
                    if (/image/i.test(fileList[i].type)) files.push(fileList[i]);
                }

                this.context.image._uploadFileLength = files.length;
                const imageUploadUrl = this.context.option.imageUploadUrl;
                const imageUploadHeader = this.context.option.imageUploadHeader;
                const filesLen = this.context.dialog.updateModal ? 1 : files.length;

                if (typeof imageUploadUrl === 'string' && imageUploadUrl.length > 0) {
                    const formData = new FormData();

                    for (let i = 0; i < filesLen; i++) {
                        formData.append('file-' + i, files[i]);
                    }

                    this.context.image._xmlHttp = this.util.getXMLHttpRequest();
                    this.context.image._xmlHttp.onreadystatechange = this.plugins.image.callBack_imgUpload.bind(this, this.context.image._linkValue, this.context.image.imgLinkNewWindowCheck.checked, this.context.image.imageX.value + 'px', this.context.image._align, this.context.dialog.updateModal, this.context.image._element);
                    this.context.image._xmlHttp.open('post', imageUploadUrl, true);
                    if(typeof imageUploadHeader === 'object' && Object.keys(imageUploadHeader).length > 0){
                        for(let key in imageUploadHeader){
                            this.context.image._xmlHttp.setRequestHeader(key, imageUploadHeader[key]);
                        }
                    }
                    this.context.image._xmlHttp.send(formData);
                }
                else {
                    for (let i = 0; i < filesLen; i++) {
                        this.plugins.image.setup_reader.call(this, files[i], this.context.image._linkValue, this.context.image.imgLinkNewWindowCheck.checked, this.context.image.imageX.value + 'px', this.context.image._align, i, filesLen - 1);
                    }
                }
            }
        }.bind(this);

        try {
            submitAction(this.context.image.imgInputFile.files);
        } catch (e) {
            this.closeLoading();
            notice.open.call(this, '[SUNEDITOR.imageUpload.fail] cause : "' + e.message + '"');
            throw Error('[SUNEDITOR.imageUpload.fail] cause : "' + e.message + '"');
        }
    },

    setup_reader: function (file, imgLinkValue, newWindowCheck, width, align, index, filesLen) {
        const reader = new FileReader();
        
        if (this.context.dialog.updateModal) {
            this.context.image._element.setAttribute('data-file-name', file.name);
            this.context.image._element.setAttribute('data-file-size', file.size);
        }

        reader.onload = function (update, updateElement, file) {
            try {
                this.plugins.image.create_image.call(this, reader.result, imgLinkValue, newWindowCheck, width, align, update, updateElement, file);
                if (index === filesLen) this.closeLoading();
            } catch (e) {
                this.closeLoading();
                notice.open.call(this, '[SUNEDITOR.imageFileRendering.fail] cause : "' + e.message + '"');
                throw Error('[SUNEDITOR.imageFileRendering.fail] cause : "' + e.message + '"');
            }
        }.bind(this, this.context.dialog.updateModal, this.context.image._element, file);

        reader.readAsDataURL(file);
    },

    callBack_imgUpload: function (linkValue, linkNewWindow, width, align, update, updateElement) {
        if (this.context.image._xmlHttp.readyState === 4) {
            if (this.context.image._xmlHttp.status === 200) {
                const response = JSON.parse(this.context.image._xmlHttp.responseText);

                if (response.errorMessage) {
                    this.closeLoading();
                    if (this._imageUploadError(response.errorMessage, response.result)) {
                        notice.open.call(this, response.errorMessage);
                    }
                } else {
                    const fileList = response.result;
                    for (let i = 0, len = (update && fileList.length > 0 ? 1 : fileList.length); i < len; i++) {
                        this.plugins.image.create_image.call(this, fileList[i].url, linkValue, linkNewWindow, width, align, update, updateElement, {name: fileList[i].name, size: fileList[i].size});
                    }
                }

                this.closeLoading();
            }
            // error
            else {
                notice.open.call(this, '[SUNEDITOR.imageUpload.fail] status: ' + this.context.image._xmlHttp.status + ', responseURL: ' + this.context.image._xmlHttp.responseURL);
                this.closeLoading();
                throw Error('[SUNEDITOR.imageUpload.fail] status: ' + this.context.image._xmlHttp.status + ', responseURL: ' + this.context.image._xmlHttp.responseURL);
            }
        }
    },

    onRender_imgUrl: function () {
        if (this.context.image.imgUrlFile.value.trim().length === 0) return false;
        this.context.image._uploadFileLength = 1;

        try {
            const file = {name: this.context.image.imgUrlFile.value.split('/').pop(), size: 0};
            this.plugins.image.create_image.call(this, this.context.image.imgUrlFile.value, this.context.image._linkValue, this.context.image.imgLinkNewWindowCheck.checked, this.context.image.imageX.value + 'px', this.context.image._align, this.context.dialog.updateModal, this.context.image._element, file);
        } catch (e) {
            notice.open.call(this, '[SUNEDITOR.imageURLRendering.fail] cause : "' + e.message + '"');
            throw Error('[SUNEDITOR.imageURLRendering.fail] cause : "' + e.message + '"');
        } finally {
            this.closeLoading();
        }
    },

    onRender_link: function (imgTag, imgLinkValue, newWindowCheck) {
        if (imgLinkValue.trim().length > 0) {
            const link = this.util.createElement('A');
            link.href = /^https?:\/\//.test(imgLinkValue) ? imgLinkValue : 'http://' + imgLinkValue;
            link.target = (newWindowCheck ? '_blank' : '');
            link.setAttribute('data-image-link', 'image');
            imgTag.setAttribute('data-image-link', imgLinkValue);

            link.appendChild(imgTag);
            return link;
        }

        return imgTag;
    },

    setInputSize: function (xy) {
        if (!this.context.dialog.updateModal) return;

        const contextImage = this.context.image;
        if (contextImage.proportion.checked) {
            if (xy === 'x') {
                contextImage.imageY.value = Math.round((contextImage._element_h / contextImage._element_w) * contextImage.imageX.value);
            } else {
                contextImage.imageX.value = Math.round((contextImage._element_w / contextImage._element_h) * contextImage.imageY.value);
            }
        }
    },

    submit: function (e) {
        const contextImage = this.context.image;
        const imagePlugin = this.plugins.image;
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        contextImage._linkValue = contextImage.imgLink.value;
        contextImage._altText = contextImage.altText.value;
        contextImage._align = contextImage.modal.querySelector('input[name="suneditor_image_radio"]:checked').value;
        contextImage._captionChecked = contextImage.captionCheckEl.checked;
        if (contextImage._resizing) contextImage._proportionChecked = contextImage.proportion.checked;

        try {
            if (this.context.dialog.updateModal) {
                imagePlugin.update_image.call(this);
            }
            
            if (contextImage.imgInputFile && contextImage.imgInputFile.files.length > 0) {
                imagePlugin.onRender_imgInput.call(this);
            } else if (contextImage.imgUrlFile && contextImage.imgUrlFile.value.trim().length > 0) {
                imagePlugin.onRender_imgUrl.call(this);
            } else {
                this.closeLoading();
            }
        } catch (error) {
            this.closeLoading();
            notice.open.call(this, '[SUNEDITOR.image.submit.fail] cause : "' + error.message + '"');
            throw Error('[SUNEDITOR.image.submit.fail] cause : "' + error.message + '"');
        } finally {
            this.plugins.dialog.close.call(this);
        }

        return false;
    },

    _setImagesInfo: function (img, file) {
        let dataIndex = img.getAttribute('data-index');
        if (!dataIndex) {
            dataIndex = this._variable._imageIndex;
            img.setAttribute('data-index', dataIndex);

            this._variable._imagesInfo[dataIndex] = {
                src: img.src,
                index: dataIndex,
                name: file.name,
                size: file.size,
                select: function () {
                    const size = this.plugins.resizing.call_controller_resize.call(this, img, 'image');
                    this.plugins.image.onModifyMode.call(this, img, size);
                    img.scrollIntoView();
                }.bind(this),
                delete: this.plugins.image.destroy.bind(this, img)
            };

            this._variable._imageIndex++;

            img.setAttribute('data-file-name', file.name);
            img.setAttribute('data-file-size', file.size);
        }
        else {
            this._variable._imagesInfo[dataIndex].name = img.getAttribute("data-file-name");
            this._variable._imagesInfo[dataIndex].size = img.getAttribute("data-file-size") * 1;
        }

        this._imageUpload(img, dataIndex, false, this._variable._imagesInfo[dataIndex], --this.context.image._uploadFileLength);
    },

    _onload_image: function (oImg, file) {
        oImg.setAttribute('origin-size', oImg.naturalWidth + ',' + oImg.naturalHeight);
        oImg.setAttribute('data-origin', oImg.offsetWidth + ',' + oImg.offsetHeight);

        if (!file) return;
        this.plugins.image._setImagesInfo.call(this, oImg, file);       
    },

    create_image: function (src, linkValue, linkNewWindow, width, align, update, updateElement, file) {
        if (update) {
            updateElement.src = src;
            return;
        }

        const contextImage = this.context.image;

        let oImg = this.util.createElement('IMG');
        oImg.addEventListener('load', this.plugins.image._onload_image.bind(this, oImg, file));

        oImg.src = src;
        oImg.setAttribute('data-align', align);
        oImg.alt = contextImage._altText;
        oImg = this.plugins.image.onRender_link.call(this, oImg, linkValue, linkNewWindow);
        oImg.setAttribute('data-rotate', '0');

        if (contextImage._resizing) {
            if (/\d+/.test(width)) oImg.style.width = width;
            oImg.setAttribute('data-proportion', contextImage._proportionChecked);
        }

        const cover = this.plugins.resizing.set_cover.call(this, oImg);
        const container = this.plugins.resizing.set_container.call(this, cover, 'se-image-container');

        // caption
        if (contextImage._captionChecked) {
            contextImage._caption = this.plugins.resizing.create_caption.call(this);
            contextImage._caption.setAttribute('contenteditable', false);
            cover.appendChild(contextImage._caption);
        }

        // align
        if ('none' !== align) {
            cover.style.margin = 'auto';
        } else {
            cover.style.margin = '0';
        }
        
        this.util.removeClass(container, contextImage._floatClassRegExp);
        this.util.addClass(container, 'float-' + align);

        if (!contextImage._resizing || !/\d+/.test(width)) {
            this.context.resizing._resize_plugin = 'image';
            contextImage._element = oImg;
            contextImage._cover = cover;
            contextImage._container = container;
            this.plugins.image.setAutoSize.call(this);
        }

        this.insertComponent(container);
    },

    update_image: function (init) {
        const contextImage = this.context.image;
        const linkValue = contextImage._linkValue;
        let imageEl = contextImage._element;
        let cover = contextImage._cover;
        let container = contextImage._container;
        let isNewContainer = false;
        const changeSize = contextImage.imageX.value * 1 !== imageEl.offsetWidth || contextImage.imageY.value * 1 !== imageEl.offsetHeight;

        if (cover === null) {
            isNewContainer = true;
            imageEl = contextImage._element.cloneNode(true);
            cover = this.plugins.resizing.set_cover.call(this, imageEl);
        }

        if (container === null) {
            cover = cover.cloneNode(true);
            isNewContainer = true;
            container = this.plugins.resizing.set_container.call(this, cover, 'se-image-container');
        }
        
        if (isNewContainer) {
            container.innerHTML = '';
            container.appendChild(cover);
        }

        // size
        imageEl.alt = contextImage._altText;

        if (contextImage._resizing) {
            imageEl.setAttribute('data-proportion', contextImage._proportionChecked);
            if (changeSize) this.plugins.image.setSize.call(this, contextImage.imageX.value, contextImage.imageY.value);
        }

        // caption
        if (contextImage._captionChecked) {
            if (!contextImage._caption) {
                contextImage._caption = this.plugins.resizing.create_caption.call(this);
                cover.appendChild(contextImage._caption);
            }
        } else {
            if (contextImage._caption) {
                this.util.removeItem(contextImage._caption);
                contextImage._caption = null;
            }
        }

        // align
        if (contextImage._align && 'none' !== contextImage._align) {
            cover.style.margin = 'auto';
        } else {
            cover.style.margin = '0';
        }

        this.util.removeClass(container, this.context.image._floatClassRegExp);
        this.util.addClass(container, 'float-' + contextImage._align);
        imageEl.setAttribute('data-align', contextImage._align);

        // link
        if (linkValue.trim().length > 0) {
            if (contextImage._linkElement !== null) {
                contextImage._linkElement.href = linkValue;
                contextImage._linkElement.target = (contextImage.imgLinkNewWindowCheck.checked ? '_blank' : '');
                imageEl.setAttribute('data-image-link', linkValue);
            } else {
                let newEl = this.plugins.image.onRender_link.call(this, imageEl, linkValue, this.context.image.imgLinkNewWindowCheck.checked);
                cover.insertBefore(newEl, contextImage._caption);
            }
        }
        else if (contextImage._linkElement !== null) {
            const imageElement = imageEl;

            imageElement.setAttribute('data-image-link', '');
            let newEl = imageElement.cloneNode(true);
            cover.removeChild(contextImage._linkElement);
            cover.insertBefore(newEl, contextImage._caption);
            imageEl = newEl;
        }

        if (isNewContainer) {
            const existElement = this.util.isRangeFormatElement(contextImage._element.parentNode) || this.util.isWysiwygDiv(contextImage._element.parentNode) ? 
                contextImage._element : 
                this.util.getFormatElement(contextImage._element) || contextImage._element;
            existElement.parentNode.insertBefore(container, existElement);
            this.util.removeItem(existElement);
        }

        // transform
        if (!init && (/\d+/.test(imageEl.style.height) || (contextImage._resizing && changeSize) || (this.context.resizing._rotateVertical && contextImage._captionChecked))) {
            this.plugins.resizing.setTransformSize.call(this, imageEl);
        }

        // history stack
        this.history.push();
        if (init) {
            imageEl = container.querySelector('img');
            this.plugins.image.init.call(this);
            const size = this.plugins.resizing.call_controller_resize.call(this, imageEl, 'image');
            this.plugins.image.onModifyMode.call(this, imageEl, size);
        }
    },

    sizeRevert: function () {
        const contextImage = this.context.image;
        if (contextImage._origin_w) {
            contextImage.imageX.value = contextImage._element_w = contextImage._origin_w;
            contextImage.imageY.value = contextImage._element_h = contextImage._origin_h;
        }
    },

    onModifyMode: function (element, size) {
        const contextImage = this.context.image;
        contextImage._linkElement = /^A$/i.test(element.parentNode.nodeName) ? element.parentNode : null;
        contextImage._element = element;
        contextImage._cover = this.util.getParentElement(element, 'FIGURE');
        contextImage._container = this.util.getParentElement(element, '.se-image-container');
        contextImage._caption = this.util.getChildElement(contextImage._cover, 'FIGCAPTION');
        contextImage._align = element.getAttribute('data-align') || 'none';

        contextImage._element_w = size.w;
        contextImage._element_h = size.h;
        contextImage._element_t = size.t;
        contextImage._element_l = size.l;

        let userSize = contextImage._element.getAttribute('data-origin');
        if (userSize) {
            userSize = userSize.split(',');
            contextImage._origin_w = userSize[0] * 1;
            contextImage._origin_h = userSize[1] * 1;
        } else {
            contextImage._origin_w = size.w;
            contextImage._origin_h = size.h;
            contextImage._element.setAttribute('data-origin', size.w + ',' + size.h);
        }
    },

    openModify: function (notOpen) {
        const contextImage = this.context.image;
        contextImage.imgUrlFile.value = contextImage._element.src;
        contextImage.altText.value = contextImage._element.alt;
        contextImage.imgLink.value = contextImage._linkElement === null ? '' : contextImage._linkElement.href;
        contextImage.imgLinkNewWindowCheck.checked = contextImage._linkElement && contextImage._linkElement.target === '_blank';
        contextImage.modal.querySelector('input[name="suneditor_image_radio"][value="' + contextImage._align + '"]').checked = true;
        contextImage._captionChecked = contextImage.captionCheckEl.checked = !!contextImage._caption;

        if (contextImage._resizing) {
            contextImage.proportion.checked = contextImage._proportionChecked = contextImage._element.getAttribute('data-proportion') === 'true';
            contextImage.imageX.value = contextImage._element.offsetWidth;
            contextImage.imageY.value = contextImage._element.offsetHeight;
            contextImage.imageX.disabled = false;
            contextImage.imageY.disabled = false;
            contextImage.proportion.disabled = false;
        }

        if (!notOpen) this.plugins.dialog.open.call(this, 'image', true);
    },

    setSize: function (w, h) {
        const contextImage = this.context.image;
        contextImage._element.style.width = w + 'px';
        contextImage._element.style.height = h + 'px';
    },
    
    setAutoSize: function () {
        const contextImage = this.context.image;

        this.plugins.resizing.resetTransform.call(this, contextImage._element);
        this.plugins.image.cancelPercentAttr.call(this);

        contextImage._element.style.maxWidth = '100%';
        contextImage._element.style.width = '100%';
        contextImage._element.style.height = '';
        contextImage._cover.style.width = '';
        contextImage._cover.style.height = '';
    },

    setPercentSize: function (w) {
        const contextImage = this.context.image;

        contextImage._container.style.width = w;
        contextImage._container.style.height = '';
        contextImage._cover.style.width = '100%';
        contextImage._cover.style.height = '';
        contextImage._element.style.width = '100%';
        contextImage._element.style.height = '';

        if (/100/.test(w)) {
            this.util.removeClass(contextImage._container, this.context.image._floatClassRegExp);
            this.util.addClass(contextImage._container, 'float-center');
        }
    },

    cancelPercentAttr: function () {
        const contextImage = this.context.image;
        
        contextImage._element.style.maxWidth = 'none';
        contextImage._cover.style.width = '';
        contextImage._cover.style.height = '';
        contextImage._container.style.width = '';
        contextImage._container.style.height = '';

        this.util.removeClass(contextImage._container, this.context.image._floatClassRegExp);
        this.util.addClass(contextImage._container, 'float-' + contextImage._align);
    },

    resetAlign: function () {
        const contextImage = this.context.image;

        contextImage._element.setAttribute('data-align', '');
        contextImage._align = 'none';
        contextImage._cover.style.margin = '0';
        this.util.removeClass(contextImage._container, contextImage._floatClassRegExp);
    },

    destroy: function (element) {
        const imageEl = element || this.context.image._element;
        const imageContainer = this.util.getParentElement(imageEl, '.se-image-container') || imageEl;

        const dataIndex = imageEl.getAttribute('data-index');
        
        this.util.removeItem(imageContainer);
        this.plugins.image.init.call(this);

        this.controllersOff();

        if (dataIndex) {
            delete this._variable._imagesInfo[dataIndex];
            this._imageUpload(imageEl, dataIndex, true, null, 0);
        }
    },

    init: function () {
        const contextImage = this.context.image;
        if (contextImage.imgInputFile) contextImage.imgInputFile.value = '';
        if (contextImage.imgUrlFile) contextImage.imgUrlFile.value = '';
        contextImage.altText.value = '';
        contextImage.imgLink.value = '';
        contextImage.imgLinkNewWindowCheck.checked = false;
        contextImage.modal.querySelector('input[name="suneditor_image_radio"][value="none"]').checked = true;
        contextImage.captionCheckEl.checked = false;
        contextImage._element = null;
        this.plugins.image.openTab.call(this, 'init');

        if (contextImage._resizing) {
            const autoWidth = this.context.option.imageWidth === 'auto';

            contextImage.proportion.checked = false;
            contextImage.imageX.value = autoWidth ? '' : this.context.option.imageWidth;
            contextImage.imageY.value = '';
            contextImage.imageX.disabled = autoWidth;
            contextImage.imageY.disabled = true;
            contextImage.proportion.disabled = true;
        }
    }
};
