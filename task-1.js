Ext.application({
    name : 'Fiddle',

    launch : function () {
        // --- generate a large dataset so widgets are recycled on scroll ---
        var departments = ['HR', 'Payroll', 'Engineering', 'Sales', 'Support'],
            data = [],
            i;

        for (i = 1; i <= 1000; i++) {
            data.push({
                id         : i,
                name       : 'Employee ' + i,
                department : departments[i % departments.length],
                active     : (i % 2 === 0),
                locked     : (i % 7 === 0)
            });
        }

        Ext.create('Ext.grid.Panel', {
            title      : 'Employee roster (' + data.length + ' rows)',
            renderTo   : Ext.getBody(),
            height     : 400,
            width      : 700,
            // buffered rendering is on by default for classic grids;
            // only ~visible rows exist, widgets are pooled & recycled.
            store      : {
                fields : ['id', 'name', 'department', 'active', 'locked'],
                data   : data
            },
            columns : [
                { text : 'ID', dataIndex : 'id', width : 60 },
                { text : 'Name', dataIndex : 'name', flex : 1 },
                { text : 'Department', dataIndex : 'department', width : 120 },
                {
                    text      : 'Active',
                    dataIndex : 'active',
                    width     : 80,
                    renderer  : function (v) {
                        return v
                            ? '<span style="color:#2e7d32">yes</span>'
                            : '<span style="color:#999">no</span>';
                    }
                },
                {
                    text      : 'Locked?',
                    dataIndex : 'locked',
                    width     : 80,
                    renderer  : function (v) { return v ? 'Locked' : ''; }
                },

                // ====================================================
                // NAIVE / BROKEN widget column — THIS is what you fix.
                // ====================================================
                {
                    xtype : 'widgetcolumn',
                    text  : 'Status',
                    width : 170,

                    // state is pushed onto the (recycled) widget
                    // asynchronously. By the time the timer fires, the same
                    // widget instance may already serve a DIFFERENT record.
                    onWidgetAttach : function (col, widget, rec) {
                        Ext.defer(function () {
                            widget.setText(rec.get('active') ? 'Deactivate' : 'Activate');
                            widget.setDisabled(!!rec.get('locked'));
                        }, 30);

                        col._lastRecord = rec;
                    },

                    widget : {
                        xtype   : 'button',
                        handler : function () {
                            var col = this.getWidgetColumn(),
                                rec = col._lastRecord;

                            rec.set('active', !rec.get('active'));
                        }
                    }
                }
            ]
        });
    }
});