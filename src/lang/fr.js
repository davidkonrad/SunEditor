/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2019 JiHong Lee.
 * MIT license.
 */
'use strict';

(function (global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = global.document ?
            factory(global, true) :
            function(w) {
                if (!w.document) {
                    throw new Error('SUNEDITOR_LANG a window with a document');
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
    const lang = {
        toolbar: {
            default: 'Défaut',
            save: 'Sauver',
            font: 'Fonte',
            formats: 'Formats',
            fontSize: 'Taille',
            bold: 'Gras',
            underline: 'Souligné',
            italic: 'Italique',
            strike: 'Barré',
            subscript: 'Indice',
            superscript: 'Exposant',
            removeFormat: 'Éffacer  le Formatage',
            fontColor: 'Couleur du texte',
            hiliteColor: 'Couleur en arrière plan',
            indent: 'Indenter',
            outdent: 'Désindenter',
            align: 'Alignenement',
            alignLeft: 'À gauche',
            alignRight: 'À droite',
            alignCenter: 'Centrer',
            alignJustify: 'Justifier',
            list: 'Liste',
            orderList: 'Ordonnée',
            unorderList: 'Non-ordonnée',
            horizontalRule: 'Ligne horizontale',
            hr_solid: 'Solide',
            hr_dotted: 'Points',
            hr_dashed: 'Tirets',
            table: 'Table',
            link: 'Lien',
            image: 'Image',
            video: 'Video',
            fullScreen: 'Plein écran',
            showBlocks: 'Voir les blocs',
            codeView: 'Voir le code',
            undo: 'Annuler',
            redo: 'Refaire',
            preview: 'Previsualiser',
            print: 'Imprimer',
            tag_p: 'Paragraphe',
            tag_div: 'Normal (DIV)',
            tag_h: 'Entête',
            tag_quote: 'Guillemet',
            pre: 'Code'
        },
        dialogBox: {
            linkBox: {
                title: 'Inserer un Lien',
                url: 'Adresse URL du lien',
                text: 'Texte a afficher',
                newWindowCheck: 'Ouvrir ds une nouvelle fenêtre'
            },
            imageBox: {
                title: 'Inserer une image',
                file: 'Sélectionner le fichier',
                url: 'Adresse URL du fichier',
                altText: 'Texte Alternatif'
            },
            videoBox: {
                title: 'Inserer une Video',
                url: 'URL d’intégration du média, YouTube'
            },
            caption: 'Inserer une description',
            close: 'Fermer',
            submitButton: 'Appliquer',
            revertButton: 'Revenir en arrière',
            proportion: 'Maintenir le rapport hauteur/largeur',
            width: 'Largeur',
            height: 'Hauteur',
            basic: 'Basique',
            left: 'Gauche',
            right: 'Droite',
            center: 'Centré'
        },
        controller: {
            edit: 'Modifier',
            remove: 'Effacer',
            insertRowAbove: 'Inserer une ligne en dessous',
            insertRowBelow: 'Inserer une ligne au dessus',
            deleteRow: 'Effacer la ligne',
            insertColumnBefore: 'Inserer une colonne avant',
            insertColumnAfter: 'Inserer une colonne après',
            deleteColumn: 'Effacer la colonne',
            resize100: 'Redimensionner à 100%',
            resize75: 'Redimensionner à 75%',
            resize50: 'Redimensionner à 50%',
            resize25: 'Redimensionner à 25%',
            mirrorHorizontal: 'Mirroir, Horizontal',
            mirrorVertical: 'Mirroir, Vertical',
            rotateLeft: 'Rotation à gauche',
            rotateRight: 'Rotation à droite',
            maxSize: 'Taille max',
            minSize: 'Taille min',
            tableHeader: 'En-tête de table',
            mergeCells: 'Fusionner les cellules',
            splitCells: 'Diviser les Cellules',
            HorizontalSplit: 'Scission horizontale',
            VerticalSplit: 'Scission verticale'
        }
    };

    if (typeof noGlobal === typeof undefined) {
        if (!window.SUNEDITOR_LANG) {
            window.SUNEDITOR_LANG = {};
        }

        window.SUNEDITOR_LANG.fr = lang;
    }

    return lang;
}));
