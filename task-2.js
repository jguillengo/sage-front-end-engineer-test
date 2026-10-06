Ext.define('App.ux.StarRating', {
    extend : 'Ext.Component',
    xtype  : 'starrating',

    config : {
        value    : 0,
        maxStars : 5
    },

    // bind: '{rating}' targets value, and value changes propagate
    // back through the binding.
    defaultBindProperty : 'value',

    twoWayBindable : {
        value : true
    },

    baseCls : 'app-starrating',

    // Normalize the value before it is stored by the config system.
    applyValue : function (value) {
        value = parseInt(value, 10);

        if (isNaN(value)) {
            value = 0;
        }

        return Math.max(0, Math.min(value, this.getMaxStars()));
    },

    updateValue : function () {
        // Config/binding updates may arrive before the component is rendered.
        if (this.rendered) {
            this.renderStars();
        }
    },

    afterRender : function () {
        this.callParent(arguments);

        // Delegate from the component root so rebuilding the stars does not
        // require rebuilding their click listeners.
        this.getEl().on('click', this.onStarClick, this, {
            delegate : '.app-starrating-star'
        });

        this.renderStars();
    },

    renderStars : function () {
        var value = this.getValue(),
            maxStars = this.getMaxStars(),
            html = [],
            i;

        for (i = 1; i <= maxStars; i++) {
            html.push(
                '<span class="app-starrating-star" ' +
                'data-value="' + i + '" ' +
                'style="cursor:pointer;font-size:24px">' +
                (i <= value ? '&#9733;' : '&#9734;') +
                '</span>'
            );
        }

        this.setHtml(html.join(''));
    },

    onStarClick : function (event, target) {
        this.setValue(
            parseInt(target.getAttribute('data-value'), 10)
        );
    }
});

Ext.application({
    name : 'Fiddle',

    launch : function () {
        Ext.create('Ext.form.Panel', {
            title      : 'Performance review',
            renderTo   : Ext.getBody(),
            width      : 420,
            bodyPadding: 16,

            viewModel : {
                data : { rating : 2 }
            },

            items : [
                {
                    xtype      : 'starrating',
                    fieldLabel : 'Overall rating',   // cosmetic; Component ignores it
                    reference  : 'stars',
                    bind       : '{rating}'
                },
                {
                    xtype  : 'displayfield',
                    margin : '10 0 0 0',
                    bind   : 'You rated: {rating} / 5'
                }
            ],

            buttons : [
                {
                    text    : 'Reset to 5',
                    handler : function (btn) {
                        // VM → component path; don't touch the starrating directly
                        btn.lookupViewModel().set('rating', 5);
                    }
                },
                {
                    text : 'Save',
                    bind : { disabled : '{!rating}' },
                    handler : function (btn) {
                        Ext.Msg.alert('Saved', 'Stored rating = ' + btn.lookupViewModel().get('rating'));
                    }
                }
            ]
        });
    }
});