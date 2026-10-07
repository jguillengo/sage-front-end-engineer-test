Ext.define('App.DirectoryController', {
    extend : 'Ext.app.ViewController',
    alias  : 'controller.directory',

    handleSearchChange : function (field, value) {
        var filters = this.getView().getStore().getFilters();

        // Keep one identified filter so each search by name replaces the previous one.
        if (value) {
            filters.add(new Ext.util.Filter({
                id            : 'nameSearch',
                property      : 'name',
                value         : value,
                anyMatch      : true,
                caseSensitive : false
            }));
        } else {
            filters.removeByKey('nameSearch');
        }
    },

    handleRaise : function () {
        var store = this.getView().getStore(),
            dept  = this.lookup('deptCombo').getValue(),
            raiseMultiplier = 1.1;

        // Batch model updates and always close the update cycle.
        store.beginUpdate();

        try {
            // Include records currently hidden by the live-search filter.
            store.each(function (rec) {
                if (rec.get('department') === dept) {
                    rec.set('salary', rec.get('salary') * raiseMultiplier);
                }
            }, null, { filtered : true });
        } finally {
            store.endUpdate();
        }
    },

    salaryRenderer : function (value, metaData) {
        var salary = Ext.util.Format.currency(value, '$', 0);

        if (value > 50000) {
            metaData.tdStyle = 'color:red;';
        }

        // Keep the returned cell content encoded; styling stays in cell metadata.
        return Ext.String.htmlEncode(salary);
    }
});


Ext.application({
    name : 'Fiddle',

    launch : function () {
        var departments = ['HR', 'Payroll', 'Engineering', 'Sales', 'Support'],
            data = [],
            i;

        for (i = 1; i <= 10000; i++) {
            data.push({
                id         : i,
                name       : 'Employee ' + i,
                department : departments[i % departments.length],
                salary     : 40000 + (i % 50) * 1000
            });
        }

        Ext.create('Ext.grid.Panel', {
            title      : 'Employee directory (' + data.length + ' rows)',
            renderTo   : Ext.getBody(),
            height     : 460,
            width      : 720,
            controller : 'directory',

            store : {
                fields : ['id', 'name', 'department', { name : 'salary', type : 'number' }],
                data   : data
            },

            tbar : [
                'Search:',
                {
                    xtype     : 'textfield',
                    emptyText : 'name contains…',
                    width     : 220,
                    listeners : {
                        // Buffer the change listener so filtering is not repeated on every keystroke.
                        change : {
                            fn     : 'handleSearchChange',
                            buffer : 300
                        }
                    }
                },
                '->',
                'Dept:',
                {
                    xtype     : 'combobox',
                    reference : 'deptCombo',
                    width     : 140,
                    editable  : false,
                    queryMode : 'local',
                    value     : 'Engineering',
                    store     : departments
                },
                {
                    text    : 'Raise 10%',
                    handler : 'handleRaise'
                }
            ],

            columns : [
                { text : 'ID', dataIndex : 'id', width : 70 },
                { text : 'Name', dataIndex : 'name', flex : 1 },
                { text : 'Department', dataIndex : 'department', width : 130 },
                { text : 'Salary', dataIndex : 'salary', width : 130, renderer : 'salaryRenderer' }
            ]
        });
    }
});