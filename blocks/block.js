( function( blocks, editor, components, i18n, element ) {
    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var TextControl = components.TextControl;

    var __ = i18n.__;

    // Track whether the block has been used
    var blockUsed = false;

    registerBlockType( 'better-video/playlist-block', {
        title: __( 'Playlist Block', 'bbpl-textdomain' ),
        icon: 'playlist-video',
        category: 'common',
        attributes: {
            items: {
                type: 'array',
                default: [],
            },
        },
        edit: function( props ) {
            var items = props.attributes.items;

            function updateItems( newItems ) {
                props.setAttributes( { items: newItems } );
            }

            function addItem() {
                var newItems = items.slice();
                newItems.push( { name: '', url: '' } );
                updateItems( newItems );
            }

            function removeItem( index ) {
                var newItems = items.slice();
                newItems.splice( index, 1 );
                updateItems( newItems );
            }

            // If the block has already been used, prevent adding more items
            if ( blockUsed ) {
                return el(
                    'div',
                    {},
                    items.map( function( item, index ) {
                        return el(
                            'div',
                            { key: index },
                            el( TextControl, {
                                label: __( 'Video Name', 'bbpl-textdomain' ),
                                value: item.name,
                                onChange: function( newName ) {
                                    var newItems = items.slice();
                                    newItems[ index ].name = newName;
                                    updateItems( newItems );
                                },
                            } ),
                            el( TextControl, {
                                label: __( 'Video URL', 'bbpl-textdomain' ),
                                value: item.url,
                                onChange: function( newURL ) {
                                    var newItems = items.slice();
                                    newItems[ index ].url = newURL;
                                    updateItems( newItems );
                                },
                            } ),
                            el(
                                'button',
                                { onClick: function() { removeItem( index ); } },
                                __( 'Remove Video', 'bbpl-textdomain' )
                            )
                        );
                    } )
                );
            }

            // Set blockUsed to true when the block is added
            blockUsed = true;

            return el(
                'div',
                {},
                el(
                    'button',
                    { onClick: addItem },
                    __( 'Add Video', 'bbpl-textdomain' )
                ),
                items.map( function( item, index ) {
                    return el(
                        'div',
                        { key: index },
                        el( TextControl, {
                            label: __( 'Video Name', 'bbpl-textdomain' ),
                            value: item.name,
                            onChange: function( newName ) {
                                var newItems = items.slice();
                                newItems[ index ].name = newName;
                                updateItems( newItems );
                            },
                        } ),
                        el( TextControl, {
                            label: __( 'Video URL', 'bbpl-textdomain' ),
                            value: item.url,
                            onChange: function( newURL ) {
                                var newItems = items.slice();
                                newItems[ index ].url = newURL;
                                updateItems( newItems );
                            },
                        } ),
                        el(
                            'button',
                            { onClick: function() { removeItem( index ); } },
                            __( 'Remove Video', 'bbpl-textdomain' )
                        )
                    );
                } )
            );
        },

        save: function( props ) {
            const items = props.attributes.items;

            if (items.length === 0) {
                return null;
            }

            const ol = el(
                'ol',
                { id: 'bvideo_playlist' },
                items.map( function( item, index ) {
                    return el(
                        'li',
                        { key: index },
                        el( 'a', { href: item.url }, item.name )
                    );
                } )
            );

            return el( 'div', {}, ol );
        },
    } );
} )(
    window.wp.blocks,
    window.wp.editor,
    window.wp.components,
    window.wp.i18n,
    window.wp.element
);
