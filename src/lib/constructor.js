/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import util from './util';

/**
 * @description document create - call _createToolBar()
 * @param {element} element - textarea
 * @param {JSON} options - user options
 * @param {JSON} lang - user language
 * @param {JSON} _plugins - plugins object
 * @returns {JSON}
 * @private
 */
const _Constructor = {
    init: function (element, options, lang, _plugins) {
        if (typeof options !== 'object') options = {};
    
        /** user options */
        options.lang = lang;
        // toolbar
        options.mode = options.mode || 'classic'; // classic, inline, balloon
        options.toolbarWidth = options.toolbarWidth ? (/^\d+$/.test(options.toolbarWidth) ? options.toolbarWidth + 'px' : options.toolbarWidth) : 'max-content';
        options.stickyToolbar = /balloon/i.test(options.mode) ? -1 : options.stickyToolbar === undefined ? 0 : (/\d+/.test(options.stickyToolbar) ? options.stickyToolbar.toString().match(/\d+/)[0] * 1 : -1);
        // bottom resizing bar
        options.resizingBar = /inline|balloon/i.test(options.mode) ? false : options.resizingBar === undefined ? true : options.resizingBar;
        options.showPathLabel = typeof options.showPathLabel === 'boolean' ? options.showPathLabel : true;
        // popup, editor display
        options.popupDisplay = options.popupDisplay || 'full';
        options.display = options.display || (element.style.display === 'none' || !element.style.display ? 'block' : element.style.display);
        // size
        options.width = options.width ? (/^\d+$/.test(options.width) ? options.width + 'px' : options.width) : (element.clientWidth ? element.clientWidth + 'px' : '100%');
        options.height = options.height ? (/^\d+$/.test(options.height) ? options.height + 'px' : options.height) : (element.clientHeight ? element.clientHeight + 'px' : 'auto');
        options.minHeight = (/^\d+$/.test(options.minHeight) ? options.height + 'px' : options.minHeight) || '';
        options.maxHeight = (/^\d+$/.test(options.maxHeight) ? options.maxHeight + 'px' : options.maxHeight) || '';
        // font, size, color list
        options.font = options.font || null;
        options.fontSize = options.fontSize || null;
        options.colorList = options.colorList || null;
        // images
        options.imageResizing = options.imageResizing === undefined ? true : options.imageResizing;
        options.imageWidth = options.imageWidth || 'auto';
        options.imageFileInput = options.imageFileInput === undefined ? true : options.imageFileInput;
        options.imageUrlInput = (options.imageUrlInput === undefined || !options.imageFileInput) ? true : options.imageUrlInput;
        options.imageUploadHeader = options.imageUploadHeader || null;
        options.imageUploadUrl = options.imageUploadUrl || null;
        // video
        options.videoResizing = options.videoResizing === undefined ? true : options.videoResizing;
        options.videoWidth = options.videoWidth || 560;
        options.videoHeight = options.videoHeight || 315;
        options.youtubeQuery = options.youtubeQuery || '';
        // callBack function
        // options.callBackSave = options.callBackSave;
        // buttons
        options.buttonList = options.buttonList || [
            ['undo', 'redo'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['removeFormat'],
            ['outdent', 'indent'],
            ['fullScreen', 'showBlocks', 'codeView'],
            ['preview', 'print']
        ];
    
        const doc = document;
    
        /** suneditor div */
        const top_div = doc.createElement('DIV');
        top_div.className = 'sun-editor';
        if (element.id) top_div.id = 'suneditor_' + element.id;
        top_div.style.width = options.width;
        top_div.style.display = options.display;
    
        /** relative div */
        const relative = doc.createElement('DIV');
        relative.className = 'se-container';
    
        /** toolbar */
        const tool_bar = this._createToolBar(doc, options.buttonList, _plugins, lang);
        let arrow = null;

        if (/inline/i.test(options.mode)) {
            tool_bar.element.className += ' se-toolbar-inline';
            tool_bar.element.style.width = options.toolbarWidth;
        } else if (/balloon/i.test(options.mode)) {
            tool_bar.element.className += ' se-toolbar-balloon';
            arrow = doc.createElement('DIV');
            arrow.className = 'se-arrow';
            tool_bar.element.appendChild(arrow);
        }

        /** sticky toolbar dummy */
        const sticky_dummy = doc.createElement('DIV');
        sticky_dummy.className = 'se-toolbar-sticky-dummy';
    
        /** inner editor div */
        const editor_div = doc.createElement('DIV');
        editor_div.className = 'se-wrapper';
    
        /** wysiwyg div */
        const wysiwyg_div = doc.createElement('DIV');
        wysiwyg_div.setAttribute('contenteditable', true);
        wysiwyg_div.setAttribute('scrolling', 'auto');
        wysiwyg_div.className = 'se-wrapper-inner se-wrapper-wysiwyg sun-editor-editable';
        wysiwyg_div.style.display = 'block';
        wysiwyg_div.innerHTML = util.convertContentsForEditor(element.value);
        wysiwyg_div.style.height = options.height;
        wysiwyg_div.style.minHeight = options.minHeight;
        wysiwyg_div.style.maxHeight = options.maxHeight;
    
        /** textarea for code view */
        const textarea = doc.createElement('TEXTAREA');
        textarea.className = 'se-wrapper-inner se-wrapper-code';
        textarea.style.display = 'none';
        textarea.style.height = options.height;
        textarea.style.minHeight = options.minHeight;
        textarea.style.maxHeight = options.maxHeight;
    
        /** resize bar */
        let resizing_bar = null;
        if (options.resizingBar) {
            resizing_bar = doc.createElement('DIV');
            resizing_bar.className = 'se-resizing-bar sun-editor-common';
        }
    
        /** navigation */
        const navigation = doc.createElement('DIV');
        navigation.className = 'se-navigation sun-editor-common';
    
        /** loading box */
        const loading_box = doc.createElement('DIV');
        loading_box.className = 'se-loading-box sun-editor-common';
        loading_box.innerHTML = '<div class="se-loading-effect"></div>';
    
        /** resize operation background */
        const resize_back = doc.createElement('DIV');
        resize_back.className = 'se-resizing-back';
    
        /** append html */
        editor_div.appendChild(wysiwyg_div);
        editor_div.appendChild(textarea);
        relative.appendChild(tool_bar.element);
        relative.appendChild(sticky_dummy);
        relative.appendChild(editor_div);
        relative.appendChild(resize_back);
        relative.appendChild(loading_box);

        if (resizing_bar) {
            resizing_bar.appendChild(navigation);
            relative.appendChild(resizing_bar);
        }
        
        top_div.appendChild(relative);
    
        return {
            constructed: {
                _top: top_div,
                _relative: relative,
                _toolBar: tool_bar.element,
                _editorArea: editor_div,
                _wysiwygArea: wysiwyg_div,
                _codeArea: textarea,
                _resizingBar: resizing_bar,
                _navigation: navigation,
                _loading: loading_box,
                _resizeBack: resize_back,
                _stickyDummy: sticky_dummy,
                _arrow: arrow
            },
            options: options,
            plugins: tool_bar.plugins,
            pluginCallButtons: tool_bar.pluginCallButtons
        };
    },

    /**
     * @description Suneditor's Default button list
     * @private
     */
    _defaultButtons: function (lang) {
        return {
            /** command */
            bold: ['_se_command_bold', lang.toolbar.bold + ' (CTRL+B)', 'STRONG', '',
                '<i class="se-icon-bold"></i>'
            ],

            underline: ['_se_command_underline', lang.toolbar.underline + ' (CTRL+U)', 'INS', '',
                '<i class="se-icon-underline"></i>'
            ],

            italic: ['_se_command_italic', lang.toolbar.italic + ' (CTRL+I)', 'EM', '',
                '<i class="se-icon-italic"></i>'
            ],

            strike: ['_se_command_strike', lang.toolbar.strike + ' (CTRL+SHIFT+S)', 'DEL', '',
                '<i class="se-icon-strokethrough"></i>'
            ],

            subscript: ['_se_command_subscript', lang.toolbar.subscript, 'SUB', '',
                '<i class="se-icon-subscript"></i>'
            ],

            superscript: ['_se_command_superscript', lang.toolbar.superscript, 'SUP', '',
                '<i class="se-icon-superscript"></i>'
            ],

            removeFormat: ['', lang.toolbar.removeFormat, 'removeFormat', '',
                '<i class="se-icon-erase"></i>'
            ],

            indent: ['', lang.toolbar.indent + ' (CTRL+])', 'indent', '',
                '<i class="se-icon-indent-right"></i>'
            ],

            outdent: ['_se_command_outdent', lang.toolbar.outdent + ' (CTRL+[)', 'outdent', '',
                '<i class="se-icon-indent-left"></i>'
            ],

            fullScreen: ['code-view-enabled', lang.toolbar.fullScreen, 'fullScreen', '',
                '<i class="se-icon-expansion"></i>'
            ],

            showBlocks: ['', lang.toolbar.showBlocks, 'showBlocks', '',
                '<i class="se-icon-showBlocks"></i>'
            ],

            codeView: ['code-view-enabled', lang.toolbar.codeView, 'codeView', '',
                '<i class="se-icon-code-view"></i>'
            ],

            undo: ['_se_command_undo', lang.toolbar.undo + ' (CTRL+Z)', 'undo', '',
                '<i class="se-icon-undo"></i>', true
            ],

            redo: ['_se_command_redo', lang.toolbar.redo + ' (CTRL+Y / CTRL+SHIFT+Z)', 'redo', '',
                '<i class="se-icon-redo"></i>', true
            ],

            preview: ['', lang.toolbar.preview, 'preview', '',
                '<i class="se-icon-preview"></i>'
            ],

            print: ['', lang.toolbar.print, 'print', '',
                '<i class="se-icon-print"></i>'
            ],

            save: ['_se_command_save', lang.toolbar.save, 'save', '',
                '<i class="se-icon-save"></i>', true
            ],

            /** plugins - submenu */
            font: ['se-btn-select se-btn-tool-font _se_command_font_family', lang.toolbar.font, 'font', 'submenu',
                '<span class="txt">' + lang.toolbar.font + '</span><i class="se-icon-arrow-down"></i>'
            ],
            formatBlock: ['se-btn-select se-btn-tool-format', lang.toolbar.formats, 'formatBlock', 'submenu',
                '<span class="txt _se_command_format">' + lang.toolbar.formats + '</span><i class="se-icon-arrow-down"></i>'
            ],

            fontSize: ['se-btn-select se-btn-tool-size', lang.toolbar.fontSize, 'fontSize', 'submenu',
                '<span class="txt _se_command_font_size">' + lang.toolbar.fontSize + '</span><i class="se-icon-arrow-down"></i>'
            ],

            fontColor: ['', lang.toolbar.fontColor, 'fontColor', 'submenu',
                '<i class="se-icon-fontColor"></i>'
            ],

            hiliteColor: ['', lang.toolbar.hiliteColor, 'hiliteColor', 'submenu',
                '<i class="se-icon-hiliteColor"></i>'
            ],

            align: ['se-btn-align', lang.toolbar.align, 'align', 'submenu',
                '<i class="se-icon-align-left _se_command_align"></i>'
            ],

            list: ['_se_command_list', lang.toolbar.list, 'list', 'submenu',
                '<i class="se-icon-list-number"></i>'
            ],

            horizontalRule: ['btn_line', lang.toolbar.horizontalRule, 'horizontalRule', 'submenu',
                '<i class="se-icon-hr"></i>'
            ],

            table: ['', lang.toolbar.table, 'table', 'submenu',
                '<i class="se-icon-grid"></i>'
            ],

            /** plugins - dialog */
            link: ['', lang.toolbar.link, 'link', 'dialog',
                '<i class="se-icon-link"></i>'
            ],

            image: ['', lang.toolbar.image, 'image', 'dialog',
                '<i class="se-icon-image"></i>'
            ],

            video: ['', lang.toolbar.video, 'video', 'dialog',
                '<i class="se-icon-video"></i>'
            ]
        };
    },

    /**
     * @description Create a group div containing each module
     * @returns {Element}
     * @private
     */
    _createModuleGroup: function (oneModule) {
        const oDiv = util.createElement('DIV');
        oDiv.className = 'se-btn-module' + (oneModule ? '' : ' se-btn-module-border');

        const oUl = util.createElement('UL');
        oUl.className = 'se-menu-list';
        oDiv.appendChild(oUl);

        return {
            'div': oDiv,
            'ul': oUl
        };
    },

    /**
     * @description Create a button element
     * @param {string} buttonClass - className in button
     * @param {string} title - Title in button
     * @param {string} dataCommand - The data-command property of the button
     * @param {string} dataDisplay - The data-display property of the button ('dialog', 'submenu')
     * @param {string} innerHTML - Html in button
     * @param {string} _disabled - Button disabled
     * @returns {Element}
     * @private
     */
    _createButton: function (buttonClass, title, dataCommand, dataDisplay, innerHTML, _disabled) {
        const oLi = util.createElement('LI');
        const oButton = util.createElement('BUTTON');

        oButton.setAttribute('type', 'button');
        oButton.setAttribute('class', 'se-btn-basic' + (dataDisplay === 'submenu' ? ' se-btn-submenu' : '') + (buttonClass ? ' ' + buttonClass : '') + ' se-tooltip');
        oButton.setAttribute('data-command', dataCommand);
        oButton.setAttribute('data-display', dataDisplay);
        innerHTML += '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + title + '</span></span>';

        if (_disabled) oButton.setAttribute('disabled', true);
        
        oButton.innerHTML = innerHTML;
        oLi.appendChild(oButton);

        return {
            'li': oLi,
            'button': oButton
        };
    },

    /**
     * @description Create editor HTML
     * @param {Array} doc - document object
     * @param {Array} buttonList - option.buttonList
     * @param {Array} lang - option.lang
     * @private
     */
    _createToolBar: function (doc, buttonList, _plugins, lang) {
        const separator_vertical = doc.createElement('DIV');
        separator_vertical.className = 'se-toolbar-separator-vertical';

        const tool_bar = doc.createElement('DIV');
        tool_bar.className = 'se-toolbar sun-editor-common';

        /** create button list */
        const defaultButtonList = this._defaultButtons(lang);
        const pluginCallButtons = {};
        const plugins = {};
        if (_plugins) {
            const pluginsValues = _plugins.length ? _plugins : Object.keys(_plugins).map(function(name) { return _plugins[name]; });
            for (let i = 0, len = pluginsValues.length; i < len; i++) {
                plugins[pluginsValues[i].name] = pluginsValues[i];
            }
        }

        let module = null;
        let button = null;
        let moduleElement = null;
        let buttonElement = null;
        let pluginName = '';
        let vertical = false;
        const oneModule = buttonList.length === 1;

        for (let i = 0; i < buttonList.length; i++) {

            const buttonGroup = buttonList[i];
            moduleElement = this._createModuleGroup(oneModule);

            /** button object */
            if (typeof buttonGroup === 'object') {
                for (let j = 0; j < buttonGroup.length; j++) {

                    button = buttonGroup[j];
                    if (typeof button === 'object') {
                        if (typeof button.add === 'function') {
                            pluginName = button.name;
                            module = defaultButtonList[pluginName];
                            plugins[pluginName] = button;
                        } else {
                            pluginName = button.name;
                            module = [button.buttonClass, button.title, button.dataCommand, button.dataDisplay, button.innerHTML];
                        }
                    } else {
                        module = defaultButtonList[button];
                        pluginName = button;
                    }

                    buttonElement = this._createButton(module[0], module[1], module[2], module[3], module[4], module[5]);
                    moduleElement.ul.appendChild(buttonElement.li);

                    if (plugins[pluginName]) {
                        pluginCallButtons[pluginName] = buttonElement.button;
                    }
                }

                if (vertical) tool_bar.appendChild(separator_vertical.cloneNode(false));
                tool_bar.appendChild(moduleElement.div);
                vertical = true;
            }
            /** line break  */
            else if (/^\/$/.test(buttonGroup)) {
                const enterDiv = doc.createElement('DIV');
                enterDiv.className = 'se-btn-module-enter';
                tool_bar.appendChild(enterDiv);
                vertical = false;
            }
        }

        const tool_cover = doc.createElement('DIV');
        tool_cover.className = 'se-toolbar-cover';
        tool_bar.appendChild(tool_cover);

        return {
            'element': tool_bar,
            'plugins': plugins,
            'pluginCallButtons': pluginCallButtons
        };
    }
};

export default _Constructor;