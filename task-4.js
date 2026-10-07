// ====================== mock async services (given) ======================
var Api = {
    // flip to true to exercise the error path, then Run again
    failTimesheet : false,

    _delay : function (value, ms, fail) {
        var deferred = new Ext.Deferred();
        Ext.defer(function () {
            if (fail) {
                deferred.reject('Network error while loading timesheet');
            } else {
                deferred.resolve(value);
            }
        }, ms);
        return deferred.promise;
    },

    loadProfile : function () {
        return this._delay({ id : 1, name : 'Jane Doe', employeeId : 42 }, 400);
    },

    loadPermissions : function () {
        return this._delay(['view', 'edit', 'approve'], 300);
    },

    loadTimesheet : function (employeeId) {
        var entries = [
            { day : 'Mon', hours : 8 },
            { day : 'Tue', hours : 7 },
            { day : 'Wed', hours : 6 }
        ];
        // note: depends on employeeId from the profile
        return this._delay(entries, 500, this.failTimesheet);
    }
};


Ext.define('App.DashboardController', {
    extend : 'Ext.app.ViewController',
    alias  : 'controller.dashboard',

    onLoadClick : function () {
        this.loadDashboard();
    },
    loadDashboard : function () {
        var me = this,
            view = me.getView(),
            promise;

        view.setLoading(true);

        // Profile and permissions are independent, so load them in parallel.
        promise = Ext.Deferred.all([
            Api.loadProfile(),
            Api.loadPermissions()
        ]).then(function (results) {
            var profile = results[0],
                permissions = results[1];

            // Timesheet depends on the employeeId returned by the profile.
            return Api.loadTimesheet(profile.employeeId).then(function (timesheet) {
                return {
                    profile     : profile,
                    permissions : permissions,
                    timesheet   : timesheet
                };
            });
        }).then(function (data) {
            // Async work may finish after the view has been destroyed.
            if (!view.destroyed) {
                me.renderDashboard(data);
            }

            return data;
        });

        // Centralize cleanup and error handling while preserving the promise result.
        return promise.then(
            function (data) {
                if (!view.destroyed) {
                    view.setLoading(false);
                }

                return data;
            },
            function (error) {
                if (!view.destroyed) {
                    view.setLoading(false);
                    Ext.Msg.alert('Error', String(error));
                }

                throw error;
            }
        );
    },

    // Given: renders the result. Call this on success.
    renderDashboard : function (data) {
        this.lookup('output').setHtml(
            '<div style="padding:8px;font-size:14px">' +
                '<b>' + Ext.String.htmlEncode(data.profile.name) + '</b>' +
                ' · ' + data.permissions.length + ' permissions' +
                ' · ' + data.timesheet.length + ' timesheet entries' +
            '</div>'
        );
    }
});


Ext.application({
    name : 'Fiddle',

    launch : function () {
        Ext.create('Ext.panel.Panel', {
            title       : 'Employee dashboard',
            renderTo    : Ext.getBody(),
            width       : 480,
            bodyPadding : 12,
            controller  : 'dashboard',

            tbar : [
                { text : 'Load dashboard', handler : 'onLoadClick' }
            ],

            items : [
                {
                    xtype     : 'component',
                    reference : 'output',
                    html      : '<div style="padding:8px;color:#999">Press “Load dashboard”.</div>'
                }
            ]
        });
    }
});